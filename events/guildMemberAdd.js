const { Events, EmbedBuilder } = require('discord.js');
const { query } = require('../database/connection');
const logger = require('../utils/logger');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member, client) {
        try {
            const res = await query('SELECT * FROM guild_settings WHERE guild_id = $1', [member.guild.id]);
            if (res.rows.length === 0) return;

            const config = res.rows[0];

            // Auto-role
            if (config.auto_role) {
                const role = member.guild.roles.cache.get(config.auto_role);
                if (role) await member.roles.add(role).catch(() => logger.warn(`Failed to add auto-role to ${member.user.tag}`));
            }

            // Welcome Message
            if (config.welcome_channel && config.welcome_message) {
                const channel = member.guild.channels.cache.get(config.welcome_channel);
                if (channel) {
                    let msg = config.welcome_message
                        .replace('{user}', member.toString())
                        .replace('{guild}', member.guild.name);
                    
                    const embed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle('Welcome!')
                        .setDescription(msg)
                        .setThumbnail(member.user.displayAvatarURL())
                        .setTimestamp();

                    await channel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            logger.error('Error in guildMemberAdd:', error);
        }
    },
};
