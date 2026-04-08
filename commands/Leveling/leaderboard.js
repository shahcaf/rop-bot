const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('📈 View the top 10 members by XP.'),
    async execute(interaction, client) {
        try {
            const res = await query('SELECT * FROM levels WHERE guild_id = $1 ORDER BY xp DESC LIMIT 10', [interaction.guildId]);
            
            if (res.rows.length === 0) {
                return interaction.reply({ content: 'No one has earned XP in this server yet.', flags: ['Ephemeral'] });
            }

            const embed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle('📈 🏆 XP Leaderboard')
                .setDescription(res.rows.map((row, i) => `**#${i + 1}** <@${row.user_id}> | Level: ${row.level} | XP: ${row.xp}`).join('\n'))
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to fetch leaderboard.', flags: ['Ephemeral'] });
        }
    },
};
