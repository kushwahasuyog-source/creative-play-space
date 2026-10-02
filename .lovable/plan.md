# Bots dashboard expansion

## What will change
- Keep `/app` as the main dashboard and preserve the current green frontend theme.
- Expand each bot entry to show status, Telegram connection, recent activity, message count, and recent saved chat threads.
- Add direct actions for opening the bot, continuing a chat, editing it, and deleting it.
- Add an edit mode on the bot page for the bot name, description/prompt, persona, system instructions, fallback reply, and command details.
- Add clear confirmation and feedback for destructive actions; deleting a bot will also remove its commands, Telegram messages, chat threads, and chat messages.

## Data and behavior
- Extend the existing bot functions instead of adding a new data model.
- Return dashboard chat summaries in one server request to avoid separate requests per card.
- Validate ownership before every edit or delete and keep all sensitive operations on the server.
- If a live bot is deleted, remove its Telegram webhook before deleting its stored data when possible.

## Verification
- Test listing bots, opening recent chats, saving edits, cancelling edits, deleting a bot, empty states, and phone/desktop layouts.
- Confirm metadata remains unique and the current build has no errors.
