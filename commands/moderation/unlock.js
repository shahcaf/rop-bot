const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('✨ Unlock the current channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction, client) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✨ 🔓 Channel Unlocked')
                .setDescription('✨ Users can now send messages in this channel.')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: 'Failed to unlock the channel.', flags: ['Ephemeral'] });
        }
    },
};
