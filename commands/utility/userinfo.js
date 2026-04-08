const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('✨ View information about a user.')
        .addUserOption(option => option.setName('target').setDescription('✨ The user to view information for')),
    async execute(interaction, client) {
        const user = interaction.options.getUser('target') ?? interaction.user;
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`${user.tag}'s Info`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'User ID', value: user.id, inline: true },
                { name: 'Account Created', value: `<t:${Math.round(user.createdTimestamp / 1000)}:f>`, inline: true }
            )
            .setTimestamp();

        if (member) {
            embed.addFields(
                { name: 'Joined Server', value: `<t:${Math.round(member.joinedTimestamp / 1000)}:f>`, inline: true },
                { name: 'Roles', value: member.roles.cache.map(r => r).join(' ').replace('@everyone', '') || 'None', inline: false }
            );
        }

        await interaction.reply({ embeds: [embed] });
    },
};
