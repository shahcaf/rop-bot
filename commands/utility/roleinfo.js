const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleinfo')
        .setDescription('✨ View information about a role.')
        .addRoleOption(option => option.setName('role').setDescription('✨ The role to view information for').setRequired(true)),
    async execute(interaction, client) {
        const role = interaction.options.getRole('role');

        const embed = new EmbedBuilder()
            .setColor(role.color)
            .setTitle(`Role Info: ${role.name}`)
            .addFields(
                { name: 'Role ID', value: role.id, inline: true },
                { name: 'Hex Color', value: role.hexColor.toUpperCase(), inline: true },
                { name: 'Members', value: `${role.members.size}`, inline: true },
                { name: 'Position', value: `${role.position}`, inline: true },
                { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
                { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
                { name: 'Created At', value: `<t:${Math.round(role.createdTimestamp / 1000)}:f>`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
