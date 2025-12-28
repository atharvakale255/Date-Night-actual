import { Button } from "@/components/ui/button";
import { Card } from "@/components/layout";
import { useNextPhase } from "@/hooks/use-game";
import { useToast } from "@/hooks/use-toast";
import { Copy, Users, Play } from "lucide-react";
import type { GameState, Player, Room } from "@shared/schema";

interface LobbyProps {
  room: Room;
  players: Player[];
  currentPlayer: Player;
}

export default function LobbyPhase({ room, players, currentPlayer }: LobbyProps) {
  const nextPhase = useNextPhase();
  const { toast } = useToast();

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    toast({ title: "Copied!", description: "Room code copied to clipboard." });
  };

  const isCreator = players[0]?.id === currentPlayer.id;
  const canStart = players.length >= 2;

  return (
    <div className="flex flex-col gap-6 py-4 h-full">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display">Waiting for Partner...</h2>
        <p className="text-muted-foreground">Share the code to start playing!</p>
      </div>

      <Card className="bg-white/90">
        <div className="flex flex-col items-center gap-4 py-4">
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Room Code</span>
          <button 
            onClick={copyCode}
            className="text-6xl font-mono font-bold tracking-widest text-primary hover:scale-105 transition-transform flex items-center gap-4"
          >
            {room.code}
            <Copy className="w-6 h-6 text-muted-foreground opacity-50" />
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {players.map((p) => (
          <Card key={p.id} className="flex flex-col items-center justify-center py-8 gap-2 border-2 border-transparent data-[me=true]:border-primary/20" data-me={p.id === currentPlayer.id}>
            <div className="text-5xl mb-2">{p.avatar}</div>
            <span className="font-bold text-lg">{p.name}</span>
            {p.id === currentPlayer.id && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">You</span>}
          </Card>
        ))}
        {Array.from({ length: 2 - players.length }).map((_, i) => (
          <Card key={`empty-${i}`} className="flex flex-col items-center justify-center py-8 gap-2 border-2 border-dashed border-gray-200 bg-transparent shadow-none">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Users className="text-gray-300 w-6 h-6" />
            </div>
            <span className="text-gray-400 font-medium">Waiting...</span>
          </Card>
        ))}
      </div>

      <div className="mt-auto">
        {isCreator ? (
          <Button 
            className="w-full text-lg h-14 shadow-xl shadow-primary/25" 
            disabled={!canStart || nextPhase.isPending}
            onClick={() => nextPhase.mutate(room.code)}
          >
            {nextPhase.isPending ? "Starting..." : "Start Game"} <Play className="ml-2 w-5 h-5 fill-current" />
          </Button>
        ) : (
          <div className="text-center text-muted-foreground p-4 bg-white/50 rounded-xl backdrop-blur-sm">
            Waiting for host to start...
          </div>
        )}
      </div>
    </div>
  );
}
