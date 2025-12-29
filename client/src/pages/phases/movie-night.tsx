import { Layout, Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useNextPhase } from "@/hooks/use-game";
import { Film, Play } from "lucide-react";

export default function MovieNightPhase({ room }: { room: any }) {
  const nextPhase = useNextPhase();

  return (
    <div className="space-y-6 text-center py-8">
      <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
        <Film className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold">Movie Night</h2>
      <p className="text-muted-foreground">
        Grab the popcorn! This session is coming soon.
      </p>
      
      <Card className="p-8 border-dashed border-2 bg-blue-50/50">
        <p className="italic text-blue-600">
          Syncing movies, trailer picks, and rating features under construction...
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