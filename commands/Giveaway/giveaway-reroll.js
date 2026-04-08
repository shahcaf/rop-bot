const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway-reroll')
        .setDescription('🎁 Reroll a winner for an ended giveaway.')
        .addStringOption(option => option.setName('message_id').setDescription('🎁 ID of the giveaway message').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction, client) {
        const messageId = interaction.options.getString('message_id');

        try {
            const res = await query('SELECT * FROM giveaways WHERE message_id = $1 AND ended = TRUE', [messageId]);
            if (res.rows.length === 0) return interaction.reply({ content: 'Giveaway not found or not yet ended.', flags: ['Ephemeral'] });

            const giveaway = res.rows[0];
            const channel = await client.channels.fetch(giveaway.channel_id).catch(() => null);
            const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);

            const reaction = message.reactions.cache.get('🎉');
            const users = await reaction.users.fetch();
            const entries = users.filter(u => !u.bot);

            if (entries.size === 0) return interaction.reply({ content: 'No entries to reroll from!', flags: ['Ephemeral'] });

            const winner = entries.random();
            await channel.send(`Congratulations ${winner}! You are the new winner of **${giveaway.prize}**! (Rerolled)`);
            await interaction.reply({ content: 'Reroll complete!', flags: ['Ephemeral'] });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to reroll giveaway.', flags: ['Ephemeral'] });
        }
    },
};
