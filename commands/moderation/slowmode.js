const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('✨ Set the slowmode for a channel.')
        .addStringOption(option => option.setName('duration').setDescription('✨ Slowmode duration (e.g., 5s, 10m, off)').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction, client) {
        const durationStr = interaction.options.getString('duration');
        let seconds = 0;

        if (durationStr.toLowerCase() !== 'off') {
            const msTime = ms(durationStr);
            if (!msTime) return interaction.reply({ content: 'Invalid duration!', ephemeral: true });
            seconds = Math.floor(msTime / 1000);
        }

        if (seconds < 0 || seconds > 21600) {
            return interaction.reply({ content: 'Duration must be between 0s and 6h.', ephemeral: true });
        }

        try {
            await interaction.channel.setRateLimitPerUser(seconds);
            
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('✨ Slowmode Updated')
                .setDescription(seconds === 0 ? 'Slowmode has been disabled.' : `Slowmode set to **${durationStr}**.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: 'Failed to set slowmode.', ephemeral: true });
        }
    },
};
