import { Layout, Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useNextPhase } from "@/hooks/use-game";
import { Music, Play } from "lucide-react";

export default function MusicTogetherPhase({ room }: { room: any }) {
  const nextPhase = useNextPhase();

  return (
    <div className="space-y-6 text-center py-8">
      <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
        <Music className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold">Music Together</h2>
      <p className="text-muted-foreground">
        Shared playlists and live listening coming soon!
      </p>

      <Card className="p-8 border-dashed border-2 bg-purple-50/50">
        <p className="italic text-purple-600">
          Spotify integration and mood-based playlists coming in the next update.
        </p>
      </Card>

      <Button 
        variant="ghost" 
        onClick={() => nextPhase.mutate({ code: room.code, phase: "dashboard" })}
        className="mt-4"
      >
        Back to Dashboard
      </Button>
    </div>
  );
}