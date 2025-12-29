import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNextPhase } from "@/hooks/use-game";
import { Music, Play, Pause, ArrowLeft, Trash2, Plus, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MusicTogetherPhase({ room, players, currentPlayer, otherPlayer }: { 
  room: any, 
  players: any[],
  currentPlayer: any, 
  otherPlayer?: any 
}) {
  const { toast } = useToast();
  const nextPhase = useNextPhase();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

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
          title: url.split("/").pop() || "Audio",
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

  useEffect(() => {
    if (queue.length > 0 && !currentUrl) {
      setCurrentUrl(queue[0].url);
    }
  }, [queue, currentUrl]);

  const handlePlayToggle = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

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

  return (
    <div className="flex h-full gap-4 p-4 flex-col">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          onClick={() => nextPhase.mutate({ code: room.code, phase: "dashboard" })}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-2 text-purple-500">
          <Music className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-widest">Music Together</span>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        <div className="flex-1 flex flex-col gap-4">
          <Card className="flex-1 flex flex-col gap-4 p-4">
            <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg overflow-hidden flex-1 flex items-center justify-center">
              {currentUrl ? (
                <audio
                  ref={audioRef}
                  src={currentUrl}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  data-testid="audio-player"
                  className="hidden"
                />
              ) : null}
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center mx-auto mb-4">
                  <Music className="w-12 h-12 text-white" />
                </div>
                <p className="text-muted-foreground">{currentUrl ? "Music playing" : "Add music to queue"}</p>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePlayToggle}
                data-testid="button-play-pause"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <div className="text-sm text-muted-foreground">
                {audioRef.current ? `${Math.round(audioRef.current.currentTime)}s` : "0s"}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Queue</h3>
            <form onSubmit={handleAddToQueue} className="flex gap-2 mb-4">
              <Input
                placeholder="Enter music/audio URL"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                data-testid="input-music-url"
              />
              <Button type="submit" size="icon" data-testid="button-add-queue">
                <Plus className="w-4 h-4" />
              </Button>
            </form>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {queue.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-muted p-2 rounded hover-elevate"
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
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="w-64 flex flex-col p-4 gap-4">
          <h3 className="font-semibold">Chat</h3>
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {messages.map((msg: any) => {
              const player = players.find((p) => p.id === msg.playerId);
              return (
                <div key={msg.id} className="text-sm" data-testid={`chat-message-${msg.id}`}>
                  <p className="font-medium text-xs text-muted-foreground">{player?.name}</p>
                  <p className="text-sm break-words">{msg.message}</p>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2">
            <Input
              placeholder="Say something..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="text-sm"
              data-testid="input-chat"
            />
            <Button
              type="submit"
              size="icon"
              variant="default"
              data-testid="button-send-chat"
            >
              <Send className="w-3 h-3" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}