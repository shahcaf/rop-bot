const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('✨ Remove timeout from a member.')
        .addUserOption(option => option.setName('target').setDescription('✨ The member to untimeout').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('✨ The reason for removing timeout'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: 'That user is not in the server.', flags: ['Ephemeral'] });
        }

        try {
            await member.timeout(null, reason);
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✨ Timeout Removed')
                .setThumbnail(user.displayAvatarURL())
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: 'Failed to untimeout the user.', flags: ['Ephemeral'] });
        }
    },
};
