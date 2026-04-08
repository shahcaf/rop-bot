const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('✨ Mute a member using a role-based system.')
        .addUserOption(option => option.setName('target').setDescription('✨ The member to mute').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('✨ The reason for the mute'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ content: 'Member not found.', ephemeral: true });

        let muteRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');

        if (!muteRole) {
            try {
                muteRole = await interaction.guild.roles.create({
                    name: 'Muted',
                    permissions: [],
                    reason: 'Required for mute command'
                });

                interaction.guild.channels.cache.forEach(async (channel) => {
                    await channel.permissionOverwrites.create(muteRole, {
                        SendMessages: false,
                        AddReactions: false,
                        Speak: false
                    }).catch(() => {});
                });
            } catch (error) {
                return interaction.reply({ content: 'Failed to create a Muted role.', ephemeral: true });
            }
        }

        if (member.roles.cache.has(muteRole.id)) {
            return interaction.reply({ content: 'User is already muted.', ephemeral: true });
        }

        try {
            await member.roles.add(muteRole, reason);
            
            const embed = new EmbedBuilder()
                .setColor(0x808080)
                .setTitle('✨ Member Muted')
                .addFields(
                    { name: 'User', value: `${user.tag}`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: 'Failed to mute the user.', ephemeral: true });
        }
    },
};
