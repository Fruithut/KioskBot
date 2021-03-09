export default {
    name: 'resume',
    description: 'Resume music for discord-bot',
    execute(message, serverQueue) {
        if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to resume the music!');
        if (!serverQueue) return message.channel.send('There is no player to resume!');
        if (serverQueue.playing) return message.channel.send('The music is already playing!')

        serverQueue.connection.dispatcher.resume();
        serverQueue.playing = true;
    },
};