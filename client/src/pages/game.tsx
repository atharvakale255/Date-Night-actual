import { useEffect } from "react";
import { useRoute } from "wouter";
import { useRoomStatus, useSession, useNextPhase } from "@/hooks/use-game";
import { Layout, Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Trophy, Sparkles, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import canvasConfetti from "canvas-confetti";
import { cn } from "@/lib/utils";

// Phase Components
import DashboardPhase from "./phases/dashboard.tsx";
import LobbyPhase from "./phases/lobby";
import QuizPhase from "./phases/quiz";
import ThisThatPhase from "./phases/this-that";
import LikelyPhase from "./phases/likely";
import DarePhase from "./phases/dare";
import SummaryPhase from "./phases/summary";
import MovieNightPhase from "./phases/movie-night.tsx";
import MusicTogetherPhase from "./phases/music-together.tsx";
import WouldYouRatherPhase from "./phases/would-you-rather";

export default function Game() {
  const [, params] = useRoute("/room/:code");
  const code = params?.code || "";
  const { data: status, isLoading, error } = useRoomStatus(code);
  const { getSession } = useSession();
  const session = getSession();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-primary gap-4">
        <Loader2 className="w-12 h-12 animate-spin" />
        <p className="font-display text-xl animate-pulse">Loading game...</p>
      </div>
    );
  }

  if (error || !status) {
    return (
      <Layout>
        <Card className="text-center py-12">
          <h2 className="text-2xl font-bold text-destructive mb-2">Oops!</h2>
          <p className="text-muted-foreground">Room not found or game ended.</p>
          <Button className="mt-6" onClick={() => window.location.href = '/'}>Go Home</Button>
        </Card>
      </Layout>
    );
  }

  const { room, players } = status;
  const currentPlayer = players.find(p => p.id === session?.playerId);
  const otherPlayer = players.find(p => p.id !== session?.playerId);

  // Phase Router
  let PhaseComponent;
  switch (room.phase) {
    case 'dashboard': PhaseComponent = DashboardPhase; break;
    case 'lobby': PhaseComponent = LobbyPhase; break;
    case 'quiz': PhaseComponent = QuizPhase; break;
    case 'this_that': PhaseComponent = ThisThatPhase; break;
    case 'likely': PhaseComponent = LikelyPhase; break;
    case 'dare': PhaseComponent = DarePhase; break;
    case 'would_you_rather': PhaseComponent = WouldYouRatherPhase; break;
    case 'summary': PhaseComponent = SummaryPhase; break;
    case 'movie_night': PhaseComponent = MovieNightPhase; break;
    case 'music_together': PhaseComponent = MusicTogetherPhase; break;
    default: PhaseComponent = DashboardPhase;
  }

  return (
    <Layout title={`Room: ${room.code}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={room.phase + room.round}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex-1 flex flex-col h-full"
        >
          <PhaseComponent 
            room={room} 
            players={players} 
            questions={status.questions} 
            responses={status.responses}
            currentPlayer={currentPlayer!}
            otherPlayer={otherPlayer}
          />
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
