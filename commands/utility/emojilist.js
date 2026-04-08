const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emojilist')
        .setDescription('✨ List all custom emojis in the server.'),
    async execute(interaction, client) {
        const emojis = interaction.guild.emojis.cache;

        if (emojis.size === 0) {
            return interaction.reply({ content: 'This server has no custom emojis.', ephemeral: true });
        }

        const emojiList = emojis.map(e => `${e} | \`:${e.name}:\``).join('\n');

        // Split if too long (max 4096 for description, but let's be safe)
        const chunks = emojiList.match(/[\s\S]{1,2000}/g);

        const embeds = chunks.map((chunk, index) => {
            return new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Server Emojis (Part ${index + 1})`)
                .setDescription(chunk);
        });

        await interaction.reply({ embeds: [embeds[0]] });
        if (embeds.length > 1) {
            for (let i = 1; i < embeds.length; i++) {
                await interaction.followUp({ embeds: [embeds[i]] });
            }
        }
    },
};
