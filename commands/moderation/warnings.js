const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../../database/connection');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('✨ View warnings for a user.')
        .addUserOption(option => option.setName('target').setDescription('✨ The user to check').setRequired(true)),
    async execute(interaction, client) {
        const user = interaction.options.getUser('target');

        try {
            const res = await query('SELECT * FROM warnings WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC', 
                [interaction.guildId, user.id]);
            
            if (res.rows.length === 0) {
                return interaction.reply({ content: `${user.tag} has no warnings.`, ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Warnings for ${user.tag}`)
                .setDescription(res.rows.map((w, i) => `**${i + 1}.** Reason: ${w.reason}\nBy: <@${w.moderator_id}> | Date: <t:${Math.round(w.created_at.getTime() / 1000)}:f>`).join('\n\n'))
                .setFooter({ text: `Total Warnings: ${res.rows.length}` });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to fetch warnings.', ephemeral: true });
        }
    },
};
