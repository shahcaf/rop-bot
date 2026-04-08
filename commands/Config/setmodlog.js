const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setmodlog')
        .setDescription('⚙️ Set the moderation logs channel.')
        .addChannelOption(option => option.setName('channel').setDescription('⚙️ The channel for logs').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');

        try {
            await query('INSERT INTO guild_settings (guild_id, mod_log_channel) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET mod_log_channel = $2', 
                [interaction.guildId, channel.id]);
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('⚙️ Config Updated')
                .setDescription(`Moderation logs will now be sent to ${channel}.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to update configuration.', flags: ['Ephemeral'] });
        }
    },
};
