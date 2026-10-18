# Clean Mode – Keyboard & Screen Cleaner

**Live:** https://keycleaner.gumber.ai/

A web page that locks your keyboard, trackpad or touchscreen on a timer so you can wipe it clean without typing, clicking, tapping or swiping anything. Works on Mac, Windows, iPhone, iPad and Android.

## How to use

1. Open the page in Chrome or Edge (Arc works too on Mac).
2. Click **Start Cleaning Mode**.
3. Wipe away. The screen goes black so smudges on the display show up, and the page blocks key presses, clicks, scrolling, pinch-zoom and swipe-back.
4. It unlocks when the timer ends. To unlock early, press and hold the trackpad or hold **esc** for 3 seconds.

**Options**

- **Timer:** 30 s, 1 min, 2 min, 5 min or no limit.
- **Screen:** black screen to reveal smudges, and keep the display awake while you clean.
- **Unlocking:** press and hold the trackpad, hold esc, or both.
- **What's blocked:** detects whether you're on a Mac or Windows PC and which browser you use, then lists what Clean Mode blocks, what needs a quick setting, and what can't be blocked.

Your options are remembered in your browser. Nothing is installed or uploaded.

## Phones and tablets

Open the page in any browser on iPhone, iPad or Android and tap **Start Cleaning Mode**. The screen turns black and taps and swipes are ignored. To unlock early, hold a finger still on the status card for 3 seconds; moving or touching in several places (like a cloth) cancels it.

- **iPhone / iPad:** turn on Guided Access to also block edge swipes and the Home gesture. Add Clean Mode to the Home Screen for a full black screen on iPhone.
- **Android:** turn on app pinning to stop edge swipes leaving the page.
- Hardware buttons are always handled by the phone.

## What a web page can't block

The operating system handles some keys before any browser sees them.

**Mac**
- **Brightness, volume and media keys.** Turn on *System Settings → Keyboard → Keyboard Shortcuts… → Function Keys → Use F1, F2, etc. keys as standard function keys* while you clean, and the page blocks them as normal F-keys. Holding **fn** still switches them back to media keys.
- **fn (🌐) key** and the **Touch ID / power key.** Wipe these gently or last.

**Windows**
- **Brightness, volume and media keys.** Turn on **Fn Lock** (usually **Fn + Esc**, or a key with a padlock) so the top row sends F1–F12, which the page blocks. Some laptops set this in the maker's app or the BIOS instead.
- **Ctrl + Alt + Del**, the **Fn** key and the **power button.** Wipe these gently or last.
- **Three- and four-finger touchpad swipes.** Set them to *Nothing* in *Settings → Bluetooth & devices → Touchpad* while you clean.

## Files

- `public/index.html`: the page, cleaning guide and FAQ
- `public/app.js`: the lock logic
- `public/og.png`, `public/favicon.svg`, `public/icon-*.png`: share image and icons
- `public/manifest.webmanifest`: lets phones add Clean Mode to the home screen
- `public/sitemap.xml`, `public/robots.txt`: for search engines
- `public/llms.txt`: a plain summary for AI assistants
- `public/_headers`: security and caching headers for Cloudflare
- `public/404.html`: page shown for unknown addresses
- `wrangler.toml`: Cloudflare Worker settings

## Deploy to Cloudflare

The site is served by a Cloudflare Worker with static assets (see `wrangler.toml`). Every push to `main` deploys automatically through Cloudflare's Git integration. To deploy by hand:

```bash
npx wrangler deploy
```

## Run it locally

```bash
python3 -m http.server 8765 --directory public
```

## License

MIT
