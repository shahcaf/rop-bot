const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify-setup')
        .setDescription('⚙️ Sends a verification panel to the current channel.')
        .addRoleOption(option => 
            option.setName('role')
            .setDescription('⚙️ The role to give when a user verifies')
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const role = interaction.options.getRole('role');

        try {
            await query('INSERT INTO guild_settings (guild_id, verify_role) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET verify_role = $2', 
                [interaction.guildId, role.id]);
        } catch (error) {
            console.error('Failed to configure verify role:', error);
            return interaction.reply({ content: 'Failed to update configuration.', flags: ['Ephemeral'] });
        }

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Server Verification')
            .setDescription(`Please click the button below to verify yourself and gain the ${role} role to access the rest of the server!`)
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify_button')
                    .setLabel('Verify')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅')
            );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        return await interaction.reply({ content: `Verification panel successfully set up and tied to ${role}!`, flags: ['Ephemeral'] });
    },
};
