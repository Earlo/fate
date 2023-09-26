# Quick Installation Instructions for Development

These instructions will get the Fate Character Sheet Manager software running on your local machine so that you can
help with development.

1. Install External Dependencies.
2. Install Internal Dependencies.
3. Configure the software.
4. Run the code and visit the site in your browser.

## Install External Dependencies.

The Fate Character Sheet Manager requires the following pieces of software be run locally.

- Nodejs - Any version greater than or equal to 18.
- MongoDB - Any modern version should work.

### Installation for Mac OS X Ventura on an M1 processor.

#### Nodejs

If you use the following command in a terminal, and your Nodejs version that it reports is greater than 18, then you are
good to go with this dependency.

```bash
node --version
v20.6.1
```

I like to use [Node Version Manager](https://github.com/nvm-sh/nvm) to manage Nodejs so that I can easily switch between
versions.

If Nodejs is not installed, or if the version of your Nodejs installed on your workstation is lower than 18, then I recommend
NVM to install Nodejs. Follow the documentation for NVM to install it and learn how to switch versions.

Once NVM is installed, use these commands to install and use version the version of NodeJS you want to use. I am using the
current version of Nodejs, 20.6.1.

```bash
nvm install 20
nvm use 20
```

#### Mongodb

Use [Homebrew](https://docs.brew.sh) to install Mongodb Community Edition on your workstation. Follow [Homebrew's
installation instructions](https://docs.brew.sh/Installation) to install it, then use these commands to install MongoDB Community
Edition and the MongoDB Compass tool to troubleshoot data problems.

```bash
brew install mongodb-community mongodb-compass
```

Use this command to start the Mongodb Community Edition server, and to make sure it is started when you next login.

```bash
brew services start mongodb-community
```

### Installation for other operating system environments.

TODO: Somebody with access to other operating system environments needs to write this section.

## Install Internal Dependencies

Open a terminal or command line utility and navigate to the directory where the Fate Character Sheet Manager has been placed.

Run the following command to install the internal dependencies.

```bash
npm install
```

## Configure the software.

In the same directory, make a copy of the file `.env.example` named `.env`

```bash
cp .env.example .env
```

Edit the `.env` file so the line for the`MONGO_URL` variable looks like this:

```bash
MONGO_URL=mongodb://127.0.0.1:27017/fate
```

All other variables can be left empty at this time.

## Run the code and visit the site in your browser.

Run this command to get the Fate Character Sheet Manager software running in a local development environment.

```bash
npm run dev
```

If it looks similar to this, then you are ready for the next step.

```bash
% npm run dev

> fate@0.1.0 dev
> next dev

- info Loaded env from /Users/johnhelmuth/src/fate/.env
- ready started server on [::]:3000, url: http://localhost:3000
- event compiled client and server successfully in 97 ms (18 modules)
- wait compiling...
- event compiled client and server successfully in 91 ms (18 modules)
- info Loaded env from /Users/johnhelmuth/src/fate/.env
- info Loaded env from /Users/johnhelmuth/src/fate/.env
- wait compiling...
- event compiled successfully in 243 ms (205 modules)
- warn Fast Refresh had to perform a full reload. Read more: https://nextjs.org/docs/messages/fast-refresh-reload
- wait compiling / (client and server)...
- event compiled client and server successfully in 65 ms (351 modules)
- wait compiling /api/auth/[...nextauth] (client and server)...
- event compiled successfully in 19 ms (131 modules)
[next-auth][warn][NEXTAUTH_URL]
https://next-auth.js.org/warnings#nextauth_url
[next-auth][warn][NO_SECRET]
https://next-auth.js.org/warnings#no_secret
```

Open the URL `http://localhost:3000` in a browser on your workstation!
