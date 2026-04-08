const { Events, EmbedBuilder } = require('discord.js');
const { query } = require('../database/connection');
const logger = require('../utils/logger');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member, client) {
        try {
            const res = await query('SELECT * FROM guild_settings WHERE guild_id = $1', [member.guild.id]);
            if (res.rows.length === 0) return;

            const config = res.rows[0];

            // Leave Message
            if (config.leave_channel && config.leave_message) {
                const channel = member.guild.channels.cache.get(config.leave_channel);
                if (channel) {
                    let msg = config.leave_message
                        .replace('{user}', member.user.tag);
                    
                    const embed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('Goodbye!')
                        .setDescription(msg)
                        .setThumbnail(member.user.displayAvatarURL())
                        .setTimestamp();

                    await channel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            logger.error('Error in guildMemberRemove:', error);
        }
    },
};
