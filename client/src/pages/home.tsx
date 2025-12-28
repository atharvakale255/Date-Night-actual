import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Layout, Card } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarPicker } from "@/components/avatar-picker";
import { useCreateRoom, useJoinRoom } from "@/hooks/use-game";
import { Loader2, Heart, Play } from "lucide-react";

export default function Home() {
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🦊");
  const [roomCode, setRoomCode] = useState("");
  
  const createRoom = useCreateRoom();
  const joinRoom = useJoinRoom();

  const handleCreate = () => {
    if (!name) return;
    createRoom.mutate({ name, avatar });
  };

  const handleJoin = () => {
    if (!name || !roomCode || roomCode.length !== 4) return;
    joinRoom.mutate({ name, avatar, code: roomCode.toUpperCase() });
  };

  const isPending = createRoom.isPending || joinRoom.isPending;

  return (
    <Layout>
      <div className="flex-1 flex flex-col justify-center py-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-block p-4 bg-white rounded-full shadow-xl shadow-pink-500/10 mb-4 animate-bounce-slow">
            <Heart className="w-12 h-12 text-primary fill-current" />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Sync Up!</h2>
          <p className="text-muted-foreground text-lg">The ultimate couple's game night.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === "menu" && (
            <motion.div
              key="menu"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <Card className="p-1">
                <Button 
                  onClick={() => setMode("create")} 
                  variant="default" 
                  size="xl" 
                  className="w-full bg-gradient-to-r from-primary to-purple-500 border-none"
                >
                  Create Room
                </Button>
              </Card>
              <Card className="p-1">
                <Button 
                  onClick={() => setMode("join")} 
                  variant="secondary" 
                  size="xl"
                  className="w-full bg-gradient-to-r from-teal-400 to-emerald-500 border-none"
                >
                  Join Room
                </Button>
              </Card>
            </motion.div>
          )}

          {(mode === "create" || mode === "join") && (
            <motion.div
              key="form"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
            >
              <Card>
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl mb-1">{mode === "create" ? "Start New Game" : "Join Game"}</h3>
                    <p className="text-sm text-muted-foreground">Customize your profile</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold ml-1">Your Name</label>
                    <Input 
                      placeholder="e.g. Honey Bear" 
                      className="h-12 text-lg rounded-xl border-2 focus-visible:ring-primary/20"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  {mode === "join" && (
                    <div className="space-y-3">
                      <label className="text-sm font-semibold ml-1">Room Code</label>
                      <Input 
                        placeholder="ABCD" 
                        maxLength={4}
                        className="h-12 text-lg font-mono uppercase tracking-widest rounded-xl border-2 focus-visible:ring-primary/20"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-semibold ml-1">Choose Avatar</label>
                    <AvatarPicker selected={avatar} onSelect={setAvatar} />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => setMode("menu")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      className="flex-[2] bg-gradient-to-r from-primary to-purple-500" 
                      onClick={mode === "create" ? handleCreate : handleJoin}
                      disabled={isPending || !name || (mode === "join" && roomCode.length !== 4)}
                    >
                      {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === "create" ? "Let's Play!" : "Join In!")}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
