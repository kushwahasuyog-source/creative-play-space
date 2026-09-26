import { Link } from "@tanstack/react-router";
import {
  Activity,
  BarChartSquare02,
  Check,
  CodeSquare01,
  Dataflow03,
  Grid01,
  Key01,
  MessageChatCircle,
  MessageSmileCircle,
  Rocket01,
  ShieldTick,
  Zap,
} from "@untitledui/icons";
import { ActionLink, Card, Section, SectionHeading, StatusDot } from "./primitives";

/* ---------------- How it works ---------------- */

const steps = [
  {
    icon: MessageChatCircle,
    title: "Describe it",
    body: "Write your bot idea in plain language. No specs, no boilerplate.",
  },
  {
    icon: CodeSquare01,
    title: "AI builds it",
    body: "A multi-stage pipeline plans, codes, reviews and tests your bot.",
  },
  {
    icon: Key01,
    title: "Connect BotFather",
    body: "Paste your token once. It is verified and stored encrypted.",
  },
  {
    icon: Rocket01,
    title: "Deploy & manage",
    body: "One click to go live, then monitor users, logs and events.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how">
      <SectionHeading
        eyebrow="How it works"
        title="From an idea to a running bot in four steps"
        description="Every stage is validated before the next one runs, so what ships actually works on Telegram."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Card key={s.title}>
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/25 text-accent">
                <s.icon className="size-5" />
              </span>
              <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
            </div>
            <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Builder pipeline ---------------- */

const pipeline = [
  "Requirement parser",
  "Specification generator",
  "Architecture planner",
  "Code generator",
  "Code validator",
  "Security checker",
  "Test generator",
  "Deployment config",
];

export function BuilderDemo() {
  return (
    <Section id="builder" className="bg-surface/40">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading
            eyebrow="AI architecture"
            title="A pipeline of agents, not one giant prompt"
            description="Planner, coder, reviewer, security and testing agents each own one responsibility with a clear validation boundary."
          />
          <ul className="mt-8 space-y-3">
            {[
              "Generated Python project with handlers, services and database layer",
              "Docker config, .env.example and README included",
              "Automatic tests and security review before deploy",
            ].map((t) => (
              <li key={t} className="flex gap-3 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <Card className="font-mono text-sm">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <StatusDot />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              build pipeline
            </span>
          </div>
          <ol className="mt-4 space-y-2">
            {pipeline.map((p, i) => (
              <li key={p} className="flex items-center gap-3 rounded-lg bg-background/50 px-3 py-2">
                <span className="text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-xs text-foreground">{p}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </Section>
  );
}

/* ---------------- Features ---------------- */

const features = [
  { icon: MessageSmileCircle, title: "Bot management", body: "Start, stop, edit and version every bot you own." },
  {
    icon: Dataflow03,
    title: "Visual automations",
    body: "Triggers, conditions and actions wired on a canvas.",
  },
  {
    icon: BarChartSquare02,
    title: "Analytics",
    body: "Users, messages, commands and retention in real time.",
  },
  { icon: Activity, title: "Live logs", body: "Stream errors and events straight from the runtime." },
  {
    icon: ShieldTick,
    title: "Secret vault",
    body: "Bot tokens encrypted and never exposed to the browser.",
  },
  {
    icon: Grid01,
    title: "Templates",
    body: "Start from 40+ ready-made bots across 12 categories.",
  },
];

export function Features() {
  return (
    <Section id="features">
      <SectionHeading
        eyebrow="Platform"
        title="Everything a Telegram bot needs after it is built"
        description="Discover, build, configure, connect, deploy, manage and automate — from one dashboard."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title}>
            <f.icon className="size-5 text-accent" />
            <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Templates ---------------- */

const templates = [
  { name: "File Converter Bot", slug: "file-converter", cat: "Utility" },
  { name: "AI Chat Bot", slug: "ai-chat", cat: "AI" },
  { name: "Group Moderation Bot", slug: "group-moderation", cat: "Moderation" },
  { name: "Welcome Bot", slug: "welcome", cat: "Community" },
  { name: "URL Shortener Bot", slug: "url-shortener", cat: "Productivity" },
  { name: "QR Generator Bot", slug: "qr-generator", cat: "Utility" },
  { name: "Reminder Bot", slug: "reminder", cat: "Productivity" },
  { name: "Quiz Bot", slug: "quiz", cat: "Education" },
];

export function Templates() {
  return (
    <Section id="templates" className="bg-surface/40">
      <SectionHeading
        eyebrow="Templates"
        title="Fork a proven bot instead of starting empty"
        description="Every template ships with commands, handlers and deployment config you can customize."
      />
      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((t) => (
          <Link key={t.name} to="/app/new" search={{ template: t.slug }} className="block rounded-2xl transition-transform hover:-translate-y-0.5">
          <Card className="h-full p-5 hover:border-accent/50">
            <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
              {t.cat}
            </span>
            <h3 className="mt-3 text-base font-semibold">{t.name}</h3>
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="size-3.5 text-accent" /> Use this template
            </p>
          </Card>
          </Link>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Automation ---------------- */

const columns = [
  { title: "Triggers", items: ["/start", "Command", "Message", "Photo", "New member", "Schedule"] },
  { title: "Conditions", items: ["User ID", "Message text", "Chat ID", "User role", "File type"] },
  {
    title: "Actions",
    items: ["Send message", "Send document", "Ban user", "Call API", "Run AI", "Save to database"],
  },
];

export function Automation() {
  return (
    <Section id="automation">
      <SectionHeading
        eyebrow="Automation"
        title="Connect Telegram events to any action"
        description="Chain triggers, conditions and actions into workflows without writing glue code."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {columns.map((c) => (
          <Card key={c.title}>
            <h3 className="font-mono text-xs uppercase tracking-widest text-accent">{c.title}</h3>
            <ul className="mt-4 space-y-2">
              {c.items.map((i) => (
                <li
                  key={i}
                  className="rounded-lg border border-border bg-background/40 px-3 py-2 text-sm text-muted-foreground"
                >
                  {i}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Pricing ---------------- */

const plans = [
  {
    name: "Free",
    price: "$0",
    note: "For a first bot",
    features: ["1 bot", "500 messages / mo", "Community templates", "Basic analytics"],
    featured: false,
  },
  {
    name: "Pro",
    price: "$19",
    note: "For serious builders",
    features: [
      "10 bots",
      "100K messages / mo",
      "Automations & workflows",
      "Advanced analytics & logs",
      "Priority AI generation",
    ],
    featured: true,
  },
  {
    name: "Business",
    price: "$79",
    note: "For teams",
    features: [
      "Unlimited bots",
      "Team workspaces",
      "Custom integrations",
      "Audit logs & SSO",
      "Priority support",
    ],
    featured: false,
  },
];

export function Pricing() {
  return (
    <Section id="pricing" className="bg-surface/40">
      <SectionHeading
        eyebrow="Pricing"
        title="Start free, upgrade when your bots grow"
        description="Usage limits are transparent and enforced per workspace."
      />
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {plans.map((p) => (
          <Card
            key={p.name}
            className={p.featured ? "border-accent/50 ring-soft" : ""}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              {p.featured ? (
                <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
                  Popular
                </span>
              ) : null}
            </div>
            <p className="mt-4 font-display text-4xl font-semibold">
              {p.price}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{p.note}</p>
            <ul className="mt-6 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
            <ActionLink
              href="/app"
              variant={p.featured ? "primary" : "ghost"}
              className="mt-7 w-full"
            >
              {p.name === "Free" ? "Start free" : `Choose ${p.name}`}
            </ActionLink>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- FAQ ---------------- */

const faqs = [
  {
    q: "Do I need to write any code?",
    a: "No. You describe the bot and BotForge generates the full project. You can still open and edit the generated code whenever you want.",
  },
  {
    q: "Where does my BotFather token live?",
    a: "Tokens are verified server-side and stored encrypted in a secrets vault. They are never sent to the browser.",
  },
  {
    q: "Can I host the bot myself?",
    a: "Yes. Every generated bot includes a Dockerfile, requirements and .env.example so you can export and run it anywhere.",
  },
  {
    q: "What happens if I hit my plan limit?",
    a: "Your bots keep running and you get an in-app and email notification with a one-click upgrade.",
  },
];

export function Faq() {
  return (
    <Section id="faq">
      <SectionHeading eyebrow="FAQ" title="Questions, answered" />
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {faqs.map((f) => (
          <Card key={f.q}>
            <h3 className="text-base font-semibold">{f.q}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- CTA + Footer ---------------- */

export function Cta() {
  return (
    <Section id="cta" className="bg-surface/40">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-hero px-8 py-16 text-center md:px-16">
        <div className="absolute inset-0 grid-lines opacity-50" aria-hidden />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-tight md:text-4xl">
            Your next Telegram bot is one sentence away
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Describe it, connect BotFather, deploy. Free to start.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ActionLink href="/app">Create your bot</ActionLink>
            <ActionLink href="#templates" variant="ghost">
              Explore templates
            </ActionLink>
          </div>
        </div>
      </div>
    </Section>
  );
}

const footerCols = [
  { title: "Product", links: [["Features", "/#features"], ["Templates", "/#templates"], ["Pricing", "/#pricing"], ["FAQ", "/#faq"]] },
  { title: "App", links: [["My bots", "/app"], ["AI builder", "/app/new"], ["Coding assistant", "/app/assistant"], ["Sign in", "/auth"]] },
  { title: "Company", links: [["hello@botforge.app", "mailto:hello@botforge.app"], ["+1 000 000 0000", "tel:+10000000000"], ["Privacy", "/privacy"], ["Terms", "/terms"]] },
];

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-16 md:px-10">
      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSmileCircle className="size-4.5" />
            </span>
            <span className="font-display text-lg font-semibold">BotForge</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Build, deploy and manage Telegram bots from one AI-powered platform.
          </p>
        </div>
        {footerCols.map((c) => (
          <div key={c.title}>
            <h3 className="font-mono text-xs uppercase tracking-widest text-accent">{c.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l[0]}>
                  <a href={l[1]} className="break-all text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l[0]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 w-full max-w-6xl border-t border-border pt-6 font-mono text-xs text-muted-foreground">
        © {new Date().getFullYear()} BotForge. Not affiliated with Telegram.
      </div>
    </footer>
  );
}
