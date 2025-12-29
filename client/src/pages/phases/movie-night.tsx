import { useState, useEffect } from "react";
import { Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNextPhase, useSubmitResponse } from "@/hooks/use-game";
import { Film, Play, ArrowLeft, Search, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MovieNightPhase({ room, responses, currentPlayer, otherPlayer }: { 
  room: any, 
  responses: any[], 
  currentPlayer: any, 
  otherPlayer?: any 
}) {
  const nextPhase = useNextPhase();
  const submit = useSubmitResponse();
  const [url, setUrl] = useState("");
  
  // We use questionId -1 for video sync
  const currentVideoResponse = responses.find(r => r.questionId === -1);
  const currentVideoUrl = currentVideoResponse?.answer;

  const handleSync = () => {
    if (!url) return;
    let videoId = "";
    try {
      if (url.includes("v=")) {
        videoId = url.split("v=")[1].split("&")[0];
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
      }
    } catch (e) {}

    if (videoId) {
      submit.mutate({ roomId: room.id, questionId: -1, answer: videoId });
    }
  };

  return (
    <div className="space-y-6 text-center py-4 flex flex-col h-full">
      <div className="flex items-center justify-between px-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          onClick={() => nextPhase.mutate({ code: room.code, phase: "dashboard" })}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-2 text-blue-500">
          <Film className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-widest">Movie Night</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {currentVideoUrl ? (
          <Card className="p-0 overflow-hidden bg-black aspect-video flex items-center justify-center">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${currentVideoUrl}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </Card>
        ) : (
          <Card className="p-8 border-dashed border-2 bg-blue-50/50 flex flex-col items-center justify-center gap-4 min-h-[200px]">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Youtube className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-blue-600 font-medium italic">
              Paste a YouTube link to watch together!
            </p>
          </Card>
        )}

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input 
              placeholder="Paste YouTube Link..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="rounded-2xl border-2 focus-visible:ring-blue-400"
            />
            <Button 
              onClick={handleSync}
              className="bg-blue-500 hover:bg-blue-600 rounded-2xl"
              size="icon"
              disabled={submit.isPending}
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Everyone in the room will see the video
          </p>
        </div>
      </div>

      {currentVideoUrl && (
        <Button 
          variant="outline" 
          onClick={() => submit.mutate({ roomId: room.id, questionId: -1, answer: "" })}
          className="border-blue-200 text-blue-600 hover:bg-blue-50"
        >
          Change Video
        </Button>
      )}
    </div>
  );
}