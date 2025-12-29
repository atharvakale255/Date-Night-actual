import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNextPhase } from "@/hooks/use-game";
import { Film, ArrowLeft, Trash2, Plus, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { detectMediaType } from "@/lib/media-utils";

export default function MovieNightPhase({ room, players, currentPlayer, otherPlayer }: { 
  room: any, 
  players: any[],
  currentPlayer: any, 
  otherPlayer?: any 
}) {
  const { toast } = useToast();
  const nextPhase = useNextPhase();
  const [newUrl, setNewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [queueOpen, setQueueOpen] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastUpdateRef = useRef(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { data: queue = [], refetch: refetchQueue } = useQuery({
    queryKey: ["/api/queue", room.id],
    queryFn: async () => {
      const res = await fetch(`/api/queue/${room.id}`);
      return res.json();
    },
    refetchInterval: 2000,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["/api/chat", room.id],
    queryFn: async () => {
      const res = await fetch(`/api/chat/${room.id}`);
      return res.json();
    },
    refetchInterval: 2000,
  });

  const addToQueueMutation = useMutation({
    mutationFn: async (url: string) => {
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
  });

  const sendChatMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          playerId: currentPlayer.id,
          message: text,
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      setMessage("");
      refetchMessages();
    },
  });

  const deleteFromQueueMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/queue/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      refetchQueue();
    },
  });

  const handleAddToQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUrl.trim()) {
      addToQueueMutation.mutate(newUrl);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendChatMutation.mutate(message);
    }
  };

  const currentVideo = queue[0];

  useEffect(() => {
    const syncInterval = setInterval(async () => {
      const video = videoRef.current;
      if (!video) return;

      const now = Date.now();
      if (now - lastUpdateRef.current > 500) {
        await fetch(`/api/playback/${room.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentTime: video.currentTime,
            isPlaying: !video.paused,
            queueItemId: currentVideo?.id,
          }),
        });
        lastUpdateRef.current = now;
      }

      const res = await fetch(`/api/playback/${room.id}`);
      const state = await res.json();
      if (state && Math.abs(video.currentTime - parseFloat(state.currentTime)) > 1) {
        video.currentTime = parseFloat(state.currentTime);
      }
      if (state?.isPlaying === "true" && video.paused) {
        video.play();
      } else if (state?.isPlaying === "false" && !video.paused) {
        video.pause();
      }
    }, 500);

    return () => clearInterval(syncInterval);
  }, [room.id, currentVideo?.id]);

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
        <div className="w-full bg-slate-900 rounded-lg overflow-hidden flex flex-col items-center justify-center" style={{ aspectRatio: '16/9' }}>
          {currentVideo ? (
            <div className="w-full h-full flex flex-col">
              {(() => {
                const media = detectMediaType(currentVideo.url);
                return (
                  <>
                    {media.type === 'youtube' && media.embedUrl ? (
                      <iframe
                        src={media.embedUrl}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        data-testid="youtube-video-player"
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        key={currentVideo.id}
                        controls
                        className="w-full h-full"
                        data-testid="video-player"
                        onError={() => setLoadError("Unable to play this URL. Use YouTube or direct video links (MP4, WebM, OGG)")}
                        onLoadStart={() => setLoadError(null)}
                      >
                        <source src={currentVideo.url} type="video/mp4" />
                        Your browser does not support HTML5 video.
                      </video>
                    )}
                    {loadError && (
                      <p className="text-xs text-red-300 text-center p-2 bg-slate-800">{loadError}</p>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="text-slate-400 text-center">
              <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Add a video to get started</p>
            </div>
          )}
        </div>

        <form onSubmit={handleAddToQueue} className="flex flex-col gap-2 shrink-0">
          <div className="flex gap-2">
            <Input
              placeholder="Paste video URL (YouTube or direct MP4/WebM/OGG)..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              data-testid="input-video-url"
              className="flex-1"
            />
            <Button type="submit" size="icon" className="shrink-0" data-testid="button-add-queue">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Paste: YouTube link or direct MP4 URL</p>
        </form>

        <button
          onClick={() => setQueueOpen(!queueOpen)}
          className="flex items-center justify-between p-3 rounded-lg hover-elevate shrink-0"
          data-testid="button-toggle-queue"
        >
          <h3 className="font-semibold">Queue ({queue.length})</h3>
          {queueOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {queueOpen && (
          <div className="space-y-2 overflow-y-auto max-h-40 shrink-0">
            {queue.length === 0 ? (
              <p className="text-muted-foreground text-sm px-3">No videos in queue yet</p>
            ) : (
              queue.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-3 rounded-lg hover-elevate"
                  data-testid={`queue-item-${item.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.addedBy === currentPlayer.id ? "You" : otherPlayer?.name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteFromQueueMutation.mutate(item.id)}
                    data-testid={`button-remove-${item.id}`}
                    className="shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      <Card className="flex-1 flex flex-col p-4 gap-3 min-h-0">
        <h3 className="font-semibold text-lg">Chat</h3>
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-sm">No messages yet</p>
          ) : (
            messages.map((msg: any) => {
              const player = players.find((p) => p.id === msg.playerId);
              return (
                <div key={msg.id} data-testid={`chat-message-${msg.id}`}>
                  <p className="font-medium text-xs text-muted-foreground">{player?.name}</p>
                  <p className="text-sm break-words mt-1">{msg.message}</p>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSendChat} className="flex gap-2 shrink-0">
          <Input
            placeholder="Message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="text-sm"
            data-testid="input-chat"
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0"
            data-testid="button-send-chat"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}