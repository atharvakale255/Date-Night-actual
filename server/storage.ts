import { db } from "./db";
import {
  rooms, players, questions, responses, queueItems, chatMessages, playbackState, picks,
  type Room, type Player, type Question, type Response, type QueueItem, type ChatMessage, type Pick,
  type CreateRoomRequest, type JoinRoomRequest,
  insertRoomSchema, insertPlayerSchema, insertResponseSchema,
  insertQuestionSchema, insertQueueItemSchema, insertChatMessageSchema, insertPickSchema
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

  // Queue Items
  createQueueItem(item: any): Promise<QueueItem>;
  getQueueByRoomId(roomId: number): Promise<QueueItem[]>;
  deleteQueueItem(id: number): Promise<void>;

  // Chat Messages
  createChatMessage(message: any): Promise<ChatMessage>;
  getChatMessagesByRoomId(roomId: number): Promise<ChatMessage[]>;

  // Playback State
  getPlaybackState(roomId: number): Promise<any | undefined>;
  updatePlaybackState(roomId: number, data: any): Promise<any>;

  // Picks
  getAllPicks(): Promise<Pick[]>;
  getRandomPick(): Promise<Pick | undefined>;
  seedPicks(data: any[]): Promise<void>;
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

  async createQueueItem(item: any): Promise<QueueItem> {
    const [created] = await db.insert(queueItems).values(item).returning();
    return created;
  }

  async getQueueByRoomId(roomId: number): Promise<QueueItem[]> {
    return await db.select().from(queueItems).where(eq(queueItems.roomId, roomId));
  }

  async deleteQueueItem(id: number): Promise<void> {
    await db.delete(queueItems).where(eq(queueItems.id, id));
  }

  async createChatMessage(message: any): Promise<ChatMessage> {
    const [created] = await db.insert(chatMessages).values(message).returning();
    return created;
  }

  async getChatMessagesByRoomId(roomId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.roomId, roomId));
  }

  async getPlaybackState(roomId: number): Promise<any | undefined> {
    const [state] = await db.select().from(playbackState).where(eq(playbackState.roomId, roomId));
    return state;
  }

  async updatePlaybackState(roomId: number, data: any): Promise<any> {
    const existing = await this.getPlaybackState(roomId);
    if (existing) {
      const [updated] = await db.update(playbackState)
        .set(data)
        .where(eq(playbackState.roomId, roomId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(playbackState).values({ roomId, ...data }).returning();
      return created;
    }
  }

  async getAllPicks(): Promise<Pick[]> {
    return await db.select().from(picks);
  }

  async getRandomPick(): Promise<Pick | undefined> {
    const allPicks = await this.getAllPicks();
    if (allPicks.length === 0) return undefined;
    return allPicks[Math.floor(Math.random() * allPicks.length)];
  }

  async seedPicks(data: any[]): Promise<void> {
    await db.insert(picks).values(data);
  }
}

export const storage = new DatabaseStorage();
