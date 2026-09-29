import { Check, LoaderCircle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export type ProgressStatus = "pending" | "in-progress" | "completed";
export interface ProgressStep {
  id: string;
  title: string;
  status: ProgressStatus;
}

// Checklist inspired by beui.dev todo-list / agent-activity, rebuilt on site tokens.
export function AgentProgress({ steps, className }: { steps: ProgressStep[]; className?: string }) {
  const reduce = useReducedMotion() ?? false;
  const done = steps.filter((s) => s.status === "completed").length;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("w-full max-w-sm rounded-2xl border border-border bg-surface/60 p-4", className)}
    >
      <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        <span>Working on it</span>
        <span>
          {done}/{steps.length}
        </span>
      </div>
      <ul className="space-y-2">
        {steps.map((step) => (
          <motion.li
            key={step.id}
            layout={!reduce}
            className={cn(
              "flex items-center gap-2.5 text-sm transition-colors",
              step.status === "pending" ? "text-muted-foreground/60" : "text-foreground",
              step.status === "completed" && "text-muted-foreground line-through",
            )}
          >
            <span className="grid size-5 shrink-0 place-items-center">
              <AnimatePresence mode="popLayout" initial={false}>
                {step.status === "completed" ? (
                  <motion.span
                    key="done"
                    initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="grid size-5 place-items-center rounded-full bg-accent text-accent-foreground"
                  >
                    <Check className="size-3" />
                  </motion.span>
                ) : step.status === "in-progress" ? (
                  <motion.span key="run" initial={false}>
                    <LoaderCircle className="size-4 animate-spin text-accent" />
                  </motion.span>
                ) : (
                  <motion.span key="wait" className="size-3.5 rounded-full border border-border" />
                )}
              </AnimatePresence>
            </span>
            {step.title}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
