import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { property: "og:url", content: "/privacy" },
      { title: "Privacy Policy — BotForge" },
      { name: "description", content: "How BotForge collects, uses and protects your data." },
      { property: "og:title", content: "Privacy Policy — BotForge" },
      { property: "og:description", content: "How BotForge collects, uses and protects your data." },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: () => (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link to="/" className="text-accent hover:underline">Home</Link> <span aria-hidden>/</span> <span aria-current="page">Privacy Policy</span></nav>
      <h1 className="mt-4 text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: September 26, 2026</p>
      <div className="mt-8 space-y-4 text-muted-foreground">
        <p>We store your email, the bots you create and the messages your bots receive so we can run them for you.</p>
        <p>Bot tokens are stored encrypted. We never sell your data.</p>
        <p>We use essential cookies only to keep you signed in and remember your preferences.</p>
        <p>To delete your data, email <a className="text-accent" href="mailto:hello@botforge.app">hello@botforge.app</a>.</p>
      </div>
    </main>
  ),
});
