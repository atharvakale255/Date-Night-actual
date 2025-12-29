import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/layout";
import { useSubmitResponse, useNextPhase } from "@/hooks/use-game";
import type { Room, Player, Question, Response } from "@shared/schema";
import { motion } from "framer-motion";
import canvasConfetti from "canvas-confetti";
import { ArrowLeft, Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThisThatProps {
  room: Room;
  players: Player[];
  questions: Question[];
  responses: Response[];
  currentPlayer: Player;
  otherPlayer?: Player;
}

export default function ThisThatPhase({ room, players, questions, responses, currentPlayer, otherPlayer }: ThisThatProps) {
  const submit = useSubmitResponse();
  const nextPhase = useNextPhase();
  
  // Filtering for this_that questions specifically to avoid index issues
  const ttQuestions = questions.filter(q => q.category === 'this_that');
  const currentQ = ttQuestions[(room.round - 1) % ttQuestions.length];

  const myResponse = responses.find(r => r.questionId === currentQ?.id && r.playerId === currentPlayer.id);
  const partnerResponse = responses.find(r => r.questionId === currentQ?.id && r.playerId === otherPlayer?.id);
  const bothAnswered = !!myResponse && !!partnerResponse;
  const isCreator = players[0]?.id === currentPlayer.id;

  useEffect(() => {
    if (bothAnswered && myResponse.answer === partnerResponse.answer) {
      canvasConfetti({ particleCount: 50, spread: 60, colors: ['#FFD700', '#FFA500'] });
    }
  }, [bothAnswered, myResponse, partnerResponse]);

  if (!currentQ) return <div>Loading...</div>;
  const options = (currentQ.options as string[]) || ["Option A", "Option B"];

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between px-2 pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-secondary"
          onClick={() => nextPhase.mutate({ code: room.code, phase: "dashboard" })}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <h2 className="text-sm font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
          <Zap className="fill-current w-4 h-4" /> Speed Round
        </h2>
      </div>

      <div className="flex-1 grid grid-rows-2 gap-4">
        {options.map((option, idx) => {
          const isSelected = myResponse?.answer === option;
          const isPartnerSelected = partnerResponse?.answer === option;
          const isMatch = bothAnswered && isSelected && isPartnerSelected;
          
          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.98 }}
              disabled={!!myResponse}
              onClick={() => submit.mutate({ roomId: room.id, questionId: currentQ.id, answer: option })}
              className={cn(
                "relative rounded-3xl text-3xl font-display font-bold p-6 shadow-xl transition-all flex items-center justify-center text-center",
                idx === 0 
                  ? "bg-gradient-to-br from-pink-400 to-rose-500 text-white" 
                  : "bg-gradient-to-br from-blue-400 to-cyan-500 text-white",
                
                // Dim non-selected if answered
                myResponse && !isSelected && "opacity-30 grayscale",
                
                // Highlight match
                isMatch && "ring-8 ring-yellow-300 ring-offset-4 ring-offset-background z-10 scale-105"
              )}
            >
              {option}
              
              {bothAnswered && isPartnerSelected && (
                <div className="absolute top-4 right-4 bg-white text-black text-xl w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                   {otherPlayer?.avatar}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {bothAnswered && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="py-4"
        >
          {isCreator ? (
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => nextPhase.mutate(room.code)}
              disabled={nextPhase.isPending}
            >
              Next Question
            </Button>
          ) : (
             <p className="text-center text-muted-foreground animate-pulse">Waiting for host...</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
