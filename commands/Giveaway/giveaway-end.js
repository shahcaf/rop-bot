const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway-end')
        .setDescription('🎁 Force end a giveaway.')
        .addStringOption(option => option.setName('message_id').setDescription('🎁 ID of the giveaway message').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction, client) {
        const messageId = interaction.options.getString('message_id');

        try {
            const res = await query('SELECT * FROM giveaways WHERE message_id = $1 AND ended = FALSE', [messageId]);
            if (res.rows.length === 0) return interaction.reply({ content: 'Giveaway not found or already ended.', ephemeral: true });

            const giveaway = res.rows[0];
            const channel = await client.channels.fetch(giveaway.channel_id).catch(() => null);
            if (!channel) return interaction.reply({ content: 'Channel not found.', ephemeral: true });

            const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
            if (!message) return interaction.reply({ content: 'Message not found.', ephemeral: true });

            const reaction = message.reactions.cache.get('🎉');
            const users = await reaction.users.fetch();
            const entries = users.filter(u => !u.bot);

            if (entries.size === 0) {
                await query('UPDATE giveaways SET ended = TRUE WHERE message_id = $1', [messageId]);
                await interaction.reply({ content: 'No one entered the giveaway.' });
                return;
            }

            const winners = entries.random(Math.min(entries.size, giveaway.winners_count));
            const winnerMentions = winners.map(w => w.toString()).join(', ');

            await query('UPDATE giveaways SET ended = TRUE WHERE message_id = $1', [messageId]);

            const endEmbed = EmbedBuilder.from(message.embeds[0])
                .setColor(0xFF0000)
                .setTitle('🎁 🎉 GIVEAWAY ENDED 🎉')
                .setDescription(`Prize: **${giveaway.prize}**\nWinner(s): ${winnerMentions}\nHost: <@${giveaway.host_id}>`);

            await message.edit({ embeds: [endEmbed] });
            await channel.send(`Congratulations ${winnerMentions}! You won **${giveaway.prize}**!`);
            await interaction.reply({ content: 'Giveaway ended!', ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to end giveaway.', ephemeral: true });
        }
    },
};
