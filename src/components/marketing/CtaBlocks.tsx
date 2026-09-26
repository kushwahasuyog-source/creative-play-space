import {
  Activity,
  ArrowRight,
  Check,
  Rocket01,
  ShieldTick,
  Star01,
  Users01,
  Zap,
} from "@untitledui/icons";
import { ActionLink, Card, Eyebrow } from "@/components/landing/primitives";
import { cn } from "@/lib/utils";

/* ---------------- Single CTA ---------------- */

export function SingleCta({
  badge = "Limited beta",
  title = "Ship your first Telegram bot today",
  description = "Describe the bot in one sentence. BotForge writes the code, runs the tests and deploys it — you just watch it come online.",
  primaryLabel = "Start building free",
  primaryHref = "#cta",
  finePrint = "No credit card required. 500 free messages every month.",
  className,
}: {
  badge?: string;
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  finePrint?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-hero px-6 py-16 text-center md:px-12",
        className,
      )}
    >
      <div className="absolute inset-0 grid-lines opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-2xl">
        <Eyebrow>{badge}</Eyebrow>
        <h2 className="mt-5 font-display text-3xl font-semibold leading-tight md:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="mt-8 flex justify-center">
          <ActionLink href={primaryHref}>
            {primaryLabel}
            <ArrowRight className="size-4" />
          </ActionLink>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 font-mono text-xs text-muted-foreground">
          <Check className="size-3.5 text-accent" />
          {finePrint}
        </p>
      </div>
    </section>
  );
}

/* ---------------- Dual CTA ---------------- */

export function DualCta({
  eyebrow = "Ready when you are",
  title = "From prompt to production in one afternoon",
  description = "Join the builders shipping Telegram bots without writing boilerplate. Start from a template or describe your own.",
  primary = { label: "Create your bot", href: "#cta" },
  secondary = { label: "Browse templates", href: "#templates" },
  className,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-3xl border border-border bg-panel p-8 md:p-10", className)}
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-5 font-display text-2xl font-semibold leading-tight md:text-3xl">
            {title}
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <ActionLink href={primary.href}>
            {primary.label}
            <ArrowRight className="size-4" />
          </ActionLink>
          <ActionLink href={secondary.href} variant="ghost">
            {secondary.label}
          </ActionLink>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Inline CTA ---------------- */

export function InlineCta({
  icon: Icon = Zap,
  title = "Need a custom integration?",
  description = "Our team wires your bot into any API or internal system.",
  actionLabel = "Talk to us",
  actionHref = "#cta",
  className,
}: {
  icon?: typeof Zap;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/25 text-accent">
          <Icon className="size-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <ActionLink href={actionHref} className="shrink-0">
        {actionLabel}
        <ArrowRight className="size-4" />
      </ActionLink>
    </Card>
  );
}

/* ---------------- Trust indicators (social proof) ---------------- */

const avatars = [
  { initials: "AK", color: "var(--chart-1)" },
  { initials: "MJ", color: "var(--chart-2)" },
  { initials: "SR", color: "var(--chart-3)" },
  { initials: "TL", color: "var(--chart-4)" },
];

export function TrustIndicators({
  caption = "Trusted by 2,400+ bot builders",
  rating = "4.9/5 from 800+ reviews",
  className,
}: {
  caption?: string;
  rating?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6",
        className,
      )}
    >
      <div className="flex -space-x-2.5">
        {avatars.map((a) => (
          <span
            key={a.initials}
            className="flex size-9 items-center justify-center rounded-full border border-border font-mono text-[11px] font-semibold"
            style={{ backgroundColor: a.color, color: "var(--background)" }}
          >
            {a.initials}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1" aria-label="Rated 5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star01 key={i} className="size-4 fill-amber text-amber" />
        ))}
      </div>
      <div className="text-center sm:text-left">
        <p className="text-sm font-semibold">{caption}</p>
        <p className="text-xs text-muted-foreground">{rating}</p>
      </div>
    </div>
  );
}

/* ---------------- Trust stats ---------------- */

const stats = [
  { icon: Rocket01, value: "12,400+", label: "Bots deployed" },
  { icon: Activity, value: "99.98%", label: "Runtime uptime" },
  { icon: Users01, value: "2,400+", label: "Active builders" },
  { icon: ShieldTick, value: "AES-256", label: "Token encryption" },
];

export function TrustStats({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((s) => (
        <Card key={s.label} className="flex items-center gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/25 text-accent">
            <s.icon className="size-5" />
          </span>
          <div>
            <p className="font-display text-xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
