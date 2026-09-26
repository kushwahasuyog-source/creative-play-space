import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "@untitledui/icons";

import { Section, SectionHeading } from "@/components/landing/primitives";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Sections";
import {
  DualCta,
  InlineCta,
  SingleCta,
  TrustIndicators,
  TrustStats,
} from "@/components/marketing/CtaBlocks";
import { CompactCountdown, CountdownBanner } from "@/components/marketing/Countdown";
import { LeadCaptureBar } from "@/components/marketing/LeadCaptureBar";

const title = "UI blocks — CTAs, countdowns & lead capture | BotForge";
const description =
  "Call-to-action blocks, trust indicators, countdown timers and a floating lead capture bar, styled in the BotForge design system.";

export const Route = createFileRoute("/components")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlocksPage,
});

function BlocksPage() {
  return (
    <div className="min-h-screen bg-background pb-40">
      <Nav />
      <main>
        <Section id="countdown">
          <SectionHeading
            eyebrow="Countdown"
            title="Urgency countdown timers"
            description="Flip-clock banner and a compact inline variant. Both tick in real time and reset on demand."
          />
          <div className="mt-10 space-y-6">
            <CountdownBanner />
            <div className="flex flex-wrap gap-4">
              <CompactCountdown />
            </div>
          </div>
        </Section>

        <Section id="cta" className="bg-surface/40">
          <SectionHeading
            eyebrow="Call to action"
            title="CTA blocks"
            description="Single, dual and inline layouts, each with badge, headline and button hierarchy built in."
          />
          <div className="mt-10 space-y-6">
            <SingleCta />
            <DualCta />
            <InlineCta
              icon={Zap}
              title="Need a custom integration?"
              description="Our team wires your bot into any API or internal system."
            />
          </div>
        </Section>

        <Section id="trust">
          <SectionHeading
            eyebrow="Social proof"
            title="Trust indicators"
            description="Avatar clusters, star ratings and platform stats to reinforce credibility."
          />
          <div className="mt-10 space-y-8">
            <TrustIndicators />
            <TrustStats />
          </div>
        </Section>
      </main>
      <Footer />
      <LeadCaptureBar />
    </div>
  );
}
