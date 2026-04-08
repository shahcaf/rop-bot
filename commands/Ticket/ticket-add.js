const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-add')
        .setDescription('🎫 Add a user to the ticket.')
        .addUserOption(option => option.setName('user').setDescription('🎫 The user to add').setRequired(true)),
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');

        try {
            await interaction.channel.permissionOverwrites.create(user, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });
            
            await interaction.reply({ content: `Successfully added ${user} to the ticket.` });
        } catch (error) {
            await interaction.reply({ content: 'Failed to add user to ticket.', flags: ['Ephemeral'] });
        }
    },
};
