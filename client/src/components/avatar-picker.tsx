import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const AVATARS = ["🐶", "🐱", "🦊", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐙", "🦄"];

interface AvatarPickerProps {
  selected?: string;
  onSelect: (avatar: string) => void;
}

export function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-3 py-4">
      {AVATARS.map((avatar) => (
        <motion.button
          key={avatar}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSelect(avatar)}
          className={cn(
            "text-3xl h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-200",
            selected === avatar 
              ? "bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20 scale-110" 
              : "bg-white/50 border border-transparent hover:bg-white"
          )}
          type="button"
        >
          {avatar}
        </motion.button>
      ))}
    </div>
  );
}
