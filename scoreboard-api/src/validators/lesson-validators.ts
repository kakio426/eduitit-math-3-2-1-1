import type { LessonId } from "../domain/lessons"
import type { AnswerLogItem, RewardEvent } from "./schemas"

export const VALIDATION_STATUS = {
  accepted: "accepted",
  flagged: "flagged",
  rejected: "rejected",
} as const

export type ValidationStatus = (typeof VALIDATION_STATUS)[keyof typeof VALIDATION_STATUS]

export type LessonValidationInput = {
  readonly lessonId: LessonId
  readonly seed: number
  readonly answers: readonly AnswerLogItem[]
  readonly playTimeMs: number
}

export type LessonValidationResult = {
  readonly status: ValidationStatus
  readonly score: bigint
  readonly correctCount: number
  readonly maxScore: bigint
  readonly flagReasons: readonly string[]
}

type RewardRule = {
  readonly id: string
  readonly min: number
  readonly max: number
  readonly empties?: true
  readonly pause?: true
}

type ProgressRule = {
  readonly rules: readonly RewardRule[]
  readonly mistakeId: string
  readonly baseForPerfect: number
  readonly maxScore: number
  readonly earlyFinishRewardId?: string
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(value, max))

const isPerfectAnswer = (answer: AnswerLogItem): boolean =>
  answer.steps.every((step) => String(step.selected) === String(step.expected))

const reject = (flagReasons: readonly string[]): LessonValidationResult => ({
  status: VALIDATION_STATUS.rejected,
  score: 0n,
  correctCount: 0,
  maxScore: 0n,
  flagReasons,
})

const findStructuralFlags = (
  answers: readonly AnswerLogItem[],
  playTimeMs: number,
  earlyFinishRewardId = "",
): readonly string[] => {
  const flags: string[] = []
  const lastRewardId = answers.at(-1)?.reward?.id
  const allowsEarlyFinish = lastRewardId === earlyFinishRewardId
  if (answers.length !== 10 && !allowsEarlyFinish) flags.push("answer_count_must_be_10")
  if (playTimeMs < 5_000) flags.push("play_time_too_short")

  const seen = new Set<number>()
  for (const answer of answers) {
    if (seen.has(answer.questionIndex)) flags.push("duplicate_question_index")
    seen.add(answer.questionIndex)
  }
  return flags
}

const findRewardRule = (rules: readonly RewardRule[], reward: RewardEvent): RewardRule | null =>
  rules.find((rule) => rule.id === reward.id) ?? null

const validateReward = (
  reward: RewardEvent | undefined,
  rules: readonly RewardRule[],
  perfect: boolean,
  mistakeId: string,
): readonly string[] => {
  if (!reward) return ["missing_reward_event"]
  const rule = findRewardRule(rules, reward)
  if (!rule) return ["unknown_reward_event"]
  if (perfect && reward.id === mistakeId) return ["reward_not_allowed_for_answer"]
  if (!perfect && reward.id !== mistakeId) return ["reward_not_allowed_for_answer"]
  if (reward.amount < rule.min || reward.amount > rule.max) return ["reward_amount_out_of_range"]
  return []
}

const validateProgressLesson = (
  input: LessonValidationInput,
  progressRule: ProgressRule,
): LessonValidationResult => {
  const structuralFlags = findStructuralFlags(
    input.answers,
    input.playTimeMs,
    progressRule.earlyFinishRewardId,
  )
  if (structuralFlags.length > 0) return reject(structuralFlags)

  const flags: string[] = []
  let score = 0
  let correctCount = 0

  for (const answer of input.answers) {
    const perfect = isPerfectAnswer(answer)
    const rewardFlags = validateReward(
      answer.reward,
      progressRule.rules,
      perfect,
      progressRule.mistakeId,
    )
    flags.push(...rewardFlags)
    if (!answer.reward) continue

    const rule = findRewardRule(progressRule.rules, answer.reward)
    if (!rule) continue
    if (perfect) correctCount += 1
    if (rule.empties) {
      score = 0
    } else {
      const base = perfect && !rule.pause ? progressRule.baseForPerfect : 0
      score = clamp(score + base + answer.reward.amount, 0, progressRule.maxScore)
    }
  }

  if (flags.length > 0) return reject([...new Set(flags)])
  return {
    status: VALIDATION_STATUS.accepted,
    score: BigInt(score),
    correctCount,
    maxScore: BigInt(progressRule.maxScore),
    flagReasons: [],
  }
}

const BOX_REWARD_RULES = [
  { id: "add_100", min: 100, max: 100 },
  { id: "add_1000", min: 1_000, max: 1_000 },
  { id: "add_100000", min: 100_000, max: 100_000 },
  { id: "subtract_500", min: -500, max: -500 },
  { id: "subtract_5000", min: -5_000, max: -5_000 },
  { id: "subtract_100000", min: -100_000, max: -100_000 },
  { id: "multiply_2", min: 2, max: 2 },
  { id: "multiply_5", min: 5, max: 5 },
  { id: "multiply_10", min: 10, max: 10 },
  { id: "divide_2", min: 2, max: 2 },
  { id: "divide_3", min: 3, max: 3 },
  { id: "rescue", min: 500, max: 500 },
  { id: "zero", min: 0, max: 0, empties: true },
  { id: "broken", min: -50_000_000_000, max: 100 },
] as const

const ROCKET_RULE: ProgressRule = {
  baseForPerfect: 0,
  maxScore: 100,
  mistakeId: "leak",
  earlyFinishRewardId: "instantLaunch",
  rules: [
    { id: "normal", min: 4, max: 8 },
    { id: "smallExplosion", min: -10, max: -5 },
    { id: "megaFuel", min: 12, max: 20 },
    { id: "instantLaunch", min: 6, max: 6 },
    { id: "emptyTank", min: 0, max: 0, empties: true },
    { id: "rainbowFuel", min: 10, max: 10 },
    { id: "leak", min: -18, max: -8 },
  ],
}

const ISLAND_RULE: ProgressRule = {
  baseForPerfect: 5,
  maxScore: 100,
  mistakeId: "shaky",
  rules: [
    { id: "tailwind", min: 2, max: 5 },
    { id: "headwind", min: -8, max: -4 },
    { id: "pause", min: 0, max: 0, pause: true },
    { id: "gust", min: 8, max: 13 },
    { id: "rainbow", min: 14, max: 14 },
    { id: "shaky", min: -14, max: -8 },
  ],
}

const FUSION_RULE: ProgressRule = {
  baseForPerfect: 0,
  maxScore: 100,
  mistakeId: "leak",
  rules: [
    { id: "normal", min: 7, max: 13 },
    { id: "smallExplosion", min: -9, max: -4 },
    { id: "megaFuel", min: 18, max: 30 },
    { id: "instantLaunch", min: 10, max: 10 },
    { id: "emptyTank", min: 0, max: 0, empties: true },
    { id: "rainbowFuel", min: 16, max: 16 },
    { id: "leak", min: -18, max: -8 },
  ],
}

const applyBoxReward = (score: bigint, reward: RewardEvent): bigint => {
  switch (reward.id) {
    case "add_100":
    case "add_1000":
    case "add_100000":
    case "subtract_500":
    case "subtract_5000":
    case "subtract_100000":
      return score + BigInt(reward.amount)
    case "multiply_2":
    case "multiply_5":
    case "multiply_10":
      return score * BigInt(reward.amount)
    case "divide_2":
    case "divide_3":
      return score / BigInt(reward.amount)
    case "rescue":
      return score < 0n ? -score : score + BigInt(reward.amount)
    case "zero":
      return 0n
    case "broken":
      return score + BigInt(reward.amount)
    default:
      return score
  }
}

const validateBoxRun = (input: LessonValidationInput): LessonValidationResult => {
  const structuralFlags = findStructuralFlags(input.answers, input.playTimeMs)
  if (structuralFlags.length > 0) return reject(structuralFlags)

  const flags: string[] = []
  let score = 0n
  let combo = 0
  let correctCount = 0

  for (const answer of input.answers) {
    const perfect = isPerfectAnswer(answer)
    const rewardFlags = validateReward(answer.reward, BOX_REWARD_RULES, perfect, "broken")
    flags.push(...rewardFlags)
    if (!answer.reward) continue
    if (perfect) {
      combo += 1
      correctCount += 1
      score += 100n * BigInt(Math.min(combo, 5))
    } else {
      combo = 0
    }
    score = applyBoxReward(score, answer.reward)
  }

  if (flags.length > 0) return reject([...new Set(flags)])
  return {
    status: VALIDATION_STATUS.accepted,
    score,
    correctCount,
    maxScore: 50_000_000_000n,
    flagReasons: [],
  }
}

export const validateLessonSubmission = (input: LessonValidationInput): LessonValidationResult => {
  switch (input.lessonId) {
    case "3-2-1-1-mathmon-box-run":
      return validateBoxRun(input)
    case "3-2-1-2-mathmon-rocket-charge":
      return validateProgressLesson(input, ROCKET_RULE)
    case "3-2-1-3-mathmon-jump-islands":
      return validateProgressLesson(input, ISLAND_RULE)
    case "3-2-1-4-mathmon-fusion":
      return validateProgressLesson(input, FUSION_RULE)
    default:
      return reject(["unsupported_lesson"])
  }
}
