import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNextPhase } from "@/hooks/use-game";
import { Music, ArrowLeft, Trash2, Plus, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MusicTogetherPhase({ room, players, currentPlayer, otherPlayer }: { 
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
  const audioRef = useRef<HTMLAudioElement>(null);
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
          title: url.split("/").pop()?.split("?")[0] || "Song",
          url,
          type: "audio",
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

  const currentSong = queue[0];

  useEffect(() => {
    const syncInterval = setInterval(async () => {
      const audio = audioRef.current;
      if (!audio) return;

      const now = Date.now();
      if (now - lastUpdateRef.current > 500) {
        await fetch(`/api/playback/${room.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentTime: audio.currentTime,
            isPlaying: !audio.paused,
            queueItemId: currentSong?.id,
          }),
        });
        lastUpdateRef.current = now;
      }

      const res = await fetch(`/api/playback/${room.id}`);
      const state = await res.json();
      if (state && Math.abs(audio.currentTime - parseFloat(state.currentTime)) > 1) {
        audio.currentTime = parseFloat(state.currentTime);
      }
      if (state?.isPlaying === "true" && audio.paused) {
        audio.play();
      } else if (state?.isPlaying === "false" && !audio.paused) {
        audio.pause();
      }
    }, 500);

    return () => clearInterval(syncInterval);
  }, [room.id, currentSong?.id]);

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
        <div className="flex items-center gap-3 text-purple-600">
          <Music className="w-6 h-6" />
          <span className="font-bold text-base">Music Together</span>
        </div>
        <div className="w-20"></div>
      </div>

      <Card className="flex-1 flex flex-col gap-4 p-4 min-h-0">
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg overflow-hidden p-8 flex flex-col items-center justify-center gap-6">
          {currentSong ? (
            <>
              <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
                <Music className="w-16 h-16 text-white" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-white font-semibold text-lg">{currentSong.title}</p>
                <p className="text-purple-100 text-sm">Added by {currentSong.addedBy === currentPlayer.id ? "You" : otherPlayer?.name}</p>
              </div>
              <div className="space-y-3">
                <audio
                  ref={audioRef}
                  key={currentSong.id}
                  controls
                  className="w-full max-w-xs"
                  data-testid="audio-player"
                  onError={() => setLoadError("Unable to play this URL. Use direct audio links (MP3, OGG, WAV)")}
                  onLoadStart={() => setLoadError(null)}
                >
                  <source src={currentSong.url} type="audio/mpeg" />
                  Your browser does not support HTML5 audio.
                </audio>
                {loadError && (
                  <p className="text-xs text-red-300 text-center">{loadError}</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-purple-100 text-center">
              <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Music className="w-14 h-14 text-white/50" />
              </div>
              <p className="text-lg">Add music to get started</p>
            </div>
          )}
        </div>

        <form onSubmit={handleAddToQueue} className="flex flex-col gap-2 shrink-0">
          <div className="flex gap-2">
            <Input
              placeholder="Paste music URL (MP3, OGG, WAV)..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              data-testid="input-music-url"
              className="flex-1"
            />
            <Button type="submit" size="icon" className="shrink-0" data-testid="button-add-queue">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Need a URL? Try: direct MP3 links, SoundCloud, or audio hosting sites (Spotify links don't work)</p>
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
              <p className="text-muted-foreground text-sm px-3">No songs in queue yet</p>
            ) : (
              queue.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-purple-100 dark:bg-purple-900 p-3 rounded-lg hover-elevate"
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