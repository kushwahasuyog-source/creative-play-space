import { useEffect, useState } from "react";
import {
  ArrowRight,
  ClockStopwatch,
  RefreshCw01,
  Sale01,
} from "@untitledui/icons";
import { ActionLink } from "@/components/landing/primitives";
import { cn } from "@/lib/utils";

/* ---------------- Countdown hook ---------------- */

type Units = { days: string; hours: string; minutes: string; seconds: string };
const EMPTY: Units = { days: "--", hours: "--", minutes: "--", seconds: "--" };

function useCountdown(durationMs: number) {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    setDeadline(Date.now() + durationMs);
  }, [durationMs, resetKey]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = deadline !== null && now !== null ? Math.max(0, deadline - now) : null;
  const total = Math.floor((remaining ?? 0) / 1000);
  const units: Units =
    remaining === null
      ? EMPTY
      : {
          days: String(Math.floor(total / 86400)).padStart(2, "0"),
          hours: String(Math.floor((total % 86400) / 3600)).padStart(2, "0"),
          minutes: String(Math.floor((total % 3600) / 60)).padStart(2, "0"),
          seconds: String(total % 60).padStart(2, "0"),
        };

  return { units, ready: remaining !== null, reset: () => setResetKey((k) => k + 1) };
}

/* ---------------- Flip unit card ---------------- */

function FlipUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex w-[4.5rem] flex-col items-center gap-2 md:w-24">
      <div className="relative w-full overflow-hidden rounded-xl border border-foreground/10 bg-background/30 shadow-panel [perspective:600px]">
        <span
          className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-px bg-background/50"
          aria-hidden
        />
        <span
          key={value}
          className="block origin-center py-4 font-display text-3xl font-semibold tabular-nums animate-flip md:py-5 md:text-4xl"
        >
          {value}
        </span>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60">
        {label}
      </span>
    </div>
  );
}

/* ---------------- Large countdown banner ---------------- */

const unitLabels: { key: keyof Units; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Mins" },
  { key: "seconds", label: "Secs" },
];

export function CountdownBanner({
  durationMs = (3 * 24 + 14) * 3600_000 + 22 * 60_000,
  badge = "Flash sale · 50% off annual",
  title = "The Pro plan at half price",
  description = "Offer ends when the clock hits zero. Upgrade once, keep the discount for life.",
  ctaLabel = "Claim the offer",
  ctaHref = "#pricing",
  className,
}: {
  durationMs?: number;
  badge?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}) {
  const { units, ready, reset } = useCountdown(durationMs);

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl bg-urgent px-6 py-12 text-center text-foreground shadow-panel md:px-12",
        className,
      )}
    >
      <div className="absolute inset-0 grid-lines opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background/25 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">
          <Sale01 className="size-3.5" />
          {badge}
        </span>
        <h2 className="mt-5 font-display text-3xl font-semibold leading-tight md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-foreground/70">
            {description}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-start justify-center gap-3 md:gap-4">
          {unitLabels.map((u) => (
            <FlipUnit key={u.key} value={units[u.key]} label={u.label} />
          ))}
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <ActionLink href={ctaHref}>
            {ctaLabel}
            <ArrowRight className="size-4" />
          </ActionLink>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-foreground/20 bg-background/25 px-5 py-3 text-sm font-semibold transition-colors hover:bg-background/40"
          >
            <RefreshCw01 className="size-4" />
            Reset timer
          </button>
        </div>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-foreground/60">
          {ready ? "Updating live · ends soon" : "Loading timer"}
        </p>
      </div>
    </section>
  );
}

/* ---------------- Compact countdown ---------------- */

export function CompactCountdown({
  durationMs = (2 * 24 + 11) * 3600_000 + 45 * 60_000,
  label = "Offer ends in",
  className,
}: {
  durationMs?: number;
  label?: string;
  className?: string;
}) {
  const { units, ready, reset } = useCountdown(durationMs);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-xl border border-border bg-panel px-4 py-2.5",
        className,
      )}
    >
      <ClockStopwatch className="size-4 shrink-0 text-urgent-soft" />
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-semibold tabular-nums">
        {ready ? (
          <>
            {units.days}d : {units.hours}h : {units.minutes}m :{" "}
            <span className="text-urgent-soft">{units.seconds}s</span>
          </>
        ) : (
          "--d : --h : --m : --s"
        )}
      </span>
      <button
        type="button"
        onClick={reset}
        aria-label="Reset countdown"
        className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <RefreshCw01 className="size-3.5" />
      </button>
    </div>
  );
}
