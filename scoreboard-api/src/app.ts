import { swaggerUI } from "@hono/swagger-ui"
import { Scalar } from "@scalar/hono-api-reference"
import { type Context, Hono, type Next } from "hono"
import { cors } from "hono/cors"
import { openAPIRouteHandler } from "hono-openapi"
import { ZodError, type ZodType, z } from "zod"

import { SessionIdSchema } from "./domain/ids"
import { LessonIdSchema } from "./domain/lessons"
import { isApprovedNickname } from "./domain/nickname"
import type { ScoreboardRepository, ScoreSubmission } from "./repositories/scoreboard-repository"
import {
  type CreateSessionInput,
  RequestError,
  ScoreboardService,
} from "./services/scoreboard-service"
import { AnswerLogSchema } from "./validators/schemas"

const CreateSessionSchema = z.object({
  lessonId: LessonIdSchema,
  participationCode: z.string().min(4).max(12).optional(),
})

const RerollNicknameSchema = z.object({
  sessionId: SessionIdSchema,
})

const SubmitScoreSchema = z.object({
  sessionId: SessionIdSchema,
  lessonId: LessonIdSchema,
  nickname: z.string().min(1).max(40).refine(isApprovedNickname),
  participationCode: z.string().min(4).max(12).optional(),
  clientScore: z.string().regex(/^-?[0-9]+$/),
  clientCorrectCount: z.number().int().min(0).max(10),
  playTimeMs: z.number().int().min(0).max(3_600_000),
  answers: AnswerLogSchema,
  rewardResult: z.unknown().optional(),
})

const LeaderboardQuerySchema = z.object({
  lessonId: LessonIdSchema,
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

const ParticipationLeaderboardQuerySchema = LeaderboardQuerySchema.extend({
  participationCode: z.string().min(4).max(12),
})

type AppDeps = {
  readonly repository: ScoreboardRepository
  readonly now?: () => Date
  readonly random?: () => number
  readonly frontendOrigins?: readonly string[]
}

type ParseResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly response: Response }

const parseJson = async <T>(c: Context, schema: ZodType<T>): Promise<ParseResult<T>> => {
  try {
    const payload = await c.req.json()
    const parsed = schema.safeParse(payload)
    if (!parsed.success) {
      return {
        ok: false,
        response: c.json({ error: "invalid_request", details: parsed.error.issues }, 400),
      }
    }
    return { ok: true, value: parsed.data }
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, response: c.json({ error: "invalid_json" }, 400) }
    }
    throw error
  }
}

const optionalParticipationInput = (
  input: z.infer<typeof CreateSessionSchema>,
): CreateSessionInput =>
  input.participationCode
    ? { lessonId: input.lessonId, participationCode: input.participationCode }
    : { lessonId: input.lessonId }

const toLeaderboardEntries = (submissions: readonly ScoreSubmission[]) =>
  submissions.map((submission, index) => ({
    rank: index + 1,
    nickname: submission.nickname,
    score: submission.score.toString(),
    correctCount: submission.correctCount,
    lessonId: submission.lessonId,
    weekStart: submission.weekStart,
    rewardResult: parseRewardResult(submission.rewardResultJson),
  }))

const parseRewardResult = (rewardResultJson: string): unknown => {
  try {
    return JSON.parse(rewardResultJson)
  } catch {
    return null
  }
}

const createRateLimiter = () => {
  const hits = new Map<string, { count: number; resetAt: number }>()
  const windowMs = 60_000
  const maxHits = 240

  return async (c: Context, next: Next) => {
    const key = c.req.header("x-forwarded-for") ?? c.req.header("cf-connecting-ip") ?? "local"
    const now = Date.now()
    const current = hits.get(key)
    if (!current || current.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }
    if (current.count >= maxHits) {
      return c.json({ error: "rate_limited" }, 429)
    }
    hits.set(key, { count: current.count + 1, resetAt: current.resetAt })
    return next()
  }
}

const requestErrorResponse = (c: Context, error: RequestError) => {
  const body = { error: error.code, details: error.details }
  switch (error.status) {
    case 400:
      return c.json(body, 400)
    case 404:
      return c.json(body, 404)
    case 409:
      return c.json(body, 409)
    case 422:
      return c.json(body, 422)
    case 429:
      return c.json(body, 429)
    default:
      return c.json(body, 500)
  }
}

export const createApp = (deps: AppDeps): Hono => {
  const app = new Hono()
  const service = new ScoreboardService({
    repository: deps.repository,
    now: deps.now ?? (() => new Date()),
    random: deps.random ?? Math.random,
  })

  app.use(
    "*",
    cors({
      origin: (origin) => {
        if (!origin) return "*"
        if (!deps.frontendOrigins || deps.frontendOrigins.length === 0) return origin
        return deps.frontendOrigins.includes(origin) ? origin : (deps.frontendOrigins[0] ?? origin)
      },
    }),
  )
  app.use("/api/*", createRateLimiter())

  app.onError((error, c) => {
    if (error instanceof RequestError) {
      return requestErrorResponse(c, error)
    }
    if (error instanceof ZodError) {
      return c.json({ error: "invalid_request", details: error.issues }, 400)
    }
    console.error(error)
    return c.json({ error: "internal_server_error" }, 500)
  })

  app.get("/health", (c) => c.json({ status: "ok" }))

  app.post("/api/v1/sessions", async (c) => {
    const parsed = await parseJson(c, CreateSessionSchema)
    if (!parsed.ok) return parsed.response

    const session = await service.createSession(optionalParticipationInput(parsed.value))
    return c.json(
      {
        sessionId: session.id,
        lessonId: session.lessonId,
        seed: session.seed,
        nickname: session.nickname,
        expiresAt: session.expiresAt.toISOString(),
      },
      201,
    )
  })

  app.post("/api/v1/sessions/:sessionId/nickname-reroll", async (c) => {
    const parsed = RerollNicknameSchema.parse({ sessionId: c.req.param("sessionId") })
    const session = await service.rerollNickname(parsed.sessionId)
    return c.json({ sessionId: session.id, nickname: session.nickname })
  })

  app.post("/api/v1/scores", async (c) => {
    const parsed = await parseJson(c, SubmitScoreSchema)
    if (!parsed.ok) return parsed.response
    const body = parsed.value
    const submission = await service.submitScore({
      sessionId: body.sessionId,
      lessonId: body.lessonId,
      nickname: body.nickname,
      clientScore: body.clientScore,
      clientCorrectCount: body.clientCorrectCount,
      playTimeMs: body.playTimeMs,
      answers: body.answers,
      rewardResult: body.rewardResult,
      ...(body.participationCode ? { participationCode: body.participationCode } : {}),
    })

    return c.json(
      {
        submissionId: submission.id,
        lessonId: submission.lessonId,
        nickname: submission.nickname,
        score: submission.score.toString(),
        correctCount: submission.correctCount,
        maxScore: submission.maxScore.toString(),
        status: submission.status,
        flagReasons: submission.flagReasons,
        weekStart: submission.weekStart,
        rewardResult: parseRewardResult(submission.rewardResultJson),
      },
      201,
    )
  })

  app.get("/api/v1/leaderboards/weekly", async (c) => {
    const query = LeaderboardQuerySchema.parse(Object.fromEntries(new URL(c.req.url).searchParams))
    const entries = await service.weeklyLeaderboard(query)
    return c.json({ entries: toLeaderboardEntries(entries) })
  })

  app.get("/api/v1/leaderboards/participation", async (c) => {
    const query = ParticipationLeaderboardQuerySchema.parse(
      Object.fromEntries(new URL(c.req.url).searchParams),
    )
    const entries = await service.participationLeaderboard(query)
    return c.json({ entries: toLeaderboardEntries(entries) })
  })

  app.get(
    "/openapi.json",
    openAPIRouteHandler(app, {
      documentation: {
        info: {
          title: "Eduitit Mathmon Scoreboard API",
          version: "0.1.0",
        },
      },
    }),
  )
  app.get("/docs", Scalar({ url: "/openapi.json", pageTitle: "Mathmon Scoreboard API" }))
  app.get("/swagger", swaggerUI({ url: "/openapi.json", title: "Mathmon Scoreboard API" }))

  return app
}
