import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Layout({ children, className, title }: LayoutProps) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col items-center">
      <nav className="w-full max-w-md p-4 flex justify-between items-center z-10">
        <h1 className="text-2xl text-primary font-bold tracking-tight">
          Love<span className="text-secondary">Sync</span>
        </h1>
        {title && (
          <span className="text-sm font-bold bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
            {title}
          </span>
        )}
      </nav>
      
      <main className={cn("w-full max-w-md flex-1 px-4 pb-8 flex flex-col", className)}>
        {children}
      </main>

      {/* Decorative Background Elements */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="fixed bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl -z-10 animate-pulse delay-700" />
    </div>
  );
}

export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-card rounded-3xl p-6 relative overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
