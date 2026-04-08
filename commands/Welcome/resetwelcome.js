const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetwelcome')
        .setDescription('👋 Reset welcome and leave settings.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        try {
            await query('UPDATE guild_settings SET welcome_channel = NULL, welcome_message = NULL, leave_channel = NULL, leave_message = NULL, auto_role = NULL WHERE guild_id = $1', 
                [interaction.guildId]);
            
            const embed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle('👋 Settings Reset')
                .setDescription('👋 Welcome, leave, and auto-role settings have been cleared.')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to reset settings.', flags: ['Ephemeral'] });
        }
    },
};
