import { Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Sparkles } from "lucide-react";
import type { Room, Player, Question, Response } from "@shared/schema";
import { motion } from "framer-motion";

interface SummaryProps {
  room: Room;
  players: Player[];
  responses: Response[];
  questions: Question[];
  currentPlayer: Player;
  otherPlayer?: Player;
}

export default function SummaryPhase({ players, responses }: SummaryProps) {
  // Simple match calculation
  // Group responses by questionId
  const questionIds = Array.from(new Set(responses.map(r => r.questionId)));
  let matches = 0;
  let total = 0;

  questionIds.forEach(qId => {
    const res = responses.filter(r => r.questionId === qId);
    if (res.length === 2) {
      if (res[0].answer === res[1].answer) matches++;
      total++;
    }
  });

  const percentage = total > 0 ? Math.round((matches / total) * 100) : 0;
  
  let vibe = "Getting to know each other! 🌱";
  if (percentage > 50) vibe = "Solid Connection! 🤞";
  if (percentage > 80) vibe = "Soulmates?! 🔥";

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 py-8">
      <motion.div 
        initial={{ scale: 0 }} 
        animate={{ scale: 1 }} 
        transition={{ type: "spring", bounce: 0.5 }}
      >
        <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50 mb-4 mx-auto">
          <Trophy className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      <div className="text-center space-y-2">
        <h2 className="text-4xl font-display font-bold">Game Over!</h2>
        <p className="text-xl text-muted-foreground">{vibe}</p>
      </div>

      <Card className="w-full py-8 px-4 flex flex-col items-center gap-4 bg-gradient-to-b from-white to-pink-50">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Match Score</h3>
        <div className="text-6xl font-black text-primary font-mono tracking-tighter">
          {percentage}%
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
             <Star 
               key={i} 
               className={`w-6 h-6 ${i < Math.floor(percentage / 20) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} 
             />
          ))}
        </div>
      </Card>
      
      <div className="grid grid-cols-2 gap-4 w-full">
         {players.map(p => (
            <div key={p.id} className="text-center">
               <div className="text-4xl mb-2">{p.avatar}</div>
               <div className="font-bold">{p.name}</div>
            </div>
         ))}
      </div>

      <Button 
        className="w-full mt-auto" 
        onClick={() => window.location.href = `/room/${room.code}`}
      >
        Back to Dashboard
      </Button>
    </div>
  );
}
