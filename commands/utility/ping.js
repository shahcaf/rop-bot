const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency.'),
    async execute(interaction, client) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true, flags: ['Ephemeral'] });
        
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('✨ 🏓 Pong!')
            .addFields(
                { name: 'Gateway Latency', value: `\`${client.ws.ping}ms\``, inline: true },
                { name: 'API Latency', value: `\`${sent.createdTimestamp - interaction.createdTimestamp}ms\``, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });
    },
};
