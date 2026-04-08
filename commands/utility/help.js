const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('✨ View the help menu.'),
    async execute(interaction, client) {
        const commandsPath = path.join(__dirname, '../../commands');
        const commandFolders = fs.readdirSync(commandsPath).filter(f => fs.statSync(path.join(commandsPath, f)).isDirectory());

        const emojis = {
            'Config': '⚙️',
            'Giveaway': '🎁',
            'Leveling': '📈',
            'Moderation': '🛡️',
            'Ticket': '🎫',
            'Utility': '🛠️',
            'Welcome': '👋'
        };

        const descriptions = {
            'Config': 'Automated protections and logging',
            'Giveaway': 'Manage server giveaways',
            'Leveling': 'Configure and view member XP rankings',
            'Moderation': 'Tools to moderate your server',
            'Ticket': 'Interactive ticketing systems',
            'Utility': 'General bot and server information',
            'Welcome': 'Greeting and auto-role management'
        };

        const embed = new EmbedBuilder()
            .setColor(0x2B2D31) // Discord native dark color
            .setTitle('📚 Command Center & Help')
            .setDescription('Welcome to the help center! Please select a category from the dropdown menu below to view all available commands for that module.')
            .addFields(
                { name: '✨ Categories', value: commandFolders.map(f => `**${emojis[f] || '✨'} ${f}**\n*${descriptions[f] || 'Various commands'}*`).join('\n\n') }
            )
            .setFooter({ text: `R.O.P System • ${client.commands.size} Commands Total`, iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        const select = new StringSelectMenuBuilder()
            .setCustomId('help_category')
            .setPlaceholder('Browse Command Categories')
            .addOptions(
                commandFolders.map(folder => {
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(`${folder} Commands`)
                        .setDescription(descriptions[folder] || `View ${folder} commands`)
                        .setValue(folder)
                        .setEmoji(emojis[folder] || '✨');
                })
            );

        const row = new ActionRowBuilder().addComponents(select);

        const response = await interaction.reply({ embeds: [embed], components: [row] });
    },
};
