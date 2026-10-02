# BotForge roadmap

## Done — marketing site

- [x] Landing page (hero, how it works, pipeline, features, templates, automations, pricing, FAQ, footer)
- [x] CTA blocks (single, dual, inline, trust indicators, stats)
- [x] Countdown timers (flip-clock banner + compact)
- [x] Floating lead capture bar
- [x] /components showcase page

## Done — phase 1: accounts, AI bot builder, live Telegram bots

- [x] Accounts (email + password sign-up / sign-in) at /auth
- [x] Database: profiles, bots, bot_commands, bot_messages, templates (8 seeded) with owner-only access
- [x] Bots dashboard at /app
- [x] AI builder at /app/new — prompt → generated name, persona, commands, replies
- [x] Bot page at /app/bots/:id — commands, behaviour, token connection, go live, recent messages
- [x] Templates at /app/templates — fork into the builder
- [x] Telegram webhook per bot with verified secret, command replies + AI fallback
- [x] BotFather tokens verified and stored encrypted

## Next phases

- [ ] Rebuild the landing and app presentation with a complete Origin UI-inspired card, grid, typography, and spacing system
- [ ] Check access to and clone `kushwahasuyog-source/web-playtime-creator` if available
- [ ] Bot Directory (public listing of published bots)
- [ ] Workflow Builder (triggers, conditions, actions)
- [ ] Bot Analytics (users, messages, retention charts)
- [ ] Bot Hosting (beyond on/off: logs, restarts, usage limits)
- [x] AI Coding Assistant at /app/assistant — streaming chat that writes and debugs Telegram bot code
- [x] Assistant → builder / templates handoff (build this bot, save as template)
- [ ] End-to-end Telegram walkthrough verified with a real BotFather token (needs the user's token)
