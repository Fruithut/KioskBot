# KioskBot 📻
A hastily put together discord bot for NodeJS that streams music from youtube

1. Remember to pull down the lastest version of [discord.js](https://github.com/discordjs/discord.js) from their repository before running npm install
2. Replace the token in config.json with your own
3. Run "npm install node-opus" if it did not install properly regular "npm install" (bot will crash on play without it)

- In [config.json](config.json) you can specify which prefix you want for the commands available to the bot, example: "?play"
- Built in commands are:
  - Play {youtube-link} (adds song to queue if currently playing)
  - Skip
  - Stop
  - Pause
  - Resume
