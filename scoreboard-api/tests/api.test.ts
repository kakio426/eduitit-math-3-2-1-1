import { describe, expect, test } from "bun:test"
import { z } from "zod"

import { createApp } from "../src/app"
import { createMemoryRepository } from "../src/repositories/memory-repository"
import type { AnswerLogItem } from "../src/validators/schemas"

const jsonHeaders = { "content-type": "application/json" } as const

const SessionResponseSchema = z.object({
  sessionId: z.string().uuid(),
  lessonId: z.string(),
  seed: z.number().int(),
  nickname: z.string(),
  expiresAt: z.string(),
})

const ScoreResponseSchema = z.object({
  submissionId: z.string().uuid(),
  lessonId: z.string(),
  nickname: z.string(),
  score: z.string(),
  correctCount: z.number().int(),
  maxScore: z.string(),
  status: z.string(),
  flagReasons: z.array(z.string()),
  weekStart: z.string(),
})

const LeaderboardResponseSchema = z.object({
  entries: z.array(
    z.object({
      rank: z.number().int(),
      nickname: z.string(),
      score: z.string(),
      correctCount: z.number().int(),
      lessonId: z.string(),
      weekStart: z.string(),
      rewardResult: z.unknown(),
    }),
  ),
})

const createRocketAnswers = (): readonly AnswerLogItem[] =>
  Array.from({ length: 10 }, (_value, index) => ({
    questionIndex: index,
    elapsedMs: 4200,
    steps: [
      { stepId: "ones", selected: 6, expected: 6, elapsedMs: 900 },
      { stepId: "tens", selected: 12, expected: 12, elapsedMs: 1100 },
      { stepId: "hundreds", selected: 15, expected: 15, elapsedMs: 1200 },
    ],
    reward: { id: "normal", amount: 5 },
  }))

describe("scoreboard api", () => {
  test("Given a new session When submitting a valid score Then leaderboard hides private fields", async () => {
    const repository = createMemoryRepository()
    const app = createApp({
      repository,
      now: () => new Date("2026-07-01T00:00:00.000Z"),
      random: () => 0.42,
    })

    const sessionResponse = await app.request("/api/v1/sessions", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        lessonId: "3-2-1-2-mathmon-rocket-charge",
        participationCode: "M7K2Q",
      }),
    })
    const sessionBody = SessionResponseSchema.parse(await sessionResponse.json())

    expect(sessionResponse.status).toBe(201)
    expect(sessionBody.nickname).toBe("튼튼 로켓 43")

    const scoreResponse = await app.request("/api/v1/scores", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        sessionId: sessionBody.sessionId,
        lessonId: "3-2-1-2-mathmon-rocket-charge",
        nickname: sessionBody.nickname,
        participationCode: "M7K2Q",
        clientScore: "999999",
        clientCorrectCount: 10,
        playTimeMs: 62000,
        answers: createRocketAnswers(),
        rewardResult: { destinationId: "neptune" },
      }),
    })
    const scoreBody = ScoreResponseSchema.parse(await scoreResponse.json())

    expect(scoreResponse.status).toBe(201)
    expect(scoreBody.score).toBe("50")
    expect(scoreBody.status).toBe("flagged")
    expect(scoreBody.flagReasons).toContain("client_score_mismatch")

    const leaderboardResponse = await app.request(
      "/api/v1/leaderboards/weekly?lessonId=3-2-1-2-mathmon-rocket-charge",
    )
    const leaderboardBody = LeaderboardResponseSchema.parse(await leaderboardResponse.json())

    expect(leaderboardResponse.status).toBe(200)
    expect(leaderboardBody.entries[0]).toEqual({
      rank: 1,
      nickname: "튼튼 로켓 43",
      score: "50",
      correctCount: 10,
      lessonId: "3-2-1-2-mathmon-rocket-charge",
      weekStart: "2026-06-29",
      rewardResult: { destinationId: "neptune" },
    })
    expect(JSON.stringify(leaderboardBody)).not.toContain("M7K2Q")
    expect(JSON.stringify(leaderboardBody)).not.toContain("sessionId")
  })

  test("Given a server nickname When submitting free text Then the score is rejected", async () => {
    const app = createApp({
      repository: createMemoryRepository(),
      now: () => new Date("2026-07-01T00:00:00.000Z"),
      random: () => 0.42,
    })
    const sessionResponse = await app.request("/api/v1/sessions", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ lessonId: "3-2-1-2-mathmon-rocket-charge" }),
    })
    const sessionBody = SessionResponseSchema.parse(await sessionResponse.json())

    const scoreResponse = await app.request("/api/v1/scores", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        sessionId: sessionBody.sessionId,
        lessonId: "3-2-1-2-mathmon-rocket-charge",
        nickname: "우리학교 3학년 김민수",
        clientScore: "50",
        clientCorrectCount: 10,
        playTimeMs: 62000,
        answers: createRocketAnswers(),
      }),
    })

    expect(scoreResponse.status).toBe(400)
  })

  test("Given a submitted session When submitting again Then duplicate is rejected", async () => {
    const app = createApp({
      repository: createMemoryRepository(),
      now: () => new Date("2026-07-01T00:00:00.000Z"),
      random: () => 0.42,
    })
    const sessionResponse = await app.request("/api/v1/sessions", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ lessonId: "3-2-1-2-mathmon-rocket-charge" }),
    })
    const sessionBody = SessionResponseSchema.parse(await sessionResponse.json())
    const body = JSON.stringify({
      sessionId: sessionBody.sessionId,
      lessonId: "3-2-1-2-mathmon-rocket-charge",
      nickname: sessionBody.nickname,
      clientScore: "50",
      clientCorrectCount: 10,
      playTimeMs: 62000,
      answers: createRocketAnswers(),
    })

    await app.request("/api/v1/scores", { method: "POST", headers: jsonHeaders, body })
    const duplicateResponse = await app.request("/api/v1/scores", {
      method: "POST",
      headers: jsonHeaders,
      body,
    })

    expect(duplicateResponse.status).toBe(409)
  })
})
