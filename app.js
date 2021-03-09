import config from './config.js';
import discordjs from 'discord.js';
import ffmpeg from 'ffmpeg-static';
import ytdl from 'ytdl-core';
const { token, prefix } = config;
const { Client, Collection } = discordjs;

const globalQueueMap = new Map();
const client = new Client();
client.commands = new Collection();

import pause from './commands/pause.js';
import resume from './commands/resume.js';
import skip from './commands/skip.js';
import stop from './commands/stop.js';
import help from './commands/help.js';

[pause, resume, skip, stop, help].forEach((c) => client.commands.set(c.name, c));

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
    } else {
        message.react('❓');
        message.channel.send('Command not understood please refer to the instructions manual: ?help');
    }
}

async function handleMediaPlayback(message, argsList, serverQueue) {
    const voiceChannel = message.member.voice.channel;
    const youtubeUrl = argsList[0];

    if (!voiceChannel || !(argsList.length > 0) || !(youtubeUrl.startsWith('https://www.youtube.com/watch'))) {
        return;
    }

    const songDetails = await ytdl.getInfo(youtubeUrl);
    const song = {
        title: songDetails.videoDetails.title,
        url: songDetails.videoDetails.video_url
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
    .on('finish', () => {
        currentGuildQueue.songs.shift();
        play(guild, currentGuildQueue.songs[0]);
    })
    .on('error', error => {
        console.error(error);
    });
}