# BotForge: import + full polish pass

## Step 0: Bring the site into this project
- Copy the uploaded BotForge code (the marketing site, /components, the /app dashboard, the builder, templates, the AI assistant and the Telegram webhook) into this project. Leave out git files, `.env` and old credentials.
- Turn on Lovable Cloud and recreate the database: profiles, bots, bot commands, bot messages, and the 8 seeded templates, all with owner-only access.
- Rebuild the missing `/auth` sign-in / sign-up page. The roadmap lists it, but the file isn't in the ZIP.
- Existing accounts and bots from the old backend won't carry over. Everyone signs up fresh here.

## Part 1: Fixes
- **Layout (1–5):** remove all sideways scrolling, fix overflow on small screens, enlarge tap targets, add a slide-out hamburger menu on the landing page and in the app, and check each page at phone, tablet and desktop widths.
- **Links (6–10):** check every nav link, footer link and button. Remove or connect dead ones, and make the logo lead home.
- **SEO (11–14):** give every page a unique title, description and share tags, and mark the app pages noindex. Keep the favicon and make sure it's linked. The footer year updates itself.
- **Content (15–19):** replace any placeholder text, and add a branded 404 page. Add friendly empty states for bots, messages and templates. Show clear error and success toasts for every form and action.
- **Contact (20–21):** add a contact section with clickable email and phone links. I'll use placeholders you'll need to confirm.
- **Images (22):** compress the assistant image and lazy-load images.

## Part 2: Features
- **UI:** dark/light toggle that's remembered, sticky header with a blur, consistent hover states, back-to-top button, loading skeletons in the app, and a scroll progress bar.
- **Navigation / accessibility:** a Cmd/Ctrl+K search across pages, landing sections and templates. Add a skip-to-content link, and turn the existing FAQ into an accordion.
- **Forms:** a show/hide password toggle, a shared success and error pattern, confirmation dialogs before deleting a bot, disconnecting a token or going live, and copy buttons for webhook URLs, bot links and code.
- **Trust:** a cookie banner that remembers your choice, plus new /privacy and /terms pages with a "Last updated" date. UTM tags are saved on the first visit and attached to sign-ups.
- **Extras:** a print-friendly layout, and a floating contact button with email and WhatsApp options.

## Technical notes
- Copy the files with rsync, excluding `.git`, `.env` and `node_modules`. Then install dependencies and apply the drizzle SQL as a Cloud migration, with grants added.
- Build the new pieces as shared components in `src/components/site/`: ThemeToggle, ScrollProgress, BackToTop, CookieBanner, FloatingContact, SearchDialog, CopyButton, ConfirmDialog.
- Mount the new pieces in `__root.tsx`. Add a `notFoundComponent`, and put print rules in `styles.css` under `@media print`.
- Store UTM tags in localStorage and pass them into sign-up user metadata.

## At the end
I'll send a list covering each numbered item.
