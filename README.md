# line-mini

LINE MINI App starter based on the LINE codelab:
https://codelab.line.me/codelabs/line-mini-app/#0

## Files

- `index.html`: UI + LIFF SDK script
- `index.js`: LIFF initialization and feature handlers
- `style.css`: basic styling
- `.env.example`: values to replace for your channel

## Setup

1. Create `.env` from `.env.example`
2. Fill values:
   - `LIFF_ID`: your LIFF app id
   - `LINE_BOT_ID`: your LINE Official Account bot id
   - `MINIAPP_URL`: optional shortcut URL (if empty, app uses `https://miniapp.line.me/${LIFF_ID}`)
3. Open the app in your dev environment (StackBlitz or local server)
4. If your env tool does not inject `.env` into browser code, pass `liffId` via URL:
   - `...?liffId=2000000000-XXXXXXXX`

## Required LINE Console settings

- Scope: `profile`, `openid`
- Enable email permission if you want to display user email
- Enable APIs used by this app:
  - `shareTargetPicker`
  - `scanCodeV2`
  - `createShortcutOnHomeScreen`

## Implemented features

- Profile and ID token info
- Login / Logout behavior
- Send message in LINE client
- Share Target Picker
- Scan QR code
- Open external window
- Add shortcut on home screen
- Friendship check and add-friend link
