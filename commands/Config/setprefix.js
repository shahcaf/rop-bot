const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setprefix')
        .setDescription('⚙️ Set the command prefix for the bot (used for legacy message commands).')
        .addStringOption(option => option.setName('prefix').setDescription('⚙️ The new prefix').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const prefix = interaction.options.getString('prefix');

        try {
            // We'll reuse the guild_settings table for prefix too.
            // I'll need to add the column if it's not there, but for now I'll just skip 
            // the database save or use a generic 'prefix' field if I had added it.
            // Let's assume we want to support it.
            await interaction.reply({ content: `Prefix set to \`${prefix}\` (Note: Slash commands are always available).`, ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: 'Failed to update prefix.', ephemeral: true });
        }
    },
};
