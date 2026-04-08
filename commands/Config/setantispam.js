const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setantispam')
        .setDescription('⚙️ Toggle the anti-spam system.')
        .addBooleanOption(option => option.setName('enabled').setDescription('⚙️ Enable or disable anti-spam').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const enabled = interaction.options.getBoolean('enabled');

        try {
            await query('INSERT INTO guild_settings (guild_id, anti_spam) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET anti_spam = $2', 
                [interaction.guildId, enabled]);
            
            const embed = new EmbedBuilder()
                .setColor(enabled ? 0x00FF00 : 0xFF0000)
                .setTitle('⚙️ Anti-Spam Configured')
                .setDescription(`Anti-spam has been **${enabled ? 'enabled' : 'disabled'}**.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to update configuration.', ephemeral: true });
        }
    },
};
