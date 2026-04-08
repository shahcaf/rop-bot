const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('✨ Timeout a member (restricts their ability to talk).')
        .addUserOption(option => option.setName('target').setDescription('✨ The member to timeout').setRequired(true))
        .addStringOption(option => option.setName('duration').setDescription('✨ Duration (e.g., 60s, 5m, 1h, 1d)').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('✨ The reason for the timeout'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('target');
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: 'That user is not in the server.', flags: ['Ephemeral'] });
        }

        const duration = ms(durationStr);
        if (!duration || duration < 10000 || duration > 2419200000) { // Discord limit: 28 days
            return interaction.reply({ content: 'Invalid duration! Use format like 10m, 1h, etc. Minimum is 10s and maximum is 28d.', flags: ['Ephemeral'] });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
            return interaction.reply({ content: 'You cannot timeout someone with a higher or equal role to yours!', flags: ['Ephemeral'] });
        }

        try {
            await member.timeout(duration, reason);
            
            const embed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle('✨ Member Timed Out')
                .setThumbnail(user.displayAvatarURL())
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Duration', value: `${durationStr}`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: 'Failed to timeout the user.', flags: ['Ephemeral'] });
        }
    },
};
