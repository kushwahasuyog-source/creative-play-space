import { createFileRoute } from "@tanstack/react-router";

import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import {
  Automation,
  BuilderDemo,
  Cta,
  Faq,
  Features,
  Footer,
  HowItWorks,
  Pricing,
  Templates,
} from "@/components/landing/Sections";

const title = "BotForge — Build Telegram bots with AI";
const description =
  "Describe your Telegram bot in plain language. BotForge generates it, connects your BotFather token, deploys it, and manages commands, automations and analytics.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:url", content: "/" },
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <BuilderDemo />
        <Features />
        <Templates />
        <Automation />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
