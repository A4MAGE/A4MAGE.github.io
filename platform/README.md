# Platform App

This folder contains the main MAGE platform app. It combines authentication, preset browsing, preset creation, profile management, and live broadcast rooms on top of the MAGE engine and Supabase.

The engine itself comes from the external `@notrac/mage` package. This repo uses it, but does not maintain the library.

## What You Can Do

- Sign up and sign in with Supabase auth.
- Browse community presets or load the built-in base presets.
- Open the engine player and pair a preset with audio.
- Create and save your own presets.
- Edit your profile, avatar, and bio.
- Start or join a live broadcast room.
- Use the homepage app through the catch-all route inside the same workspace.

## Getting Started

From the `platform` folder:

```bash
npm install
npm run dev
```

Other available scripts:

- `npm run build` builds the production bundle.
- `npm run lint` runs ESLint.
- `npm run preview` previews the production build locally.

## App Structure

The router is defined in `src/router.tsx` and splits the app into three groups:

| Area | Routes | Purpose |
| --- | --- | --- |
| Public auth | `/signin`, `/signup`, `/login` | Account access and redirects |
| Public broadcast viewer | `/broadcast/room/:roomId` | Join a live room as a viewer |
| Authenticated app | `/profile`, `/explore`, `/player`, `/my-presets`, `/create`, `/broadcast`, `/broadcast/host/:roomId` | Main platform experience behind auth |
| Homepage fallback | `/*` | Loads the homepage app from the sibling `homepage` folder |

The authenticated section is wrapped by `PrivateRoute`, so users without a session are sent back to the public flow.

## Main Screens

`/signin` and `/signup` handle the Supabase login flow. The signup screen shows a success state before sending the user back to sign in.

`/profile` lets the user update their display name, bio, and avatar, and shows recent presets for quick reuse.

`/explore` is the community preset browser. Selecting a preset sends it to the player.

`/player` is the visualizer and preset launcher. It can load community presets, built-in base presets, or uploaded audio, and it can save the current engine state back into Supabase.

`/my-presets` lists the user’s saved presets and supports edit, rename, and delete actions.

`/create` is the preset authoring view. It loads the engine with controls enabled and moves the engine’s editing docks into the page layout for easier editing.

`/broadcast` starts or lists live rooms. The host flow lives at `/broadcast/host/:roomId`, while viewers join through `/broadcast/room/:roomId`.

## Data And Dependencies

- `src/supabaseClient.ts` creates the Supabase client from the Vite env values.
- `src/context/AuthContext.tsx` keeps the browser session in sync across the app.
- `vite.config.ts` aliases the sibling `homepage`, `audio`, and `search` folders so the platform app can reuse shared workspace code.

The app also depends on Supabase storage for avatars and preset thumbnails, plus the `preset` and `profile` tables and the `preset_with_username` view/query source used by the UI.

## Notes For Maintainers

- Avoid enabling React Compiler here. It caused page reload and ordering issues in this app.
- Keep noisy debug logging out of auth code unless it is strictly temporary.
- The MAGE engine can emit errors during `engine.dispose()`. That behavior is known in the external library.
- The production build uses Vite/Terser settings in `vite.config.ts` to keep the engine runtime stable.

## Quick Mental Model

If you are trying to understand the app quickly, start with these files:

- `src/router.tsx` for the route map.
- `src/context/AuthContext.tsx` for login state.
- `src/components/Player.tsx` for the main engine and preset workflow.
- `src/components/Profile.tsx` for account management.
- `src/components/broadcast/BroadcastHost.tsx` and `src/components/broadcast/BroadcastViewer.tsx` for live rooms.
