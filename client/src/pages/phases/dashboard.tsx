import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useNextPhase } from "@/hooks/use-game";
import { Film, Music, Heart, Brain, Zap, Users, HelpCircle, Gift, Loader2 } from "lucide-react";
import { differenceInDays } from "date-fns";
import { PicksModal } from "@/components/picks-modal";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface DashboardProps {
  room: any;
  players: any[];
  currentPlayer: any;
  otherPlayer?: any;
}

export default function DashboardPhase({ room, players, currentPlayer, otherPlayer }: DashboardProps) {
  const nextPhase = useNextPhase();
  const [isPicksOpen, setIsPicksOpen] = useState(false);
  const [currentPick, setCurrentPick] = useState<any>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const controls = useAnimation();

  const activities = [
    { id: 'quiz', title: 'Couples Quiz', icon: Brain, color: 'bg-pink-500', description: 'Test how well you know each other' },
    { id: 'rose_hunt', title: 'Rose Hunt', icon: Heart, color: 'bg-red-500', description: 'Find the hidden rose for a surprise' },
    { id: 'would_you_rather', title: 'Would You Rather', icon: HelpCircle, color: 'bg-rose-500', description: 'Fun choice game' },
    { id: 'this_that', title: 'This or That', icon: Zap, color: 'bg-yellow-500', description: 'Quick choices' },
    { id: 'likely', title: 'Most Likely To', icon: Users, color: 'bg-green-500', description: 'Who would do it?' },
    { id: 'movie_night', title: 'Movie Night', icon: Film, color: 'bg-blue-500', description: 'Pick and watch together' },
    { id: 'music_together', title: 'Music Together', icon: Music, color: 'bg-purple-500', description: 'Share your favorite songs' },
  ];

  const handleSpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const randomIndex = Math.floor(Math.random() * activities.length);
    const selected = activities[randomIndex];

    // Animation: spin 5 times then stop at index
    const totalSpin = 360 * 5 + (360 / activities.length) * randomIndex;

    await controls.start({
      rotate: totalSpin,
      transition: { duration: 3, ease: "circOut" }
    });

    setTimeout(() => {
      nextPhase.mutate({ code: room.code, phase: selected.id, round: 1 });
    }, 500);
  };

  const { data: pick, isFetching } = useQuery({
    queryKey: ['/api/picks/random', isPicksOpen],
    enabled: false,
    staleTime: 0,
  });

  const handlePickClick = async () => {
    const response = await fetch('/api/picks/random');
    const data = await response.json();
    
    // Check if we should inject the special rose message
    if (Math.random() > 0.5) {
      setCurrentPick({
        type: "message",
        content: "🌹 A special rose for you... Thank you for being the most incredible partner. You make every day bloom with happiness! 🌹"
      });
    } else {
      setCurrentPick(data);
    }
    setIsPicksOpen(true);
  };

  const daysTogether = room.metDate 
    ? differenceInDays(new Date(), new Date(room.metDate))
    : null;

  return (
    <div className="space-y-8 py-4">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-6"
      >
        <div className="flex justify-center -space-x-4 mb-6 relative">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="w-20 h-20 rounded-full bg-primary flex items-center justify-center border-4 border-white shadow-xl text-3xl z-10 animate-float"
          >
            {currentPlayer.avatar}
          </motion.div>
          {otherPlayer ? (
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border-4 border-white shadow-xl text-3xl animate-float [animation-delay:1s]"
            >
              {otherPlayer.avatar}
            </motion.div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-4 border-white shadow-inner text-sm italic text-muted-foreground">
              Wait
            </div>
          )}
          <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10 rounded-full" />
        </div>
        
        {daysTogether !== null && (
          <Card className="p-8 bg-gradient-to-br from-white/90 to-pink-50/50">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Days Together</h3>
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.6 }}
              className="text-6xl font-bold text-primary drop-shadow-sm"
            >
              {daysTogether}
            </motion.div>
            <p className="text-xs font-medium text-muted-foreground mt-2 bg-pink-100/50 px-3 py-1 rounded-full inline-block">
              Since {new Date(room.metDate).toLocaleDateString()}
            </p>
          </Card>
        )}
      </motion.div>

      <Card className="p-8 flex flex-col items-center gap-8 bg-gradient-to-br from-white/80 to-purple-50/50 border-purple-100/50 shadow-purple-500/10">
        <div className="text-center space-y-2">
          <h4 className="text-2xl font-display text-primary">Wheel of Fate</h4>
          <p className="text-sm text-muted-foreground">Tap to spin and decide your next adventure!</p>
        </div>

        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Main Wheel Design */}
          <motion.div 
            animate={controls}
            className="w-full h-full rounded-full border-[12px] border-white shadow-2xl relative bg-white flex items-center justify-center overflow-hidden"
          >
            {/* Minimalist Segment Dividers */}
            <div className="absolute inset-0">
              {activities.map((_, i) => (
                <div 
                  key={i}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-slate-100 origin-center"
                  style={{ transform: `rotate(${(360 / activities.length) * i}deg)` }}
                />
              ))}
            </div>

            {/* Icons floating in slices */}
            {activities.map((act, i) => (
              <div 
                key={act.id}
                className="absolute inset-0 flex items-start justify-center pt-6"
                style={{ transform: `rotate(${(360 / activities.length) * i + (360 / activities.length / 2)}deg)` }}
              >
                <div className={cn("p-3 rounded-2xl shadow-lg text-white", act.color)}>
                  <act.icon className="w-6 h-6" />
                </div>
              </div>
            ))}

            {/* Center Heart Hub */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full shadow-xl z-30 flex items-center justify-center border-4 border-pink-50">
                 <Heart className="w-8 h-8 text-primary fill-primary animate-pulse" />
              </div>
            </div>
          </motion.div>

          {/* Indicator Pointer */}
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-40 w-0 h-0 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-r-[30px] border-r-primary drop-shadow-md" />
        </div>
        
        <Button 
          size="lg" 
          className="w-full rounded-3xl h-16 text-xl font-bold shadow-2xl hover-elevate bg-gradient-to-r from-primary to-accent border-0"
          onClick={handleSpin}
          disabled={isSpinning}
        >
          {isSpinning ? <Loader2 className="animate-spin mr-2" /> : "SPIN TO START!"}
        </Button>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-lg font-semibold">Manual Choice</h4>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handlePickClick}
            disabled={isFetching}
            data-testid="button-pick-for-you"
          >
            <Gift className="w-4 h-4" />
            I Picked This
          </Button>
        </div>
        {activities.map((activity, idx) => (
          <Card 
            key={activity.id}
            className="p-4 flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform active:scale-[0.98]"
            onClick={() => nextPhase.mutate({ code: room.code, phase: activity.id, round: 1 })}
            data-testid={`card-activity-${activity.id}`}
          >
            <div className={`p-3 rounded-2xl ${activity.color} text-white`}>
              <activity.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h5 className="font-bold text-lg">{activity.title}</h5>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <PicksModal 
        isOpen={isPicksOpen} 
        onClose={() => setIsPicksOpen(false)} 
        pick={currentPick}
        isLoading={isFetching}
      />
    </div>
  );
}