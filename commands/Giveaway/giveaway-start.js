const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../../database/connection');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway-start')
        .setDescription('🎁 Start a giveaway.')
        .addStringOption(option => option.setName('duration').setDescription('🎁 Duration (e.g., 10m, 1h, 1d)').setRequired(true))
        .addIntegerOption(option => option.setName('winners').setDescription('🎁 Number of winners').setRequired(true))
        .addStringOption(option => option.setName('prize').setDescription('🎁 What to win').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction, client) {
        const durationStr = interaction.options.getString('duration');
        const winnersCount = interaction.options.getInteger('winners');
        const prize = interaction.options.getString('prize');

        const duration = ms(durationStr);
        if (!duration) return interaction.reply({ content: 'Invalid duration!', flags: ['Ephemeral'] });

        const endAt = new Date(Date.now() + duration);

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🎁 🎉 GIVEAWAY START! 🎉')
            .setDescription(`Prize: **${prize}**\nEnds At: <t:${Math.round(endAt.getTime() / 1000)}:R>\nWinners: **${winnersCount}**\nHost: ${interaction.user}`)
            .setFooter({ text: 'React with 🎉 to enter!' })
            .setTimestamp();

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        await message.react('🎉');

        try {
            await query('INSERT INTO giveaways (message_id, guild_id, channel_id, prize, ends_at, winners_count, host_id) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
                [message.id, interaction.guildId, interaction.channelId, prize, endAt, winnersCount, interaction.user.id]);
        } catch (error) {
            console.error(error);
        }
    },
};
