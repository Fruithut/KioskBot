const { token, prefix } = require('./config.json');
const ffmpeg = require('ffmpeg-static');
const ytdl = require('ytdl-core');
const fs = require('fs');
const Discord = require('discord.js');
const globalQueueMap = new Map();
const client = new Discord.Client();
client.commands = new Discord.Collection();

// Fetch command modules
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.login(token);
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    await parseCommand(message, command, args);
});

async function parseCommand(message, command, argsList) {
    const queueFromRequest = globalQueueMap.get(message.guild.id);

    if (command == 'play') {
        await handleMediaPlayback(message, argsList, queueFromRequest)
    } else if (client.commands.get(command)) {
        client.commands.get(command).execute(message, queueFromRequest)
    } else if (command == 'help') {
        message.react('🔧');
        message.channel.send(`Commands available:\n${prefix}play {youtube-link}\n${prefix}pause\n${prefix}resume\n${prefix}stop\n${prefix}leave\n${prefix}help`);
    } else {
        message.react('❓');
        message.channel.send('Command not understood please refer to the instructions manual: ?help');
    }
}

async function handleMediaPlayback(message, argsList, serverQueue) {
    const voiceChannel = message.member.voice.channel;
    const youtubeUrl = argsList[0];

    if (!voiceChannel || !(argsList.length > 0) || !(youtubeUrl.startsWith('https://www.youtube.com/watch'))) return;

    const songDetails = await ytdl.getInfo(youtubeUrl);
    const song = {
        title: songDetails.title,
        url: songDetails.video_url
    };

    if (!serverQueue) {
        const queueObj = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            playing: true
        };

        globalQueueMap.set(message.guild.id, queueObj);
        queueObj.songs.push(song);

        try {
            let connection = await voiceChannel.join();
            queueObj.connection = connection;
            play(message.guild, song);
        } catch (err) {
            globalQueueMap.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        return message.channel.send(`${song.title} has been queued!`);
    }
}

function play(guild, song) {
    const currentGuildQueue = globalQueueMap.get(guild.id);

    if (!song) {
        currentGuildQueue.voiceChannel.leave();
        globalQueueMap.delete(guild.id);
        return;
    }

    const dispatcher = currentGuildQueue.connection.play(ytdl(song.url, {
        filter: 'audioonly'
    }))
    .on('end', () => {
        currentGuildQueue.songs.shift();
        play(guild, currentGuildQueue.songs[0]);
    })
    .on('error', error => {
        console.error(error);
    });
}