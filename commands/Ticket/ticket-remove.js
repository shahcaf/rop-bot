const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-remove')
        .setDescription('🎫 Remove a user from the ticket.')
        .addUserOption(option => option.setName('user').setDescription('🎫 The user to remove').setRequired(true)),
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');

        try {
            await interaction.channel.permissionOverwrites.delete(user);
            await interaction.reply({ content: `Successfully removed ${user} from the ticket.` });
        } catch (error) {
            await interaction.reply({ content: 'Failed to remove user from ticket.', flags: ['Ephemeral'] });
        }
    },
};
