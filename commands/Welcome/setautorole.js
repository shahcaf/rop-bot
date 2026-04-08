const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setautorole')
        .setDescription('👋 Set a role to be automatically given to new members.')
        .addRoleOption(option => option.setName('role').setDescription('👋 The role to give').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const role = interaction.options.getRole('role');

        try {
            await query('INSERT INTO guild_settings (guild_id, auto_role) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET auto_role = $2', 
                [interaction.guildId, role.id]);
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('👋 Auto-role Configured')
                .setDescription(`New members will now receive the ${role} role.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to update configuration.', ephemeral: true });
        }
    },
};
