import { db } from "./db";
import {
  rooms, players, questions, responses,
  type Room, type Player, type Question, type Response,
  type CreateRoomRequest, type JoinRoomRequest,
  insertRoomSchema, insertPlayerSchema, insertResponseSchema,
  insertQuestionSchema
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Rooms
  createRoom(code: string): Promise<Room>;
  getRoomByCode(code: string): Promise<Room | undefined>;
  updateRoomPhase(id: number, phase: string, round: number): Promise<Room>;
  updateRoomMetDate(id: number, metDate: Date): Promise<Room>;

  // Players
  createPlayer(roomId: number, name: string, avatar: string): Promise<Player>;
  getPlayersByRoomId(roomId: number): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;

  // Questions
  getQuestionsByCategory(category: string): Promise<Question[]>;
  getAllQuestions(): Promise<Question[]>;
  seedQuestions(questions: any[]): Promise<void>;

  // Responses
  createResponse(response: any): Promise<Response>;
  getResponsesByRoomId(roomId: number): Promise<Response[]>;
}

export class DatabaseStorage implements IStorage {
  async createRoom(code: string): Promise<Room> {
    const [room] = await db.insert(rooms).values({ code, phase: "lobby", round: 0 }).returning();
    return room;
  }

  async getRoomByCode(code: string): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.code, code));
    return room;
  }

  async updateRoomPhase(id: number, phase: string, round: number): Promise<Room> {
    const [room] = await db.update(rooms)
      .set({ phase, round })
      .where(eq(rooms.id, id))
      .returning();
    return room;
  }

  async updateRoomMetDate(id: number, metDate: Date): Promise<Room> {
    const [room] = await db.update(rooms)
      .set({ metDate })
      .where(eq(rooms.id, id))
      .returning();
    return room;
  }

  async createPlayer(roomId: number, name: string, avatar: string): Promise<Player> {
    const [player] = await db.insert(players)
      .values({ roomId, name, avatar })
      .returning();
    return player;
  }

  async getPlayersByRoomId(roomId: number): Promise<Player[]> {
    return await db.select().from(players).where(eq(players.roomId, roomId));
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player;
  }

  async getQuestionsByCategory(category: string): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.category, category));
  }

  async getAllQuestions(): Promise<Question[]> {
    return await db.select().from(questions);
  }

  async seedQuestions(data: any[]): Promise<void> {
    await db.insert(questions).values(data);
  }

  async createResponse(response: any): Promise<Response> {
    const [res] = await db.insert(responses).values(response).returning();
    return res;
  }

  async getResponsesByRoomId(roomId: number): Promise<Response[]> {
    return await db.select().from(responses).where(eq(responses.roomId, roomId));
  }
}

export const storage = new DatabaseStorage();
