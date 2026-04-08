const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('✨ Unmute a member.')
        .addUserOption(option => option.setName('target').setDescription('✨ The member to unmute').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('target');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ content: 'Member not found.', flags: ['Ephemeral'] });

        const muteRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');

        if (!muteRole || !member.roles.cache.has(muteRole.id)) {
            return interaction.reply({ content: 'User is not muted.', flags: ['Ephemeral'] });
        }

        try {
            await member.roles.remove(muteRole);
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✨ Member Unmuted')
                .addFields(
                    { name: 'User', value: `${user.tag}`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: 'Failed to unmute the user.', flags: ['Ephemeral'] });
        }
    },
};
