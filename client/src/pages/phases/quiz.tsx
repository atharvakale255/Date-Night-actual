import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/layout";
import { useSubmitResponse, useNextPhase } from "@/hooks/use-game";
import type { Room, Player, Question, Response } from "@shared/schema";
import { motion } from "framer-motion";
import canvasConfetti from "canvas-confetti";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizProps {
  room: Room;
  players: Player[];
  questions: Question[];
  responses: Response[];
  currentPlayer: Player;
  otherPlayer?: Player;
}

export default function QuizPhase({ room, players, questions, responses, currentPlayer, otherPlayer }: QuizProps) {
  const submit = useSubmitResponse();
  const nextPhase = useNextPhase();
  
  // Current question is based on the round index
  // questions array contains ALL questions for session. round 0 -> index 0.
  // Note: room.round starts at 1 usually in real apps, but let's assume 0-indexed or mapped correctly.
  // Schema defaults round to 0.
  const currentQ = questions[room.round];

  const myResponse = responses.find(r => r.questionId === currentQ?.id && r.playerId === currentPlayer.id);
  const partnerResponse = responses.find(r => r.questionId === currentQ?.id && r.playerId === otherPlayer?.id);

  const bothAnswered = !!myResponse && !!partnerResponse;
  const isCreator = players[0]?.id === currentPlayer.id;

  useEffect(() => {
    if (bothAnswered && myResponse.answer === partnerResponse.answer) {
      canvasConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF69B4', '#00CED1', '#9370DB']
      });
    }
  }, [bothAnswered, myResponse, partnerResponse]);

  if (!currentQ) return <div className="text-center p-10">No questions loaded!</div>;

  const options = (currentQ.options as string[]) || [];

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between px-2">
        <span className="font-bold text-primary tracking-widest text-sm uppercase">Round {room.round + 1}</span>
        <span className="text-xs bg-white/50 px-2 py-1 rounded-md text-muted-foreground">Quiz</span>
      </div>

      <Card className="bg-gradient-to-br from-white to-pink-50/50 border-pink-100 shadow-pink-100/50 min-h-[160px] flex items-center justify-center text-center p-6">
        <h3 className="text-2xl md:text-3xl font-display text-balance leading-snug">
          {currentQ.text}
        </h3>
      </Card>

      <div className="flex-1 flex flex-col justify-center gap-3">
        {options.map((option, idx) => {
          const isSelected = myResponse?.answer === option;
          const isPartnerSelected = partnerResponse?.answer === option;
          
          let variant = "game";
          if (bothAnswered) {
             if (isSelected && isPartnerSelected) variant = "default"; // Match!
             else if (isSelected) variant = "secondary"; // My choice
             else if (isPartnerSelected) variant = "outline"; // Partner choice
          } else {
             if (isSelected) variant = "default";
          }

          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Button
                variant={variant as any}
                className={cn(
                  "w-full h-auto py-4 text-lg font-normal justify-between transition-all duration-300",
                  bothAnswered && isSelected && isPartnerSelected && "ring-4 ring-green-400 bg-green-500 text-white hover:bg-green-600 border-green-600"
                )}
                disabled={!!myResponse}
                onClick={() => submit.mutate({ roomId: room.id, questionId: currentQ.id, answer: option })}
              >
                <span>{option}</span>
                {bothAnswered && isPartnerSelected && (
                  <span className="flex items-center gap-2 text-sm font-bold bg-white/20 px-2 py-1 rounded-full">
                     {otherPlayer?.avatar}
                  </span>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {bothAnswered ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-auto"
        >
          {myResponse.answer === partnerResponse.answer ? (
            <div className="text-center mb-4">
              <span className="text-2xl font-bold text-green-600 bg-green-100 px-4 py-2 rounded-full inline-flex items-center gap-2">
                <Check className="w-6 h-6" /> It's a Match!
              </span>
            </div>
          ) : (
            <div className="text-center mb-4 text-muted-foreground font-medium">
              No match this time!
            </div>
          )}

          {isCreator && (
            <Button 
              className="w-full" 
              onClick={() => nextPhase.mutate(room.code)}
              disabled={nextPhase.isPending}
            >
              Next Round
            </Button>
          )}
          {!isCreator && <p className="text-center text-sm text-muted-foreground animate-pulse">Waiting for host...</p>}
        </motion.div>
      ) : (
        <div className="mt-auto text-center py-4 text-muted-foreground flex items-center justify-center gap-2">
           {!myResponse ? "Pick your answer!" : "Waiting for partner..."}
           {!!myResponse && <Loader2 className="w-4 h-4 animate-spin" />}
        </div>
      )}
    </div>
  );
}
