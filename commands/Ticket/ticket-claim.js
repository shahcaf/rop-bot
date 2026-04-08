const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-claim')
        .setDescription('🎫 Claim a ticket.'),
    async execute(interaction, client) {
        const res = await query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channelId]);
        
        if (res.rows.length === 0) {
            return interaction.reply({ content: 'This is not a ticket channel.', flags: ['Ephemeral'] });
        }

        if (res.rows[0].claimer_id) {
            return interaction.reply({ content: `This ticket is already claimed by <@${res.rows[0].claimer_id}>.`, flags: ['Ephemeral'] });
        }

        try {
            await query('UPDATE tickets SET claimer_id = $1, status = $2 WHERE channel_id = $3', 
                [interaction.user.id, 'claimed', interaction.channelId]);
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setDescription(`Ticket claimed by ${interaction.user}.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to claim ticket.', flags: ['Ephemeral'] });
        }
    },
};
