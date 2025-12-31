import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { useNextPhase } from "@/hooks/use-game";
import canvasConfetti from "canvas-confetti";
import { useSound } from "@/hooks/use-sound";

export default function RoseHuntPhase({ room }: { room: any }) {
  const nextPhase = useNextPhase();
  const { playSound } = useSound();
  const [boxes, setBoxes] = useState<number[]>([]);
  const [roseIndex, setRoseIndex] = useState(-1);
  const [found, setFound] = useState(false);

  const initGame = () => {
    playSound('click');
    const newRoseIndex = Math.floor(Math.random() * 9);
    setRoseIndex(newRoseIndex);
    setBoxes(new Array(9).fill(0));
    setFound(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleBoxClick = (index: number) => {
    if (found) return;
    if (index === roseIndex) {
      setFound(true);
      playSound('win');
      canvasConfetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ff0000", "#ff69b4", "#ffffff"]
      });
    } else {
      playSound('pop');
      const newBoxes = [...boxes];
      newBoxes[index] = 1; // Mark as empty
      setBoxes(newBoxes);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between px-2 pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          onClick={() => nextPhase.mutate({ code: room.code, phase: "dashboard", round: 1 })}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <h2 className="text-xs font-bold text-primary uppercase tracking-widest opacity-70">Rose Hunt</h2>
      </div>

      <AnimatePresence mode="wait">
        {!found ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="grid grid-cols-3 gap-3 flex-1 items-center"
          >
            {boxes.map((box, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBoxClick(i)}
                className="aspect-square relative"
              >
                <Card className="w-full h-full flex items-center justify-center p-0 cursor-pointer bg-white/40 border-dashed border-2 border-primary/20 hover:border-primary/50 transition-colors">
                  {box === 1 ? (
                    <span className="text-2xl opacity-20">💨</span>
                  ) : (
                    <Heart className="w-8 h-8 text-primary/20 fill-primary/5" />
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="win"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center gap-8"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-9xl filter drop-shadow-2xl"
            >
              🌹
            </motion.div>
            
            <Card className="p-8 bg-gradient-to-br from-white/90 to-rose-50/50 border-rose-100 shadow-xl max-w-sm">
              <h3 className="text-2xl font-display text-primary mb-4">You found it!</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                "Thank you for being the most incredible partner. You make my life bloom with happiness every single day. I love you! ❤️"
              </p>
            </Card>

            <div className="flex gap-4 w-full max-w-sm">
              <Button 
                variant="outline" 
                className="flex-1 rounded-2xl h-14 gap-2"
                onClick={initGame}
              >
                <RefreshCw className="w-4 h-4" /> Play Again
              </Button>
              <Button 
                className="flex-1 rounded-2xl h-14 bg-gradient-to-r from-primary to-accent"
                onClick={() => nextPhase.mutate({ code: room.code, phase: "dashboard", round: 1 })}
              >
                Home
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!found && (
        <p className="text-center text-sm font-medium text-muted-foreground animate-pulse">
          Find the hidden rose...
        </p>
      )}
    </div>
  );
}
