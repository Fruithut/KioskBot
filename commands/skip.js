module.exports = {
    name: 'skip',
    description: 'Skip music for discord-bot',
    execute(message, serverQueue) {
        if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to skip the music!');
        if (!serverQueue) return message.channel.send('There are no songs that could be skipped!');

        serverQueue.connection.dispatcher.end();
    },
};