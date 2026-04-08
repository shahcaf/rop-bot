const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('✨ Unban a user from the server.')
        .addStringOption(option => option.setName('userid').setDescription('✨ The Discord ID of the user to unban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('✨ The reason for the unban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction, client) {
        const userId = interaction.options.getString('userid');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        try {
            await interaction.guild.members.unban(userId, reason);
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✨ User Unbanned')
                .addFields(
                    { name: 'User ID', value: userId, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: 'Failed to unban the user. Make sure the ID is correct and they are actually banned.', ephemeral: true });
        }
    },
};
