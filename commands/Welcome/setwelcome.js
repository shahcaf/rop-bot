const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setwelcome')
        .setDescription('👋 Configure the welcome system.')
        .addChannelOption(option => option.setName('channel').setDescription('👋 The channel for welcome messages').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('👋 The welcome message (Use {user} for mention, {guild} for server name)').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');

        try {
            await query('INSERT INTO guild_settings (guild_id, welcome_channel, welcome_message) VALUES ($1, $2, $3) ON CONFLICT (guild_id) DO UPDATE SET welcome_channel = $2, welcome_message = $3', 
                [interaction.guildId, channel.id, message]);
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('👋 Welcome Configured')
                .setDescription(`Channel: ${channel}\nMessage: ${message}`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to update configuration.', ephemeral: true });
        }
    },
};
