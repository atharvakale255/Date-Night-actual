import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/layout";
import { useSubmitResponse, useNextPhase } from "@/hooks/use-game";
import type { Room, Player, Question, Response } from "@shared/schema";
import { motion } from "framer-motion";
import canvasConfetti from "canvas-confetti";
import { ArrowLeft, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WouldYouRatherProps {
  room: Room;
  players: Player[];
  questions: Question[];
  responses: Response[];
  currentPlayer: Player;
  otherPlayer?: Player;
}

export default function WouldYouRatherPhase({ room, players, questions, responses, currentPlayer, otherPlayer }: WouldYouRatherProps) {
  const submit = useSubmitResponse();
  const nextPhase = useNextPhase();
  
  const wyrQuestions = questions.filter(q => q.category === 'would_you_rather');
  // Handle round-based indexing: round starts at 1, so subtract 1 for array index
  const questionIndex = Math.max(0, Math.min(room.round - 1, wyrQuestions.length - 1));
  const currentQ = wyrQuestions[questionIndex];

  const myResponse = responses.find(r => r.questionId === currentQ?.id && r.playerId === currentPlayer.id);
  const partnerResponse = responses.find(r => r.questionId === currentQ?.id && r.playerId === otherPlayer?.id);
  const bothAnswered = !!myResponse && !!partnerResponse;
  const isCreator = players[0]?.id === currentPlayer.id;

  useEffect(() => {
    if (bothAnswered && myResponse.answer === partnerResponse.answer) {
      canvasConfetti({ particleCount: 80, spread: 70, colors: ['#FF69B4', '#FF1493', '#FFB6C1'] });
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
          className="gap-2"
          onClick={() => nextPhase.mutate({ code: room.code, phase: "dashboard" })}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <h2 className="text-sm font-bold text-pink-600 uppercase tracking-widest flex items-center gap-2">
          <Heart className="fill-current w-4 h-4" /> Would You Rather
        </h2>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <h3 className="text-lg font-bold text-foreground px-4">
            {currentQ.text}
          </h3>
        </motion.div>

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
                  "relative rounded-2xl text-xl font-semibold p-6 shadow-lg transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[120px]",
                  idx === 0 
                    ? "bg-gradient-to-br from-rose-400 to-pink-500 text-white hover:from-rose-500 hover:to-pink-600" 
                    : "bg-gradient-to-br from-violet-400 to-purple-500 text-white hover:from-violet-500 hover:to-purple-600",
                  
                  myResponse && !isSelected && "opacity-40 grayscale",
                  
                  isMatch && "ring-4 ring-yellow-300 ring-offset-2 ring-offset-background z-10 scale-105",
                  
                  !myResponse && !isMatch && "hover:scale-[1.02]"
                )}
              >
                <span>{option}</span>
                
                {bothAnswered && isPartnerSelected && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 bg-white text-xl w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                  >
                    {otherPlayer?.avatar}
                  </motion.div>
                )}

                {bothAnswered && isSelected && !isPartnerSelected && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-sm opacity-75"
                  >
                    ✓ You chose
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {bothAnswered && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-4 space-y-3"
        >
          {myResponse.answer === partnerResponse.answer ? (
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 p-4 rounded-xl text-center">
              <div className="flex items-center justify-center gap-2 text-pink-600 dark:text-pink-300 font-semibold">
                <Sparkles className="w-4 h-4" /> You both chose the same!
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              You chose different answers!
            </div>
          )}
          
          {isCreator ? (
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => {
                if (questionIndex >= wyrQuestions.length - 1) {
                  nextPhase.mutate({ code: room.code, phase: "summary", round: 1 });
                } else {
                  nextPhase.mutate({ code: room.code, phase: "would_you_rather", round: room.round + 1 });
                }
              }}
              disabled={nextPhase.isPending}
              data-testid="button-next-question"
            >
              {questionIndex >= wyrQuestions.length - 1 ? "Finish Game" : "Next Question"}
            </Button>
          ) : (
            <p className="text-center text-muted-foreground animate-pulse text-sm">Waiting for host...</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
