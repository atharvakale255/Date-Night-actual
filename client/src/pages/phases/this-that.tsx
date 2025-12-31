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
  const { playSound } = useSound();
  
  const roomQuestionIds = (room.thisThatQuestions as number[]) || [];
  const ttQuestions = questions.filter(q => roomQuestionIds.includes(q.id));
  const currentQ = ttQuestions[(room.round - 1) % ttQuestions.length];

  const allResponses = responses.filter(r => roomQuestionIds.includes(r.questionId));
  const matches = roomQuestionIds.filter(id => {
    const qResponses = allResponses.filter(r => r.questionId === id);
    return qResponses.length === 2 && qResponses[0].answer === qResponses[1].answer;
  }).length;
  
  const compatibility = roomQuestionIds.length > 0 ? Math.round((matches / roomQuestionIds.length) * 100) : 0;

  const myResponse = responses.find(r => r.questionId === currentQ?.id && r.playerId === currentPlayer.id);
  const partnerResponse = responses.find(r => r.questionId === currentQ?.id && r.playerId === otherPlayer?.id);
  const bothAnswered = !!myResponse && !!partnerResponse;
  const isCreator = players[0]?.id === currentPlayer.id;

  useEffect(() => {
    if (bothAnswered) {
      if (myResponse?.answer === partnerResponse?.answer) {
        playSound('match');
        canvasConfetti({ particleCount: 50, spread: 60, colors: ['#FFD700', '#FFA500'] });
      } else {
        playSound('pop');
      }
    }
  }, [bothAnswered, myResponse, partnerResponse, playSound]);

  if (!currentQ) return <div>Loading...</div>;
  const options = (currentQ.options as string[]) || ["Option A", "Option B"];

  const isLastQuestion = room.round >= roomQuestionIds.length;

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between px-2 pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-secondary no-default-hover-elevate"
          onClick={() => {
            playSound('click');
            nextPhase.mutate({ code: room.code, phase: "dashboard", round: 1 });
          }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-70">Round {room.round} / {roomQuestionIds.length}</span>
          <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold">Match: {compatibility}%</span>
        </div>
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
              onClick={() => {
                playSound('click');
                submit.mutate({ roomId: room.id, questionId: currentQ.id, answer: option });
              }}
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
              onClick={() => {
                playSound('click');
                if (isLastQuestion) {
                  nextPhase.mutate({ code: room.code, phase: "summary", round: 1 });
                } else {
                  nextPhase.mutate({ code: room.code, phase: "this_that", round: room.round + 1 });
                }
              }}
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
