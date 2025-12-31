import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/layout";
import { useSubmitResponse, useNextPhase } from "@/hooks/use-game";
import type { Room, Player, Question, Response } from "@shared/schema";
import { motion } from "framer-motion";
import canvasConfetti from "canvas-confetti";
import { Check, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/use-sound";

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
  const { playSound } = useSound();
  
  const roomQuestionIds = (room.quizQuestions as number[]) || [];
  const quizQuestions = questions.filter(q => roomQuestionIds.includes(q.id));
  // Handle round-based indexing: round starts at 1, so subtract 1 for array index
  const questionIndex = Math.max(0, Math.min(room.round - 1, quizQuestions.length - 1));
  const currentQ = quizQuestions[questionIndex];

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
        playSound('win');
        canvasConfetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF69B4', '#00CED1', '#9370DB']
        });
      } else {
        playSound('pop');
      }
    }
  }, [bothAnswered, myResponse, partnerResponse, playSound]);

  if (!currentQ) return <div className="text-center p-10">No questions loaded!</div>;

  const options = (currentQ.options as string[]) || [];

  const isLastQuestion = room.round >= roomQuestionIds.length;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between px-2 pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          onClick={() => nextPhase.mutate({ code: room.code, phase: "dashboard" })}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex flex-col items-end">
          <span className="font-bold text-primary tracking-widest text-xs uppercase">Round {room.round} / {roomQuestionIds.length}</span>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Match: {compatibility}%</span>
        </div>
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
              onClick={() => {
                playSound('click');
                if (isLastQuestion) {
                  nextPhase.mutate({ code: room.code, phase: "summary", round: 1 });
                } else {
                  nextPhase.mutate({ code: room.code, phase: "quiz", round: room.round + 1 });
                }
              }}
              disabled={nextPhase.isPending}
            >
              {isLastQuestion ? "Finish Quiz" : "Next Question"}
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
