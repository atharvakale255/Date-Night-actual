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
  { category: "quiz", text: "What is your fav snack?", options: ["Chocolate", "Chips", "Fruits", "Cookies"] },
  { category: "quiz", text: "What food could I eat every day?", options: ["Pizza", "Paneer", "Momo", "Pasta"] },
  { category: "quiz", text: "What's my biggest pet peeve?", options: ["Loud chewing", "Being late", "Slow internet", "Messy rooms"] },
  { category: "quiz", text: "Perfect date night?", options: ["Movie", "Late night food run", "Long drive + music", "Games"] },
  { category: "quiz", text: "Who gets sleepy first?", options: ["Me", "You", "Depends on the day", "Dumb question to ask"] },
  { category: "quiz", text: "What matters more?", options: ["Time together", "Effort", "Trust", "Idk"] },
  { category: "quiz", text: "When I'm sad I want you to give me", options: ["Space", "Comfort", "Distraction", "Pics.. 👁👁"] },
  { category: "quiz", text: "My love language is closest to", options: ["Words", "Time", "Surprises", "..Pics 👁👁"] },

  // This or That
  { category: "this_that", text: "Morning person or Night owl?", options: ["Morning", "Night"] },
  { category: "this_that", text: "Coffee or Tea?", options: ["Coffee", "Tea"] },
  { category: "this_that", text: "Movie night or Clubbing?", options: ["Movie", "Club"] },
  { category: "this_that", text: "Hearing your voice or seeing your face?", options: ["Voice", "Face"] },
  { category: "this_that", text: "Bullying or flirting?", options: ["Bullying", "Flirting"] },
  { category: "this_that", text: "Pics or VN?", options: ["Pics", "VN"] },
  { category: "this_that", text: "Needing assurance or needing space?", options: ["Assurance", "Space"] },
  { category: "this_that", text: "Emotional talks or distractions?", options: ["Talks", "Distractions"] },
  { category: "this_that", text: "Planning the future or living the present?", options: ["Future", "Present"] },
  { category: "this_that", text: "Big milestone or small daily moments?", options: ["Milestone", "Daily moments"] },

  // Likely
  { category: "likely", text: "Who is more likely to survive a zombie apocalypse?", options: ["Me", "Partner"] },
  { category: "likely", text: "Who is more likely to cry at a movie?", options: ["Me", "Partner"] },
  { category: "likely", text: "Who is the better cook?", options: ["Me", "Partner"] },
  { category: "likely", text: "Who is more likely to text all day?", options: ["Me", "Partner"] },
  { category: "likely", text: "Who is more likely to get taller? 👁👁", options: ["Me", "Partner"] },
  { category: "likely", text: "Who is more likely to overthink silently?", options: ["Me", "Partner"] },
  { category: "likely", text: "Who is more likely to send pics or VN?", options: ["Me", "Partner"] },
  { category: "likely", text: "Who is more likely to want to play games together?", options: ["Me", "Partner"] },

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
  { category: "would_you_rather", text: "Would you rather text all day or only at night?", options: ["All day", "Only at night"] },
  { category: "would_you_rather", text: "Would you rather not use the word 'lauda' or get taller? 👁👁", options: ["No lauda", "Get taller"] },
  { category: "would_you_rather", text: "Would you rather overthink silently or say everything out loud?", options: ["Silently", "Out loud"] },
  { category: "would_you_rather", text: "Would you rather give pics or give VN?", options: ["Pics", "VN"] },
  { category: "would_you_rather", text: "Would you rather play games together or watch movies together?", options: ["Games", "Movies"] },
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
  const existingTexts = new Set(existing.map(q => q.text));
  const newQuestions = SEED_QUESTIONS.filter(q => !existingTexts.has(q.text));
  
  if (newQuestions.length > 0) {
    await storage.seedQuestions(newQuestions);
  }
  
  const existingPicks = await storage.getAllPicks();
  const existingPickContents = new Set(existingPicks.map(p => p.content));
  const newPicks = SEED_PICKS.filter(p => !existingPickContents.has(p.content));
  
  if (newPicks.length > 0) {
    await storage.seedPicks(newPicks);
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
      console.log("Room Create Request Body:", req.body);
      const { name, avatar, metDate } = api.rooms.create.input.parse(req.body);
      // Generate proper alphanumeric room code (4 characters)
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      const room = await storage.createRoom(code);
      if (metDate) {
        await storage.updateRoomMetDate(room.id, new Date(metDate));
      }
      const player = await storage.createPlayer(room.id, name, avatar || "🙂");
      res.status(201).json({ roomCode: code, playerId: player.id, roomId: room.id });
    } catch (err: any) {
      console.error("Room Create Error:", err);
      res.status(400).json({ message: "Invalid input", details: err?.errors || err?.message });
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
