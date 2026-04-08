const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Get a user\'s banner.')
        .addUserOption(option => option.setName('target').setDescription('✨ The user to get the banner of')),
    async execute(interaction, client) {
        const user = interaction.options.getUser('target') ?? interaction.user;
        const fullUser = await client.users.fetch(user.id, { force: true });

        if (!fullUser.bannerURL()) {
            return interaction.reply({ content: `${user.tag} doesn't have a banner!`, ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`${user.tag}'s Banner`)
            .setImage(fullUser.bannerURL({ dynamic: true, size: 1024 }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
