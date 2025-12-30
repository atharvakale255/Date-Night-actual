import { z } from 'zod';
import { insertPlayerSchema, rooms, players, questions, responses, insertResponseSchema, type CreateRoomRequest, type JoinRoomRequest } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  rooms: {
    create: {
      method: 'POST' as const,
      path: '/api/rooms',
      input: z.object({ name: z.string().min(1), avatar: z.string().optional(), metDate: z.string().optional() }),
      responses: {
        201: z.object({ roomCode: z.string(), playerId: z.number(), roomId: z.number() }),
        400: errorSchemas.validation,
      },
    },
    join: {
      method: 'POST' as const,
      path: '/api/rooms/join',
      input: z.object({ code: z.string().length(4), name: z.string().min(1), avatar: z.string().optional() }),
      responses: {
        200: z.object({ playerId: z.number(), roomId: z.number() }),
        404: errorSchemas.notFound,
        400: errorSchemas.validation,
      },
    },
    status: {
      method: 'GET' as const,
      path: '/api/rooms/:code/status',
      responses: {
        200: z.object({
          room: z.custom<typeof rooms.$inferSelect>(),
          players: z.array(z.custom<typeof players.$inferSelect>()),
          questions: z.array(z.custom<typeof questions.$inferSelect>()), // All questions for current session
          responses: z.array(z.custom<typeof responses.$inferSelect>()),
        }),
        404: errorSchemas.notFound,
      },
    },
    nextPhase: {
      method: 'POST' as const,
      path: '/api/rooms/:code/next',
      input: z.object({ phase: z.string().optional(), round: z.number().optional() }),
      responses: {
        200: z.custom<typeof rooms.$inferSelect>(),
      },
    },
  },
  responses: {
    submit: {
      method: 'POST' as const,
      path: '/api/responses',
      input: insertResponseSchema,
      responses: {
        201: z.custom<typeof responses.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  picks: {
    random: {
      method: 'GET' as const,
      path: '/api/picks/random',
      responses: {
        200: z.object({
          type: z.string(),
          content: z.string(),
        }).optional(),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
