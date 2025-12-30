import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertResponseSchema, insertQueueItemSchema, insertChatMessageSchema, responses } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { db } from "./db";

// Seed data
const SEED_QUESTIONS = [
  // Quiz
  { category: "quiz", text: "What is my ideal dream vacation?", options: ["Beach resort", "Mountain cabin", "City exploration", "Staycation"] },
  { category: "quiz", text: "What food could I eat every day?", options: ["Pizza", "Sushi", "Tacos", "Pasta"] },
  { category: "quiz", text: "What's my biggest pet peeve?", options: ["Loud chewing", "Being late", "Slow internet", "Messy rooms"] },
  
  // This or That
  { category: "this_that", text: "Morning person or Night owl?", options: ["Morning", "Night"] },
  { category: "this_that", text: "Coffee or Tea?", options: ["Coffee", "Tea"] },
  { category: "this_that", text: "Movie night or Clubbing?", options: ["Movie", "Club"] },
  
  // Likely
  { category: "likely", text: "Who is more likely to survive a zombie apocalypse?", options: ["Me", "Partner"] },
  { category: "likely", text: "Who is more likely to cry at a movie?", options: ["Me", "Partner"] },
  { category: "likely", text: "Who is the better cook?", options: ["Me", "Partner"] },

  // Dare
  { category: "dare", text: "Stare contest! Don't blink for 30 seconds.", options: [] },
  { category: "dare", text: "Give your partner a sincere compliment.", options: [] },
  { category: "dare", text: "Do your best impression of your partner.", options: [] },

  // Would You Rather
  { category: "would_you_rather", text: "Would you rather have the ability to fly or be invisible?", options: ["Fly", "Invisible"] },
  { category: "would_you_rather", text: "Would you rather always be 10 minutes late or 20 minutes early?", options: ["10 min late", "20 min early"] },
  { category: "would_you_rather", text: "Would you rather explore space or the ocean?", options: ["Space", "Ocean"] },
  { category: "would_you_rather", text: "Would you rather have the perfect job or perfect relationship?", options: ["Perfect job", "Perfect relationship"] },
  { category: "would_you_rather", text: "Would you rather go back to the past or forward to the future?", options: ["Past", "Future"] },
  { category: "would_you_rather", text: "Would you rather always have to sing or always have to dance?", options: ["Sing", "Dance"] },
];

// Seed data for picks
const SEED_PICKS = [
  // Songs
  { type: "song", content: "Your favorite song - let's listen together" },
  { type: "song", content: "A song that reminds me of you" },
  { type: "song", content: "This song makes me think of us" },
  
  // Messages
  { type: "message", content: "I love how you make me smile without even trying" },
  { type: "message", content: "Thank you for being my person" },
  { type: "message", content: "Missing you already" },
  { type: "message", content: "You make long distance feel like nothing" },
  { type: "message", content: "Can't wait to see your face again" },
  
  // Questions
  { type: "question", content: "What's something new you've learned about yourself recently?" },
  { type: "question", content: "What's your favorite memory with me?" },
  { type: "question", content: "What do you love most about us?" },
  { type: "question", content: "What's something you've been wanting to talk about?" },
  
  // Date Ideas
  { type: "dateIdea", content: "Virtual dinner date - cook the same meal together" },
  { type: "dateIdea", content: "Movie night - watch together with video call" },
  { type: "dateIdea", content: "Breakfast in bed video call (yes, really!)" },
  { type: "dateIdea", content: "Karaoke duet night" },
  { type: "dateIdea", content: "Cook-off competition - make the same dish" },
];

async function seed() {
  const existing = await storage.getAllQuestions();
  if (existing.length === 0) {
    await storage.seedQuestions(SEED_QUESTIONS);
  }
  
  const existingPicks = await storage.getAllPicks();
  if (existingPicks.length === 0) {
    await storage.seedPicks(SEED_PICKS);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await seed();

  // Create Room
  app.post(api.rooms.create.path, async (req, res) => {
    try {
      const { name, avatar } = api.rooms.create.input.parse(req.body);
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      const room = await storage.createRoom(code);
      if (req.body.metDate) {
        await storage.updateRoomMetDate(room.id, new Date(req.body.metDate));
      }
      const player = await storage.createPlayer(room.id, name, avatar || "🙂");
      res.status(201).json({ roomCode: code, playerId: player.id, roomId: room.id });
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Join Room
  app.post(api.rooms.join.path, async (req, res) => {
    try {
      const { code, name, avatar } = api.rooms.join.input.parse(req.body);
      const room = await storage.getRoomByCode(code);
      if (!room) return res.status(404).json({ message: "Room not found" });

      const player = await storage.createPlayer(room.id, name, avatar || "🙂");
      res.json({ playerId: player.id, roomId: room.id });
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Get Room Status
  app.get(api.rooms.status.path, async (req, res) => {
    const code = req.params.code;
    const room = await storage.getRoomByCode(code);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const players = await storage.getPlayersByRoomId(room.id);
    const responses = await storage.getResponsesByRoomId(room.id);
    const questions = await storage.getAllQuestions();

    res.json({ room, players, questions, responses });
  });

  // Get Random Pick
  app.get(api.picks.random.path, async (req, res) => {
    const pick = await storage.getRandomPick();
    res.json(pick);
  });

  // Next Phase (Advance Game)
  app.post(api.rooms.nextPhase.path, async (req, res) => {
    const code = req.params.code;
    const { phase, round } = req.body;
    const room = await storage.getRoomByCode(code);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const updatedRoom = await storage.updateRoomPhase(room.id, phase || "dashboard", round || 0);
    res.json(updatedRoom);
  });

  // Submit Response
  app.post(api.responses.submit.path, async (req, res) => {
    try {
      const input = insertResponseSchema.parse(req.body);
      
      // Handle special question IDs for video/music sync (global per room)
      if (input.questionId < 0) {
        const existing = await storage.getResponsesByRoomId(input.roomId);
        const special = existing.find(r => r.questionId === input.questionId);
        
        if (special) {
          // Update existing special response instead of creating new one
          const [updated] = await db.update(responses)
            .set({ answer: input.answer })
            .where(eq(responses.id, special.id))
            .returning();
          return res.status(200).json(updated);
        }
      }

      const response = await storage.createResponse(input);
      res.status(201).json(response);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Queue Items
  app.post("/api/queue", async (req, res) => {
    try {
      const input = insertQueueItemSchema.parse(req.body);
      const item = await storage.createQueueItem(input);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get("/api/queue/:roomId", async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const queue = await storage.getQueueByRoomId(roomId);
      res.json(queue);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.delete("/api/queue/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteQueueItem(id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Chat Messages
  app.post("/api/chat", async (req, res) => {
    try {
      const input = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(input);
      res.status(201).json(message);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get("/api/chat/:roomId", async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const messages = await storage.getChatMessagesByRoomId(roomId);
      res.json(messages);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Playback State
  app.get("/api/playback/:roomId", async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const state = await storage.getPlaybackState(roomId);
      res.json(state || { currentTime: "0", isPlaying: "false" });
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/playback/:roomId", async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const { currentTime, isPlaying, queueItemId } = req.body;
      const state = await storage.updatePlaybackState(roomId, {
        currentTime: String(currentTime),
        isPlaying: String(isPlaying),
        queueItemId: queueItemId || null,
      });
      res.json(state);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  return httpServer;
}
