import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  phase: text("phase").notNull().default("dashboard"), // dashboard, quiz, this_that, likely, dare, summary, movie_night, music_together
  round: integer("round").notNull().default(0),
  metDate: timestamp("met_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"), // emoji
  score: integer("score").default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // quiz, this_that, likely, dare
  text: text("text").notNull(),
  options: jsonb("options"), // Array of strings for choices
});

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  playerId: integer("player_id").notNull(),
  questionId: integer("question_id").notNull(),
  answer: text("answer").notNull(),
});

// === RELATIONS ===
export const roomsRelations = relations(rooms, ({ many }) => ({
  players: many(players),
  responses: many(responses),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  room: one(rooms, {
    fields: [players.roomId],
    references: [rooms.id],
  }),
  responses: many(responses),
}));

export const responsesRelations = relations(responses, ({ one }) => ({
  room: one(rooms, {
    fields: [responses.roomId],
    references: [rooms.id],
  }),
  player: one(players, {
    fields: [responses.playerId],
    references: [players.id],
  }),
  question: one(questions, {
    fields: [responses.questionId],
    references: [questions.id],
  }),
}));

// === SCHEMAS ===

export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true, createdAt: true });
export const insertPlayerSchema = createInsertSchema(players).omit({ id: true, joinedAt: true, score: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });
export const insertResponseSchema = createInsertSchema(responses).omit({ id: true });

// === TYPES ===

export type Room = typeof rooms.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Response = typeof responses.$inferSelect;

export type CreateRoomRequest = { name: string; avatar?: string };
export type JoinRoomRequest = { code: string; name: string; avatar?: string };

export type GameState = {
  room: Room;
  players: Player[];
  currentQuestion?: Question;
  responses: Response[];
};
