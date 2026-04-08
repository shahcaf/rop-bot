const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('✨ Kick a member from the server.')
        .addUserOption(option => option.setName('target').setDescription('✨ The member to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('✨ The reason for the kick'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: 'That user is not in the server.', flags: ['Ephemeral'] });
        }

        if (!member.kickable) {
            return interaction.reply({ content: 'I cannot kick this user! They might have a higher role than me.', flags: ['Ephemeral'] });
        }
        
        if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
            return interaction.reply({ content: 'You cannot kick someone with a higher or equal role to yours!', flags: ['Ephemeral'] });
        }

        try {
            await member.kick(reason);
            
            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('✨ Member Kicked')
                .setThumbnail(user.displayAvatarURL())
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: 'Failed to kick the user.', flags: ['Ephemeral'] });
        }
    },
};
