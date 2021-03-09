import discordjs from 'discord.js';
import config from '../config.js';
const { prefix } = config;

export default {
    name: 'help',
    description: 'Show overview of available commands',
    execute(message, serverQueue) {
        let embed = new discordjs.MessageEmbed()
            .setTitle('COMMANDS 📜')
            .setColor('#4cd7d0')
            .addFields(
                {
                    name: '▶️ Play media',
                    value: `${prefix}play \{youtube url\}`
                },
                {
                    name: '⏸️ Pause currently playing media',
                    value: `${prefix}pause`
                },
                {
                    name: '⏯️ Resume paused player',
                    value: `${prefix}resume`
                },
                {
                    name: '⏹️ Stop player and empty queue',
                    value: `${prefix}stop`
                },
            );
        message.channel.send(embed);
    },
};

