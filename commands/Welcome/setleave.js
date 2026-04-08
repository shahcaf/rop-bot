const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setleave')
        .setDescription('👋 Configure the leave system.')
        .addChannelOption(option => option.setName('channel').setDescription('👋 The channel for leave messages').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('👋 The leave message (Use {user} for tag)').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');

        try {
            await query('INSERT INTO guild_settings (guild_id, leave_channel, leave_message) VALUES ($1, $2, $3) ON CONFLICT (guild_id) DO UPDATE SET leave_channel = $2, leave_message = $3', 
                [interaction.guildId, channel.id, message]);
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('👋 Leave Configured')
                .setDescription(`Channel: ${channel}\nMessage: ${message}`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to update configuration.', flags: ['Ephemeral'] });
        }
    },
};
