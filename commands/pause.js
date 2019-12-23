module.exports = {
    name: 'pause',
    description: 'Pause music for discord-bot',
    execute(message, serverQueue) {
        if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to stop the music!');
        if (!serverQueue) return message.channel.send('There is no player to pause!');
        if (!serverQueue.playing) return message.channel.send('There is no music currently playing!');

        serverQueue.connection.dispatcher.pause();
        serverQueue.playing = false;
    },
};