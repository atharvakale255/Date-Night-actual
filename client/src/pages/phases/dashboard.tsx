import { motion } from "framer-motion";
import { Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useNextPhase } from "@/hooks/use-game";
import { Film, Music, Heart, Brain, Zap, Users, HelpCircle } from "lucide-react";
import { differenceInDays, formatDistanceToNow } from "date-fns";

interface DashboardProps {
  room: any;
  players: any[];
  currentPlayer: any;
  otherPlayer?: any;
}

export default function DashboardPhase({ room, players, currentPlayer, otherPlayer }: DashboardProps) {
  const nextPhase = useNextPhase();

  const daysTogether = room.metDate 
    ? differenceInDays(new Date(), new Date(room.metDate))
    : null;

  const activities = [
    { id: 'quiz', title: 'Couples Quiz', icon: Brain, color: 'bg-pink-500', description: 'Test how well you know each other' },
    { id: 'movie_night', title: 'Movie Night', icon: Film, color: 'bg-blue-500', description: 'Pick and watch together' },
    { id: 'music_together', title: 'Music Together', icon: Music, color: 'bg-purple-500', description: 'Share your favorite songs' },
    { id: 'would_you_rather', title: 'Would You Rather', icon: HelpCircle, color: 'bg-rose-500', description: 'Fun choice game' },
    { id: 'this_that', title: 'This or That', icon: Zap, color: 'bg-yellow-500', description: 'Quick choices' },
    { id: 'likely', title: 'Most Likely To', icon: Users, color: 'bg-green-500', description: 'Who would do it?' },
  ];

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

      <div className="grid grid-cols-1 gap-4">
        <h4 className="text-lg font-semibold px-2">Choose an Activity</h4>
        {activities.map((activity, idx) => (
          <Card 
            key={activity.id}
            className="p-4 flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform active:scale-[0.98]"
            onClick={() => nextPhase.mutate({ code: room.code, phase: activity.id, round: 1 })}
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
    </div>
  );
}