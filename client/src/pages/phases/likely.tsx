import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/layout";
import { useSubmitResponse, useNextPhase } from "@/hooks/use-game";
import type { Room, Player, Question, Response } from "@shared/schema";
import { motion } from "framer-motion";
import canvasConfetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSound } from "@/hooks/use-sound";

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
  const { playSound } = useSound();
  
  const roomQuestionIds = (room.likelyQuestions as number[]) || [];
  const likelyQuestions = questions.filter(q => roomQuestionIds.includes(q.id));
  // Handle round-based indexing: round starts at 1, so subtract 1 for array index
  const questionIndex = Math.max(0, Math.min(room.round - 1, likelyQuestions.length - 1));
  const currentQ = likelyQuestions[questionIndex];

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
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FF69B4', '#00CED1']
        });
      } else {
        playSound('pop');
      }
    }
  }, [bothAnswered, myResponse, partnerResponse, playSound]);

  if (!currentQ || !otherPlayer) return (
    <div className="flex flex-col h-full items-center justify-center p-8 text-center gap-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="font-display text-xl text-muted-foreground">Preparing questions...</p>
    </div>
  );

  const voteSelf = () => {
    playSound('click');
    submit.mutate({ roomId: room.id, questionId: currentQ.id, answer: String(currentPlayer.id) });
  };
  const votePartner = () => {
    playSound('click');
    submit.mutate({ roomId: room.id, questionId: currentQ.id, answer: String(otherPlayer.id) });
  };

  const isLastQuestion = room.round >= roomQuestionIds.length;

  const nextQuestion = () => {
    playSound('click');
    if (isLastQuestion) {
      nextPhase.mutate({ code: room.code, phase: "summary", round: 1 });
    } else {
      nextPhase.mutate({ code: room.code, phase: "likely", round: room.round + 1 });
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 pb-8">
      <div className="flex items-center justify-between px-2 pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 no-default-hover-elevate"
          onClick={() => nextPhase.mutate({ code: room.code, phase: "dashboard", round: 1 })}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest opacity-70">Round {room.round} / {roomQuestionIds.length}</span>
          <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">Match: {compatibility}%</span>
        </div>
      </div>

      <Card className="min-h-[160px] flex items-center justify-center text-center p-8 bg-gradient-to-br from-accent/5 to-transparent border-accent/20">
        <h3 className="text-2xl md:text-3xl font-display leading-tight text-balance">
          {currentQ.text}
        </h3>
      </Card>

      <div className="flex-1 flex flex-col justify-center gap-6">
        {/* Vote for Partner */}
        <Button
          onClick={votePartner}
          disabled={!!myResponse}
          variant="ghost"
          className={cn(
            "h-40 rounded-[2rem] relative overflow-hidden transition-all duration-500",
            "bg-white/50 border-2 border-dashed border-muted hover:border-primary hover:bg-pink-50/50",
            myResponse?.answer === String(otherPlayer.id) && "border-solid border-primary bg-pink-100/50 ring-4 ring-primary/20"
          )}
        >
          <div className="flex flex-col items-center gap-3">
             <motion.span 
               animate={myResponse?.answer === String(otherPlayer.id) ? { scale: [1, 1.2, 1] } : {}}
               className="text-6xl drop-shadow-md"
             >
               {otherPlayer.avatar}
             </motion.span>
             <span className="text-xl font-bold tracking-tight">{otherPlayer.name}</span>
          </div>
          {bothAnswered && partnerResponse?.answer === String(otherPlayer.id) && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute top-4 right-4 bg-primary text-white text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full shadow-lg"
             >
               MATCH!
             </motion.div>
          )}
        </Button>

        <div className="flex items-center gap-4 px-8 opacity-20">
          <div className="h-px flex-1 bg-foreground" />
          <span className="font-display text-xl">VS</span>
          <div className="h-px flex-1 bg-foreground" />
        </div>

        {/* Vote for Self */}
        <Button
          onClick={voteSelf}
          disabled={!!myResponse}
          variant="ghost"
          className={cn(
            "h-40 rounded-[2rem] relative overflow-hidden transition-all duration-500",
            "bg-white/50 border-2 border-dashed border-muted hover:border-primary hover:bg-pink-50/50",
            myResponse?.answer === String(currentPlayer.id) && "border-solid border-primary bg-pink-100/50 ring-4 ring-primary/20"
          )}
        >
          <div className="flex flex-col items-center gap-3">
             <motion.span 
               animate={myResponse?.answer === String(currentPlayer.id) ? { scale: [1, 1.2, 1] } : {}}
               className="text-6xl drop-shadow-md"
             >
               {currentPlayer.avatar}
             </motion.span>
             <span className="text-xl font-bold tracking-tight">Me</span>
          </div>
          {bothAnswered && partnerResponse?.answer === String(currentPlayer.id) && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute top-4 right-4 bg-primary text-white text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full shadow-lg"
             >
               MATCH!
             </motion.div>
          )}
        </Button>
      </div>

      {bothAnswered && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          {isCreator ? (
             <Button 
               onClick={nextQuestion} 
               size="lg"
               className="w-full rounded-2xl h-16 text-xl font-bold bg-gradient-to-r from-primary to-accent hover-elevate shadow-xl"
             >
               {isLastQuestion ? "Finish Game" : "Next Question"}
             </Button>
          ) : (
             <Card className="p-4 bg-white/30 text-center border-dashed">
               <p className="text-sm font-bold text-muted-foreground animate-pulse tracking-wide uppercase">Waiting for partner...</p>
             </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
