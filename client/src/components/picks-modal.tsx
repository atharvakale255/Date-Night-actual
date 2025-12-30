import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/layout";
import { Heart, Music, MessageSquare, Calendar, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PicksModalProps {
  isOpen: boolean;
  onClose: () => void;
  pick?: {
    type: string;
    content: string;
  };
  isLoading?: boolean;
}

export function PicksModal({ isOpen, onClose, pick, isLoading = false }: PicksModalProps) {
  const getIcon = () => {
    switch (pick?.type) {
      case "song":
        return <Music className="w-8 h-8" />;
      case "message":
        return <MessageSquare className="w-8 h-8" />;
      case "question":
        return <Sparkles className="w-8 h-8" />;
      case "dateIdea":
        return <Calendar className="w-8 h-8" />;
      default:
        return <Heart className="w-8 h-8" />;
    }
  };

  const getLabel = () => {
    switch (pick?.type) {
      case "song":
        return "I Picked This Song For You";
      case "message":
        return "I Picked This Message For You";
      case "question":
        return "I Picked This Question For You";
      case "dateIdea":
        return "I Picked This Date Idea For You";
      default:
        return "I Picked This For You";
    }
  };

  const getColor = () => {
    switch (pick?.type) {
      case "song":
        return "from-purple-500 to-pink-500";
      case "message":
        return "from-blue-500 to-cyan-500";
      case "question":
        return "from-yellow-500 to-orange-500";
      case "dateIdea":
        return "from-rose-500 to-red-500";
      default:
        return "from-pink-500 to-rose-500";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="overflow-hidden">
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">Loading...</div>
                </div>
              ) : pick ? (
                <div className={`bg-gradient-to-br ${getColor()} text-white p-8 space-y-6 rounded-t-2xl`}>
                  <div className="flex justify-center text-white opacity-80">
                    {getIcon()}
                  </div>

                  <div className="space-y-2 text-center">
                    <h3 className="text-sm font-semibold opacity-90 uppercase tracking-widest">
                      {getLabel()}
                    </h3>
                    <p className="text-lg font-bold break-words">
                      {pick.content}
                    </p>
                  </div>

                  <div className="text-center text-sm opacity-75">
                    "Feels like you're present through the app"
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-muted">
                  <p className="text-muted-foreground text-center px-4">No picks available yet</p>
                </div>
              )}

              <div className="p-4 space-y-3">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full"
                  onClick={onClose}
                  disabled={isLoading}
                  data-testid="button-close-picks"
                >
                  Close
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
