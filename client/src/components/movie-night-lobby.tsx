import { useState, useEffect } from "react";
import { Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function MovieNightLobby({
  room,
  players,
  currentPlayer,
  videoUrl,
  onStartWatching,
  isLoading,
}: {
  room: any;
  players: any[];
  currentPlayer: any;
  videoUrl: string;
  onStartWatching: () => void;
  isLoading: boolean;
}) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);

  // Fetch chat messages
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["/api/chat", room.id],
    queryFn: async () => {
      const res = await fetch(`/api/chat/${room.id}`);
      return res.json();
    },
    refetchInterval: 2000,
  });

  // Send chat message
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

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendChatMutation.mutate(message);
    }
  };

  // Countdown timer for starting
  const handleStartCountdown = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setTimeout(() => {
      if (countdown === 1) {
        onStartWatching();
        setCountdown(null);
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onStartWatching]);

  return (
    <div className="flex flex-col h-full w-full gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="text-center flex-1">
          <h2 className="font-bold text-lg">Ready to watch?</h2>
          <p className="text-sm text-muted-foreground">Waiting for both players</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left: Participants & Video Info */}
        <Card className="flex-1 flex flex-col gap-4 p-4">
          <div>
            <h3 className="font-semibold text-sm mb-3">Participants ({players.length})</h3>
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800"
                  data-testid={`participant-${player.id}`}
                >
                  <span className="text-lg">{player.avatar}</span>
                  <span className="text-sm font-medium">{player.name}</span>
                  {player.id === currentPlayer.id && (
                    <span className="ml-auto text-xs px-2 py-1 rounded bg-blue-500 text-white">
                      You
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-2">Movie Selected</h3>
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-xs text-muted-foreground mb-1">YouTube Video</p>
              <p className="text-sm font-medium truncate">{videoUrl}</p>
            </div>
          </div>

          {/* Start Button */}
          <div className="mt-auto pt-4 border-t space-y-2">
            {countdown !== null ? (
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">{countdown}</div>
                <p className="text-sm text-muted-foreground">Starting in seconds...</p>
              </div>
            ) : (
              <Button
                onClick={handleStartCountdown}
                disabled={isLoading || players.length < 2}
                className="w-full gap-2"
                size="lg"
                data-testid="button-start-watching"
              >
                <Play className="w-4 h-4" />
                {isLoading ? "Loading..." : "Start Watching Together"}
              </Button>
            )}
            {players.length < 2 && (
              <p className="text-xs text-amber-600 text-center">
                Waiting for your partner to join...
              </p>
            )}
          </div>
        </Card>

        {/* Right: Chat */}
        <Card className="flex-1 flex flex-col p-4 gap-3 min-h-0">
          <h3 className="font-semibold">Chat</h3>
          <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
            {messages.length === 0 ? (
              <p className="text-muted-foreground text-sm">No messages yet. Say hi!</p>
            ) : (
              messages.map((msg: any) => {
                const player = players.find((p) => p.id === msg.playerId);
                return (
                  <div key={msg.id} data-testid={`chat-message-${msg.id}`}>
                    <p className="font-medium text-xs text-muted-foreground flex items-center gap-1">
                      <span>{player?.avatar}</span>
                      {player?.name}
                    </p>
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
              data-testid="input-lobby-chat"
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0"
              data-testid="button-send-lobby-chat"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
