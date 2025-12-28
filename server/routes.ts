import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertResponseSchema } from "@shared/schema";

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
];

async function seed() {
  const existing = await storage.getAllQuestions();
  if (existing.length === 0) {
    await storage.seedQuestions(SEED_QUESTIONS);
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

  // Next Phase (Advance Game)
  app.post(api.rooms.nextPhase.path, async (req, res) => {
    const code = req.params.code;
    const room = await storage.getRoomByCode(code);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Simple logic to cycle phases
    // Lobby -> Quiz -> This_That -> Likely -> Dare -> Summary
    // For MVP we just rotate phases or increment rounds. 
    // Let's implement a simple flow:
    // 0: Lobby
    // 1-3: Quiz
    // 4-6: This/That
    // 7-9: Likely
    // 10-12: Dare
    // 13: Summary

    let nextRound = room.round + 1;
    let nextPhase = "quiz";

    if (nextRound === 0) nextPhase = "lobby";
    else if (nextRound <= 3) nextPhase = "quiz";
    else if (nextRound <= 6) nextPhase = "this_that";
    else if (nextRound <= 9) nextPhase = "likely";
    else if (nextRound <= 12) nextPhase = "dare";
    else nextPhase = "summary";

    const updatedRoom = await storage.updateRoomPhase(room.id, nextPhase, nextRound);
    res.json(updatedRoom);
  });

  // Submit Response
  app.post(api.responses.submit.path, async (req, res) => {
    try {
      const input = insertResponseSchema.parse(req.body);
      const response = await storage.createResponse(input);
      res.status(201).json(response);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  return httpServer;
}
