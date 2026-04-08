const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('✨ Ban a member from the server.')
        .addUserOption(option => option.setName('target').setDescription('✨ The member to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('✨ The reason for the ban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (member) {
            if (!member.bannable) {
                return interaction.reply({ content: 'I cannot ban this user! They might have a higher role than me.', flags: ['Ephemeral'] });
            }
            if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
                return interaction.reply({ content: 'You cannot ban someone with a higher or equal role to yours!', flags: ['Ephemeral'] });
            }
        }

        try {
            await interaction.guild.members.ban(user, { reason });
            
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('✨ Member Banned')
                .setThumbnail(user.displayAvatarURL())
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: 'Failed to ban the user.', flags: ['Ephemeral'] });
        }
    },
};
