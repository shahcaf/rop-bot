const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-close')
        .setDescription('🎫 Close the current ticket.'),
    async execute(interaction, client) {
        const res = await query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channelId]);
        
        if (res.rows.length === 0) {
            return interaction.reply({ content: 'This is not a ticket channel.', flags: ['Ephemeral'] });
        }

        await interaction.reply({ content: 'Closing ticket in 5 seconds...' });
        
        setTimeout(async () => {
            try {
                await interaction.channel.delete();
                await query('DELETE FROM tickets WHERE channel_id = $1', [interaction.channelId]);
            } catch (error) {
                console.error(error);
            }
        }, 5000);
    },
};
