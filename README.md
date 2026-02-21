# Add to Lunatask

A Chrome extension that adds the current page as a task in [Lunatask](https://lunatask.app).

# About
I'm a big fan of Lunatask. It's one of the few task managers which stores your tasks encrypted, so that even the company can't read them. 

But unlike most task managers, there isn't an accompanying extension which allows you to add web links as tasks. You can do it via a book mark, but this just feels little old-school, even for me. 

Thanks to Claude Code, writing something like this is easy enough even for me -- so I put this together for myself, and I'm publishing the code for anyone who wants to take it and make it better. I might make some improvements over time, but this does everything that I want it to do.

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked** and select the `lunatask-extension` folder

The settings page will open automatically on first install.

## Settings

Open the settings page at any time via the gear icon in the extension popup, or through **chrome://extensions → Add to Lunatask → Details → Extension options**.

**API token** — Generate a token in the Lunatask desktop app under **Settings → Access tokens**, then paste it into the token field. Click **Verify token** to confirm it works before saving.

**Areas** — Lunatask areas must be added manually, as the API does not expose area names. For each area you want to use, enter a display name and the area's UUID. You can find the UUID in the Lunatask web or desktop app — open the area and look for it in the URL or in the area's own settings. Add as many areas as you like, then choose which one should be selected by default. Click **Save settings** when done.

## Usage

Click the extension icon on any page. The task name is pre-filled with the page title and the note field contains the URL. Edit either as needed, choose an area from the dropdown, optionally set a date, and click **Add task**. The popup closes automatically on success.

## Licence

[GPL-3.0](LICENSE) © 2026 Ian Betteridge
