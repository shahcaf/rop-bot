const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('View the bot\'s uptime.'),
    async execute(interaction, client) {
        const duration = moment.duration(client.uptime);
        const days = Math.floor(duration.asDays());
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('✨ Bot Uptime')
            .setDescription(`**${days}** days, **${hours}** hours, **${minutes}** minutes, **${seconds}** seconds`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
