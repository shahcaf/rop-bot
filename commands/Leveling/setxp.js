const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../../database/connection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setxp')
        .setDescription('Set a user\'s XP.')
        .addUserOption(option => option.setName('user').setDescription('📈 The user').setRequired(true))
        .addIntegerOption(option => option.setName('xp').setDescription('📈 The amount of XP').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const xp = interaction.options.getInteger('xp');
        const level = Math.floor(Math.sqrt(xp / 100));

        try {
            await query('INSERT INTO levels (guild_id, user_id, xp, level) VALUES ($1, $2, $3, $4) ON CONFLICT (guild_id, user_id) DO UPDATE SET xp = $3, level = $4', 
                [interaction.guildId, user.id, xp, level]);
            
            await interaction.reply({ content: `Successfully set ${user}'s XP to **${xp}** (Level ${level}).` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to set XP.', ephemeral: true });
        }
    },
};
