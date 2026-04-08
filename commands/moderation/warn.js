const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('✨ Warn a user.')
        .addUserOption(option => option.setName('target').setDescription('✨ The user to warn').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('✨ The reason for the warning'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        try {
            await query('INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES ($1, $2, $3, $4)', 
                [interaction.guildId, user.id, interaction.user.id, reason]);
            
            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('✨ Warning Issued')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to issue warning.', ephemeral: true });
        }
    },
};
