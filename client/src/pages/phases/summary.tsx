import { Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Home } from "lucide-react";
import type { Room, Player, Question, Response } from "@shared/schema";
import { motion } from "framer-motion";
import { useNextPhase } from "@/hooks/use-game";
import { useLocation } from "wouter";

interface SummaryProps {
  room: Room;
  players: Player[];
  responses: Response[];
  questions: Question[];
  currentPlayer: Player;
  otherPlayer?: Player;
}

export default function SummaryPhase({ room, players, responses, questions }: SummaryProps) {
  const nextPhase = useNextPhase();
  const [, setLocation] = useLocation();
  const getCompatibility = (category: string, questionIds: number[]) => {
    if (!questionIds || questionIds.length === 0) return null;
    const catResponses = responses.filter(r => questionIds.includes(r.questionId));
    let matches = 0;
    let total = 0;

    questionIds.forEach(qId => {
      const qRes = catResponses.filter(r => r.questionId === qId);
      if (qRes.length === 2) {
        if (qRes[0].answer === qRes[1].answer) matches++;
        total++;
      }
    });
    return total > 0 ? Math.round((matches / total) * 100) : 0;
  };

  const quizScore = getCompatibility('quiz', (room.quizQuestions as number[]) || []);
  const ttScore = getCompatibility('this_that', (room.thisThatQuestions as number[]) || []);
  const likelyScore = getCompatibility('likely', (room.likelyQuestions as number[]) || []);

  const scores = [quizScore, ttScore, likelyScore].filter(s => s !== null) as number[];
  const finalScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  
  let vibe = "Getting to know each other! 🌱";
  let message = "You're off to a great start! Keep exploring each other's worlds.";
  
  if (finalScore > 50) {
    vibe = "Solid Connection! 🤞";
    message = "You two are really in sync! There's a beautiful bond growing here.";
  }
  if (finalScore > 80) {
    vibe = "Soulmates?! 🔥";
    message = "Wow! Your connection is absolutely electric. You truly understand each other's hearts.";
  }

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 py-8 px-4 overflow-y-auto">
      <motion.div 
        initial={{ scale: 0 }} 
        animate={{ scale: 1 }} 
        transition={{ type: "spring", bounce: 0.5 }}
      >
        <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30 mb-4 mx-auto">
          <Trophy className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      <div className="text-center space-y-2">
        <h2 className="text-4xl font-display font-bold text-primary">Relationship Result</h2>
        <p className="text-xl text-muted-foreground font-medium">{vibe}</p>
      </div>

      <Card className="w-full py-8 px-4 flex flex-col items-center gap-4 bg-gradient-to-b from-white to-pink-50/50 border-pink-100 shadow-xl shadow-pink-100/20">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60">Overall Compatibility</h3>
        <div className="text-7xl font-black text-primary font-mono tracking-tighter">
          {finalScore}%
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
             <Star 
               key={i} 
               className={i < Math.floor(finalScore / 20) ? "w-6 h-6 fill-yellow-400 text-yellow-400" : "w-6 h-6 text-gray-200"} 
             />
          ))}
        </div>
        <p className="text-center text-muted-foreground italic px-4 mt-2">
          "{message}"
        </p>
      </Card>
      
      <div className="w-full space-y-3">
        {quizScore !== null && (
          <div className="flex justify-between items-center bg-white/50 p-3 rounded-2xl border border-pink-50">
            <span className="font-bold text-sm text-muted-foreground">Quiz Match</span>
            <span className="font-mono font-bold text-primary">{quizScore}%</span>
          </div>
        )}
        {ttScore !== null && (
          <div className="flex justify-between items-center bg-white/50 p-3 rounded-2xl border border-pink-50">
            <span className="font-bold text-sm text-muted-foreground">This or That</span>
            <span className="font-mono font-bold text-primary">{ttScore}%</span>
          </div>
        )}
        {likelyScore !== null && (
          <div className="flex justify-between items-center bg-white/50 p-3 rounded-2xl border border-pink-50">
            <span className="font-bold text-sm text-muted-foreground">Likely To</span>
            <span className="font-mono font-bold text-primary">{likelyScore}%</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
         {players.map(p => (
            <div key={p.id} className="text-center p-3 rounded-2xl bg-white/30 border border-white/50 shadow-sm">
               <div className="text-4xl mb-2 drop-shadow-sm">{p.avatar}</div>
               <div className="font-bold text-sm">{p.name}</div>
            </div>
         ))}
      </div>

      <div className="w-full space-y-3">
        <Button 
          size="lg"
          className="w-full rounded-2xl h-14 text-lg font-bold shadow-lg hover-elevate bg-gradient-to-r from-primary to-purple-500 border-none"
          onClick={() => nextPhase.mutate({ code: room.code, phase: "dashboard", round: 1 })}
          disabled={nextPhase.isPending}
          data-testid="button-play-again"
        >
          {nextPhase.isPending ? "Loading..." : "Play Again"}
        </Button>

        <Button 
          variant="outline"
          size="lg"
          className="w-full rounded-2xl h-14 text-lg font-bold shadow-lg hover-elevate"
          onClick={() => setLocation("/")}
          data-testid="button-main-menu"
        >
          <Home className="w-5 h-5 mr-2" />
          Back to Main Menu
        </Button>
      </div>
    </div>
  );
}
