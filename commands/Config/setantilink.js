const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setantilink')
        .setDescription('⚙️ Toggle the anti-link system.')
        .addBooleanOption(option => option.setName('enabled').setDescription('⚙️ Enable or disable anti-link').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const enabled = interaction.options.getBoolean('enabled');

        try {
            await query('INSERT INTO guild_settings (guild_id, anti_link) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET anti_link = $2', 
                [interaction.guildId, enabled]);
            
            const embed = new EmbedBuilder()
                .setColor(enabled ? 0x00FF00 : 0xFF0000)
                .setTitle('⚙️ Anti-Link Configured')
                .setDescription(`Anti-link has been **${enabled ? 'enabled' : 'disabled'}**.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to update configuration.', flags: ['Ephemeral'] });
        }
    },
};
