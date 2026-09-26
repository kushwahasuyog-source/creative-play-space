import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — BotForge" },
      { name: "description", content: "The terms for using BotForge to build and host Telegram bots." },
      { property: "og:title", content: "Terms of Service — BotForge" },
      { property: "og:description", content: "The terms for using BotForge." },
      { property: "og:type", content: "article" },
    ],
  }),
  component: () => (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link to="/" className="text-sm text-accent">← BotForge</Link>
      <h1 className="mt-4 text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: September 26, 2026</p>
      <div className="mt-8 space-y-4 text-muted-foreground">
        <p>You're responsible for the bots you build and must follow Telegram's terms.</p>
        <p>Don't use BotForge for spam, abuse or illegal content. We may suspend bots that do.</p>
        <p>The service is provided as-is. Questions? <a className="text-accent" href="mailto:hello@botforge.app">hello@botforge.app</a> or <a className="text-accent" href="tel:+10000000000">+1 000 000 0000</a>.</p>
      </div>
    </main>
  ),
});
