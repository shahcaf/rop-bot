const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('📈 View your current rank and XP.')
        .addUserOption(option => option.setName('target').setDescription('📈 The user to check')),
    async execute(interaction, client) {
        const user = interaction.options.getUser('target') ?? interaction.user;

        try {
            const res = await query('SELECT * FROM levels WHERE guild_id = $1 AND user_id = $2', [interaction.guildId, user.id]);
            
            if (res.rows.length === 0) {
                return interaction.reply({ content: user.id === interaction.user.id ? 'You haven\'t earned any XP yet!' : `${user.tag} hasn't earned any XP yet.`, flags: ['Ephemeral'] });
            }

            const { xp, level } = res.rows[0];
            const nextLevelXp = (level + 1) * (level + 1) * 100;

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle(`${user.tag}'s Rank`)
                .setThumbnail(user.displayAvatarURL())
                .addFields(
                    { name: 'Level', value: `${level}`, inline: true },
                    { name: 'XP', value: `${xp} / ${nextLevelXp}`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to fetch rank.', flags: ['Ephemeral'] });
        }
    },
};
