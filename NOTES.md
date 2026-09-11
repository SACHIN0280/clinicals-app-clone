# NOTES.md

## 2. Notifying the Team

### 2a. Which notification service would you use, and why?

**Choice: Supabase Database Webhooks → a lightweight Edge Function → WhatsApp Business API (via Twilio or 360dialog)**

**Reasoning:**

The Clinicals team is in the healthcare space in India, which means they are almost certainly already on WhatsApp. Sending a WhatsApp message to a team group or shared number when a new lead comes in is far more actionable than email: it is seen immediately, can be acted on with a single tap (since the phone numbers are in the message), and doesn't require the team to have yet another app installed.

The architecture is:
1. A **Supabase Database Webhook** fires on `INSERT` to the `enquiries` table.
2. This calls a **Supabase Edge Function** (Deno), which:
   - Formats the lead data into a WhatsApp message template.
   - Calls the **WhatsApp Business API** via Twilio or 360dialog with the team's registered number.
3. The team receives: *"New lead: Priya Sharma, +91 98765 43210, Mumbai. Tap to open: https://app.clinicals.in/dashboard"*

**Why not SMS or email?**
- SMS: Costly, no rich formatting, easily ignored.
- Email: Slow open rates in fast-paced clinical ops environments.

**Fallback (see 2c):** If WhatsApp API call fails, the Edge Function falls back to a Resend/SendGrid email notification so the team is never left uninformed.

---

### 2b. Where would you store the API secret?

**In Supabase Edge Function environment variables (Secrets).**

Supabase provides a first-class secret management system for Edge Functions via `supabase secrets set`. These are:
- Encrypted at rest.
- Never exposed in client-side code (Edge Functions run server-side on Deno Deploy).
- Accessible in code via `Deno.env.get('WHATSAPP_API_KEY')`.
- Scoped to the project — rotating them doesn't require a redeployment of the function, only `supabase secrets set` again.

The secrets are never committed to version control. The `.env` file for local development uses a placeholder and is `.gitignore`d.

---

### 2c. What is your fallback if the notification service is down?

The enquiry should still be saved successfully in Supabase even if the notification service is unavailable. Notification delivery should be handled separately from the enquiry submission so that a third-party API failure does not prevent the lead from being created.

If the notification request fails, the system can log the failure and retry it later. The team can also see the enquiry directly from the dashboard and contact the lead manually if required.

3. **Visibility:** **Visibility:** I would implement a subtle "notification status" indicator per lead so the team knows if automatic notification failed and can manually reach out.

---

## 5. Making it installable

### Service Worker Update Strategy

I use **`registerType: 'prompt'`** from `vite-plugin-pwa` (backed by Workbox). This means:
- On first visit, the service worker installs silently. The `UpdatePrompt` component shows a dismissable toast: *"App ready offline"*.
- When a new version is deployed, the next time the user opens the app (or the SW checks in the background every 24h), it detects the new SW waiting. The `UpdatePrompt` component shows: *"Update available — Reload to update"*.
- The user taps "Reload to update", which calls `updateServiceWorker(true)`, skipping the waiting phase and reloading to activate the new SW immediately.

**Why `prompt` instead of `autoUpdate`?**
Auto-update (`registerType: 'autoUpdate'`) reloads the tab without warning, which is disruptive if the user is mid-flow (e.g., typing notes). A manual prompt gives the user control while still surfacing updates promptly.

**Offline behavior:**
- Vite build assets (JS, CSS, HTML) are pre-cached on install — the app shell always loads offline.
- Supabase API calls will naturally fail offline. The dashboard shows a clean offline state (the fetch error state already handles this).
- The enquiry form is not designed for offline submission (queuing leads locally adds significant complexity with little payoff for this MVP).

---

## 6. Making it work on Android

### 6a. How would you convert this React app into an Android APK?

**Option A — PWA (recommended for this product):**
Since this is already a PWA (manifest + service worker), Android users on Chrome can "Add to Home Screen" to get an app-like experience without an APK. For a more native integration (including app store listing), use **Bubblewrap** (Google's official CLI) or **PWABuilder** to wrap the PWA in a **Trusted Web Activity (TWA)** and export a signed `.aab`/`.apk`. This produces a signed Android app suitable for Play Store submission while reusing the existing web code.
**Option B — Capacitor:**
If native device APIs are needed (push notifications, camera, etc.), wrap with **Capacitor** (`npm install @capacitor/core @capacitor/android`), then `npx cap add android && npx cap sync`. This generates a native Android project that wraps the web app in a WebView with native bridge access.

---

### 6b. How would you build the APK without Android Studio?

Using **Bubblewrap CLI** (for TWA):
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://your-app.vercel.app/manifest.json
bubblewrap build
```
This requires only the **Android command-line tools** (not the full Android Studio IDE):
```bash
# Install via sdkmanager (part of cmdline-tools package)
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```
The final `.apk`/`.aab` is produced without ever opening Android Studio.

For **Capacitor**, you'd use `./gradlew assembleRelease` from the `android/` directory — also no IDE required.

---

### 6c. If you ship an APK directly (not via Play Store), how would users get updates?

Since there's no Play Store to push updates, I would implement **in-app update checking**:

1. Host a `version.json` file at a known URL (e.g., `https://your-app.vercel.app/version.json`) containing `{ "version": "1.2.0", "apk_url": "https://..." }`.
2. On app startup, the app fetches this file and compares with the bundled version.
3. If a newer version is available, show a dialog: *"A new version is available. Download now?"* — tapping downloads the APK directly.
4. On Android, the user grants "Install from unknown sources" once, and subsequent updates are seamless.

For **TWA / Bubblewrap** apps, updates are actually handled like a PWA update — the new web assets are deployed and the app automatically serves them on next launch (no APK re-install needed). This is the key advantage of TWA over a native WebView approach.

---

### 6d. How would you handle a database migration without breaking old APKs?

**Strategy: backwards-compatible, additive-only migrations with a versioned API layer.**

1. **Never remove or rename existing columns** in a migration — only add new ones. Old APK versions still work because they only query columns they know about.

2. **API versioning (if applicable):** If the app talks to a custom API, version endpoints (`/api/v1/`, `/api/v2/`). Old APKs call v1 which remains stable; new features go to v2.

3. **Feature flags via remote config:** New UI features that depend on schema changes are gated behind a feature flag fetched from the server. Old APKs without the flag UI simply skip the column.

4. **Forced upgrade for breaking changes:** If a migration is truly breaking (e.g., a column type change that old clients can't handle), the server returns a specific HTTP status or flag (`"force_upgrade": true`) and the old app shows a mandatory upgrade screen.

5. **For Supabase specifically:** Use Supabase's migration files (`.sql` in `supabase/migrations/`). Every migration is versioned and applied in order via `supabase db push`, with the migration history tracked in the `supabase_migrations` table.

---

## AI Usage

AI tools were used as a development and learning assistant during this project.

### How AI was used

AI assistance was mainly used for:

- Debugging and resolving implementation issues.
- Getting guidance on React, Supabase, PWA, and mobile-related concepts.
- Exploring implementation approaches when I was unfamiliar with a particular requirement.
- Refining some UI and code during development.
- Drafting and improving the written sections of this document.

I reviewed, tested, and modified the implementation during development and verified the main functionality against the assignment requirements.

### Example of an AI suggestion I rejected

The AI suggested adding an additional UI/component library for some parts of the dashboard. I decided not to use it because the required functionality could be implemented with React and Tailwind CSS, keeping the project lightweight and aligned with the assignment requirements.

