import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function Loader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
          Memuat...
        </p>
      </motion.div>
    </div>
  );
}
