import { Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useNextPhase } from "@/hooks/use-game";
import { Zap, CheckCircle, ArrowLeft } from "lucide-react";
import type { Room, Player, Question } from "@shared/schema";
import { motion } from "framer-motion";
import { useState } from "react";

interface DareProps {
  room: Room;
  players: Player[];
  questions: Question[];
  currentPlayer: Player;
  otherPlayer?: Player;
}

export default function DarePhase({ room, questions, currentPlayer }: DareProps) {
  const nextPhase = useNextPhase();
  const [completed, setCompleted] = useState(false);

  // Get dare questions (category = 'dare')
  const dareQuestions = questions.filter(q => q.category === 'dare');
  
  // Get current dare based on round
  const dareIndex = (room.round - 1) % dareQuestions.length;
  const currentDare = dareQuestions[dareIndex] || dareQuestions[0];

  const handleComplete = () => {
    setCompleted(true);
    setTimeout(() => {
      nextPhase.mutate({ code: room.code, round: room.round + 1 });
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col items-center gap-6 py-4 px-4">
      <div className="w-full flex justify-start">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          onClick={() => nextPhase.mutate({ code: room.code, phase: "dashboard" })}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.6 }}
        className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50"
      >
        <Zap className="w-10 h-10 text-white" />
      </motion.div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display font-bold">Mini Challenge!</h2>
        <p className="text-sm text-muted-foreground">Round {room.round - 9} of 3</p>
      </div>

      <Card className="w-full py-8 px-6 flex flex-col items-center gap-6 bg-gradient-to-b from-orange-50 to-pink-50">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-center font-display font-semibold text-foreground leading-relaxed"
        >
          {currentDare.text}
        </motion.p>
      </Card>

      <motion.div
        initial={false}
        animate={completed ? { scale: 1.1 } : { scale: 1 }}
      >
        <Button
          size="lg"
          className="w-full"
          onClick={handleComplete}
          disabled={completed}
        >
          {completed ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Done! Moving on...
            </>
          ) : (
            "I Did It! 🎉"
          )}
        </Button>
      </motion.div>

      <p className="text-xs text-muted-foreground text-center">
        Be fun, be goofy, be yourselves! 💕
      </p>
    </div>
  );
}
