import { useState, useEffect } from "react";
import { Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNextPhase } from "@/hooks/use-game";
import { Film, ArrowLeft, Trash2, Plus, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <div className="flex flex-col h-full w-full gap-6 p-6">
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

      <div className="flex flex-1 gap-6 min-h-0">
        <div className="flex-1 flex flex-col gap-6">
          <Card className="flex-1 flex flex-col gap-6 p-6">
            <div className="bg-slate-900 rounded-xl overflow-hidden flex-1 flex items-center justify-center">
              {currentVideo ? (
                <div className="text-center space-y-4 p-8">
                  <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto">
                    <Film className="w-10 h-10 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{currentVideo.title}</p>
                    <p className="text-slate-400 text-sm mt-2">Added by {currentVideo.addedBy === currentPlayer.id ? "You" : otherPlayer?.name}</p>
                    <p className="text-slate-500 text-xs mt-4 max-w-md mx-auto break-all">{currentVideo.url}</p>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 text-center">
                  <p className="text-lg">Add a video to the queue to get started</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 shrink-0">
            <h3 className="font-semibold text-lg mb-4">Add to Queue</h3>
            <form onSubmit={handleAddToQueue} className="flex gap-3">
              <Input
                placeholder="Paste video URL here..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                data-testid="input-video-url"
                className="flex-1"
              />
              <Button type="submit" size="icon" className="shrink-0" data-testid="button-add-queue">
                <Plus className="w-4 h-4" />
              </Button>
            </form>
          </Card>

          <Card className="p-6 max-h-48 shrink-0">
            <h3 className="font-semibold text-lg mb-4">Queue</h3>
            <div className="space-y-3 overflow-y-auto max-h-32">
              {queue.length === 0 ? (
                <p className="text-muted-foreground text-sm">No videos in queue yet</p>
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
          </Card>
        </div>

        <Card className="w-80 flex flex-col p-6 gap-4 shrink-0">
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
    </div>
  );
}