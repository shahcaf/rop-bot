const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get a user\'s avatar.')
        .addUserOption(option => option.setName('target').setDescription('✨ The user to get the avatar of')),
    async execute(interaction, client) {
        const user = interaction.options.getUser('target') ?? interaction.user;

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`${user.tag}'s Avatar`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
