# Fate Character Sheet Manager

Something I made to help me run a game based on Fate Core rules.
Not super professional, but happy to help if someone wants to use this also.

### Project goals

This software isn't meant to be a virtual table top simulator or an online RPG platform, but instead a simple additional tool to use in live game sessions, making them more streamlined by providing each player with access to all the relevant information.

## Features

- Create Character Sheets
  - Possible skills are tied to campaigns you are taking part in
  - Also supports free form skill input
  - LLM powered note writing tool for the DM (WIP)
- Create Campaigns
  - Define Skills used in campaign
  - Define aspects of the campaign
  - Group characters
  - Makesift battlemap system by setting a group to be grid
  - Reveal partial character sheets to players as GM

## Database setup (Prisma)

- Set `DATABASE_URL` in `.env` (Neon connection string for Vercel works here too) — Prisma CLI and the Prisma Client read it via `prisma.config.ts` / `lib/prisma.ts`.
- Install deps if you have not already: `npm install` (updates `@prisma/client` and `prisma`).
- Create tables in a new database with `npm run db:push` (or run the committed migration with `npm run db:deploy`).
- Optional: open Prisma Studio to inspect data: `npm run db:studio`.

![Example sheet form the app](/readme/example_sheet.png?raw=true 'Example sheet form the app')

![Example of group](/readme/faction_view.png?raw=true 'Example of groups')

## Using the software

- Demo is running at https://fatecore.opensauce.fi
- For running your own instance, check INSTALL.md (thanks to [John Helmuth](https://github.com/johnhelmuth) for writing the instructions)

## Production Docker Compose

`docker-compose.prod.yml` builds the app and runs Prisma migrations on startup. Set `NEXTAUTH_URL`, `NEXTAUTH_SECRET`,
`DATABASE_URL`, and storage-related variables in `.env`, then run:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

## Contact

if you want to contact me, you can do so by writing email to: fatecore@opensauce.fi
