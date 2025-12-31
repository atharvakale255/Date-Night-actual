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
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="w-full max-w-md p-6 flex justify-between items-center z-10 sticky top-0 bg-background/50 backdrop-blur-xl border-b border-white/20"
      >
        <h1 className="text-2xl text-primary font-bold tracking-tight drop-shadow-sm">
          Love<span className="text-secondary">Sync</span>
        </h1>
        {title && (
          <span className="text-xs font-bold uppercase tracking-widest bg-white/50 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/20 shadow-sm">
            {title}
          </span>
        )}
      </motion.nav>
      
      <main className={cn("w-full max-w-md flex-1 px-6 pb-12 flex flex-col", className)}>
        {children}
      </main>

      {/* Decorative Background Elements */}
      <div className="fixed top-20 -left-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse-slow" />
      <div className="fixed bottom-20 -right-10 w-72 h-72 bg-secondary/20 rounded-full blur-[100px] -z-10 animate-pulse-slow delay-1000" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-[120px] -z-10 animate-float" />
    </div>
  );
}

export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "glass-card rounded-3xl p-8 relative overflow-hidden group",
        className
      )}
      {...props as any}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      {children}
    </motion.div>
  );
}
