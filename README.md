# Foxionos

Foxionos is a discord bot template you can use to make your own bot. The name comes from the person who asked me to code this. A bot created from this template is used in [this discord community](https://discord.gg/6Eyv4tYXvf).

## I Used:
- [discord.js v13](https://www.npmjs.com/package/discord.js) to interact with the Discord API
- [mongoDB](https://www.npmjs.com/package/mongodb) as a cloud database
- [TypeScript](https://www.npmjs.com/package/typescript) because I hate JavaScript
- [ts-node](https://www.npmjs.com/package/ts-node) to run TypeScript project
- [Heroku](https://www.heroku.com/) to host the bot

## Current Features:
- Earn currency by typing in any chat (only once every 3 minutes)
- "Claim" your friends by spending currency, which increases their value
- Buy gifts to your friends to increase their value further
- Challange your friends in the leaderboard to become the richest or most valuable person

## Setting Up:
Follow [this guide](https://discordjs.guide/) up until **"Creating Your Bot"**. You will install Node.js, set up a Bot Application and add that bot to your server. You can follow the rest of the guide if you want to create your own bot but to create a bot from this template, this is enough. Clone this repository and fill in the values in the [config file](config.ts). Lastly, open up your terminal and run `npm run init`. Your bot will connect to your application. If you want the bot to be online 24/7, you will need to use a cloud hosting service like Heroku.
