import { useState, useRef } from "react";
import { Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNextPhase } from "@/hooks/use-game";
import { Film, ArrowLeft, Plus, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MovieNightLobby } from "@/components/movie-night-lobby";
import { generateWatch2GetherUrl, extractYouTubeId, isValidYouTubeUrl } from "@/lib/watch2gether";

export default function MovieNightPhase({
  room,
  players,
  currentPlayer,
  otherPlayer,
}: {
  room: any;
  players: any[];
  currentPlayer: any;
  otherPlayer?: any;
}) {
  const { toast } = useToast();
  const nextPhase = useNextPhase();
  const [newUrl, setNewUrl] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [watch2GetherUrl, setWatch2GetherUrl] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const { data: queue = [], refetch: refetchQueue } = useQuery({
    queryKey: ["/api/queue", room.id],
    queryFn: async () => {
      const res = await fetch(`/api/queue/${room.id}`);
      return res.json();
    },
    refetchInterval: 2000,
  });

  const addToQueueMutation = useMutation({
    mutationFn: async (url: string) => {
      if (!isValidYouTubeUrl(url)) {
        throw new Error("Only YouTube URLs are supported for synchronized watching");
      }

      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          title: url.split("/").pop()?.split("?")[0] || "Video",
          url,
          type: "video",
          addedBy: currentPlayer.id,
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      setNewUrl("");
      refetchQueue();
      toast({ title: "Added to queue" });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Could not add video",
      });
    },
  });

  const handleAddToQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUrl.trim()) {
      addToQueueMutation.mutate(newUrl);
    }
  };

  const currentVideo = queue[0];

  const handleSelectVideo = (url: string) => {
    setSelectedVideo(url);
  };

  const handleStartWatching = () => {
    if (!selectedVideo) return;

    const youtubeId = extractYouTubeId(selectedVideo);
    if (!youtubeId) {
      toast({ title: "Error", description: "Invalid YouTube URL" });
      return;
    }

    setIsStarting(true);
    const w2gUrl = generateWatch2GetherUrl(youtubeId);
    setWatch2GetherUrl(w2gUrl);

    // Open Watch2Gether in new tab/window for synchronized watching
    setTimeout(() => {
      window.open(w2gUrl, "watch2gether", "width=1200,height=800");
    }, 500);
  };

  // If a video is selected and lobby is active, show lobby
  if (currentVideo && !watch2GetherUrl) {
    return (
      <div className="flex flex-col h-full w-full gap-4 p-4">
        <div className="flex items-center justify-between shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => {
              setSelectedVideo(null);
              nextPhase.mutate({ code: room.code, phase: "dashboard" });
            }}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-center gap-3 text-blue-600">
            <Film className="w-6 h-6" />
            <span className="font-bold text-base">Movie Night</span>
          </div>
          <div className="w-20"></div>
        </div>

        <MovieNightLobby
          room={room}
          players={players}
          currentPlayer={currentPlayer}
          videoUrl={currentVideo.url}
          onStartWatching={handleStartWatching}
          isLoading={isStarting}
        />
      </div>
    );
  }

  // Video selection screen
  return (
    <div className="flex flex-col h-full w-full gap-4 p-4">
      <div className="flex items-center justify-between shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => nextPhase.mutate({ code: room.code, phase: "dashboard" })}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-3 text-blue-600">
          <Film className="w-6 h-6" />
          <span className="font-bold text-base">Movie Night</span>
        </div>
        <div className="w-20"></div>
      </div>

      <Card className="flex-1 flex flex-col gap-4 p-4 min-h-0">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Select a Movie</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose a YouTube video to watch together with synchronized playback
            </p>
          </div>

          {/* Add Video Form */}
          <form onSubmit={handleAddToQueue} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                placeholder="Paste YouTube URL..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                data-testid="input-video-url"
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                className="shrink-0"
                data-testid="button-add-queue"
                disabled={addToQueueMutation.isPending}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Examples: youtube.com/watch?v=... or youtu.be/...
            </p>
          </form>

          {/* Queue List */}
          <div>
            <h3 className="font-semibold mb-3">Queue ({queue.length})</h3>
            {queue.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No videos added yet. Add one to get started!
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {queue.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectVideo(item.url)}
                    className="w-full p-3 rounded-lg border-2 transition-all hover-elevate"
                    style={{
                      borderColor:
                        selectedVideo === item.url ? "rgb(59, 130, 246)" : "transparent",
                      backgroundColor:
                        selectedVideo === item.url
                          ? "rgba(59, 130, 246, 0.1)"
                          : "var(--background)",
                    }}
                    data-testid={`queue-item-${item.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Added by {item.addedBy === currentPlayer.id ? "You" : otherPlayer?.name}
                        </p>
                      </div>
                      {selectedVideo === item.url && (
                        <span className="ml-2 text-blue-600 font-bold text-sm">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ready Button */}
          {selectedVideo && (
            <Button
              onClick={() => setSelectedVideo(selectedVideo)}
              className="w-full gap-2 mt-auto"
              data-testid="button-ready"
            >
              <ExternalLink className="w-4 h-4" />
              Ready to Watch
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
