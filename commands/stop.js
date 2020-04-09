module.exports = {
    name: 'stop',
    description: 'Stop music for discord-bot',
    execute(message, serverQueue) {
        if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to stop the music!');
        if (!serverQueue) return message.channel.send('There is no player to stop!');

        serverQueue.songs = [];
        serverQueue.connection.disconnect();
    },
};