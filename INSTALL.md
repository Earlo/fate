# Quick Installation Instructions for Development

These instructions will get the Fate Character Sheet Manager software running on your local machine so that you can
help with development.

1. Install external dependencies.
2. Install internal dependencies.
3. Configure the software.
4. Run the code and visit the site in your browser.

## Install external dependencies

The Fate Character Sheet Manager requires the following pieces of software be run locally.

- Node.js - Any version greater than or equal to 18.
- Docker Desktop (or Docker Engine + Docker Compose).

### Installation notes for macOS (M1+)

#### Nodejs

If you use the following command in a terminal, and your Nodejs version that it reports is greater than 18, then you are
good to go with this dependency.

```bash
node --version
v24.x.x
```

I like to use [Node Version Manager](https://github.com/nvm-sh/nvm) to manage Nodejs so that I can easily switch between
versions.

If Nodejs is not installed, or if the version of your Nodejs installed on your workstation is lower than 18, then I recommend
NVM to install Nodejs. Follow the documentation for NVM to install it and learn how to switch versions.

Once NVM is installed, use these commands to install and use version the version of NodeJS you want to use.

```bash
nvm install 24
nvm use 24
```

### Installation for other operating system environments.

TODO: Somebody with access to other operating system environments needs to write this section.

## Install internal dependencies

Open a terminal or command line utility and navigate to the directory where the Fate Character Sheet Manager has been placed.

Run the following command to install the internal dependencies.

```bash
npm install
```

## Configure the software

In the same directory, make a copy of the file `.env.example` named `.env`

```bash
cp .env.example .env
```

For local development with Docker Compose, the database and Garage services are provided by containers, so you can leave
`DATABASE_URL` empty in `.env`. If you want image uploads, follow the Garage setup below or configure Cloudinary.

### Realtime configuration (SSE vs Ably)

By default, realtime updates use server-sent events and in-memory state (`NEXT_PUBLIC_P2P_CONNECTION_TYPE=SOCKET`). This works for
local dev and traditional servers.

For Vercel/serverless deployments where shared in-memory state is not available, set:

- `NEXT_PUBLIC_P2P_CONNECTION_TYPE=ABLY`
- `ABLY_API_KEY=...`

The `NEXT_PUBLIC_P2P_CONNECTION_TYPE` setting ensures clients connect directly to Ably instead of SSE.

## Run the code and visit the site in your browser

Run this command to get the Fate Character Sheet Manager software running in a local development environment.

```bash
docker compose -f docker-compose.dev.yml up --build
```

Open the URL `http://localhost:3000` in a browser on your workstation!

## Image storage (Garage) setup for development

The dev stack now ships a Garage v2.1.0 object storage service for hosting uploaded images. Follow the one-time setup in `garage/README.md` to initialize the Garage node, create an access key/secret, and add the bucket that the app expects. Then set the `GARAGE_*` variables in your `.env` before running `docker compose -f docker-compose.dev.yml up`.

If you prefer Cloudinary, set `STORAGE_PROVIDER=cloudinary` and provide your `NEXT_PUBLIC_CLOUDINARY_*` values instead.

## Production Docker Compose

The production compose file builds the app and runs `npm run build` (including Prisma migrations) before starting the server.

1. Copy `.env.example` to `.env` and fill in the production values:
   - `NEXTAUTH_URL` and `NEXTAUTH_SECRET`
   - `DATABASE_URL` (must point to the `db` container or an external Postgres instance)
   - `GARAGE_*` or `STORAGE_PROVIDER=cloudinary` with Cloudinary variables
2. Start the stack:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

The app listens on `http://localhost:3000`.
