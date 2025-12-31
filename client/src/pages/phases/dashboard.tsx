import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useNextPhase } from "@/hooks/use-game";
import { Film, Music, Heart, Brain, Zap, Users, HelpCircle, Gift, Loader2 } from "lucide-react";
import { differenceInDays } from "date-fns";
import { PicksModal } from "@/components/picks-modal";
import { useQuery } from "@tanstack/react-query";

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
    setCurrentPick(data);
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
        className="text-center space-y-4"
      >
        <div className="flex justify-center -space-x-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center border-4 border-background text-2xl">
            {currentPlayer.avatar}
          </div>
          {otherPlayer ? (
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center border-4 border-background text-2xl">
              {otherPlayer.avatar}
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-4 border-background text-sm italic">
              Wait
            </div>
          )}
        </div>
        
        {daysTogether !== null && (
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/20 shadow-xl">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Days Together</h3>
            <div className="text-5xl font-bold text-primary my-2">{daysTogether}</div>
            <p className="text-sm text-muted-foreground">
              Since {new Date(room.metDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </motion.div>

      {/* Spin the Wheel Section */}
      <div className="flex flex-col items-center gap-6 p-8 bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl border-2 border-dashed border-pink-200">
        <div className="relative w-48 h-48">
          {/* Arrow indicator */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-pink-500" />
          
          <motion.div 
            animate={controls}
            className="w-full h-full rounded-full border-8 border-white shadow-2xl relative overflow-hidden bg-white"
          >
            {activities.map((act, i) => (
              <div 
                key={act.id}
                className={`absolute top-0 left-0 w-full h-full origin-center`}
                style={{ 
                  transform: `rotate(${(360 / activities.length) * i}deg)`,
                  clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)'
                }}
              >
                <div className={`w-full h-full ${act.color} opacity-80`} />
              </div>
            ))}
          </motion.div>
        </div>
        
        <Button 
          size="lg" 
          className="rounded-full px-12 py-6 text-xl font-bold shadow-xl hover-elevate"
          onClick={handleSpin}
          disabled={isSpinning}
        >
          {isSpinning ? <Loader2 className="animate-spin mr-2" /> : "Spin the Wheel!"}
        </Button>
        <p className="text-sm text-muted-foreground text-center">Let fate decide your next activity!</p>
      </div>

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