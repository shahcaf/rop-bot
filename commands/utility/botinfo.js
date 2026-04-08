const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('✨ View information about the bot.'),
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('✨ Bot Information')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: 'Bot Name', value: client.user.username, inline: true },
                { name: 'Bot ID', value: client.user.id, inline: true },
                { name: 'Node.js Version', value: process.version, inline: true },
                { name: 'discord.js Version', value: `v${version}`, inline: true },
                { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
                { name: 'Users', value: `${client.users.cache.size}`, inline: true }
            )
            .setFooter({ text: 'Developed for Advanced Discord Utility' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
