const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlevelchannel')
        .setDescription('📈 Channel for level up announcements.')
        .addChannelOption(option => option.setName('channel').setDescription('📈 The channel for level up messages').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');

        try {
            await query('INSERT INTO level_settings (guild_id, level_channel_id) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET level_channel_id = $2', 
                [interaction.guildId, channel.id]);
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('📈 Leveling Configured')
                .setDescription(`Level up messages will now be sent to ${channel}.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to update configuration.', ephemeral: true });
        }
    },
};
