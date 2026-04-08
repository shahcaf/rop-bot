const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('✨ Lock the current channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction, client) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
            
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('✨ 🔒 Channel Locked')
                .setDescription('✨ Users can no longer send messages in this channel.')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: 'Failed to lock the channel.', flags: ['Ephemeral'] });
        }
    },
};
