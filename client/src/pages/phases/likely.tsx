import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/layout";
import { useSubmitResponse, useNextPhase } from "@/hooks/use-game";
import type { Room, Player, Question, Response } from "@shared/schema";
import { motion } from "framer-motion";
import canvasConfetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface LikelyProps {
  room: Room;
  players: Player[];
  questions: Question[];
  responses: Response[];
  currentPlayer: Player;
  otherPlayer?: Player;
}

export default function LikelyPhase({ room, players, questions, responses, currentPlayer, otherPlayer }: LikelyProps) {
  const submit = useSubmitResponse();
  const nextPhase = useNextPhase();
  
  // Filtering for likely questions specifically to avoid index issues
  const likelyQuestions = questions.filter(q => q.category === 'likely');
  const currentQ = likelyQuestions[(room.round - 1) % likelyQuestions.length];

  const myResponse = responses.find(r => r.questionId === currentQ?.id && r.playerId === currentPlayer.id);
  const partnerResponse = responses.find(r => r.questionId === currentQ?.id && r.playerId === otherPlayer?.id);
  const bothAnswered = !!myResponse && !!partnerResponse;
  const isCreator = players[0]?.id === currentPlayer.id;

  if (!currentQ || !otherPlayer) return <div>Loading...</div>;

  // Options are actually the players themselves for "Who's more likely"
  // But we store IDs as strings in answer usually, or names. Let's use IDs.
  const voteSelf = () => submit.mutate({ roomId: room.id, questionId: currentQ.id, answer: String(currentPlayer.id) });
  const votePartner = () => submit.mutate({ roomId: room.id, questionId: currentQ.id, answer: String(otherPlayer.id) });

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
        <h2 className="text-sm font-bold text-accent uppercase tracking-widest">Who is more likely to...</h2>
      </div>

      <Card className="min-h-[140px] flex items-center justify-center text-center p-6 bg-accent/5 border-accent/20">
        <h3 className="text-2xl md:text-3xl font-display leading-snug">
          {currentQ.text}
        </h3>
      </Card>

      <div className="flex-1 flex flex-col justify-center gap-6">
        {/* Vote for Partner */}
        <Button
          onClick={votePartner}
          disabled={!!myResponse}
          className={cn(
            "h-32 rounded-3xl relative overflow-hidden transition-all",
            "bg-white border-2 border-border hover:border-primary hover:bg-pink-50 text-foreground",
            myResponse?.answer === String(otherPlayer.id) && "border-primary bg-pink-100 ring-2 ring-primary ring-offset-2"
          )}
        >
          <div className="flex flex-col items-center gap-2">
             <span className="text-5xl">{otherPlayer.avatar}</span>
             <span className="text-lg font-bold">{otherPlayer.name}</span>
          </div>
          {bothAnswered && partnerResponse?.answer === String(otherPlayer.id) && (
             <div className="absolute top-4 right-4 bg-primary text-white text-xs px-2 py-1 rounded-full">
               Voted for them
             </div>
          )}
        </Button>

        <div className="text-center font-display text-muted-foreground text-xl">OR</div>

        {/* Vote for Self */}
        <Button
          onClick={voteSelf}
          disabled={!!myResponse}
          className={cn(
            "h-32 rounded-3xl relative overflow-hidden transition-all",
            "bg-white border-2 border-border hover:border-primary hover:bg-pink-50 text-foreground",
            myResponse?.answer === String(currentPlayer.id) && "border-primary bg-pink-100 ring-2 ring-primary ring-offset-2"
          )}
        >
          <div className="flex flex-col items-center gap-2">
             <span className="text-5xl">{currentPlayer.avatar}</span>
             <span className="text-lg font-bold">Me</span>
          </div>
          {bothAnswered && partnerResponse?.answer === String(currentPlayer.id) && (
             <div className="absolute top-4 right-4 bg-primary text-white text-xs px-2 py-1 rounded-full">
               Voted for you
             </div>
          )}
        </Button>
      </div>

      {bothAnswered && isCreator && (
         <Button onClick={() => nextPhase.mutate(room.code)} className="w-full mt-4">Next</Button>
      )}
      {bothAnswered && !isCreator && (
         <p className="text-center text-muted-foreground mt-4 animate-pulse">Waiting for host...</p>
      )}
    </div>
  );
}
