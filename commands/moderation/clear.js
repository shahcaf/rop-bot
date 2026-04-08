const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('🛡️ Delete messages from a channel.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('🛡️ Number of messages to delete (1-900)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(900)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction, client) {
        const total = interaction.options.getInteger('amount');

        await interaction.deferReply({ ephemeral: true });

        const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
        let deletedCount = 0;
        let remaining = total;
        let lastId = null;

        try {
            while (remaining > 0) {
                const fetchLimit = Math.min(remaining, 100);
                const options = { limit: fetchLimit };
                if (lastId) options.before = lastId;

                const messages = await interaction.channel.messages.fetch(options);
                if (messages.size === 0) break;

                lastId = messages.last().id;

                const newMsgs = messages.filter(m => m.createdTimestamp > fourteenDaysAgo);
                const oldMsgs = messages.filter(m => m.createdTimestamp <= fourteenDaysAgo);

                // Bulk delete recent messages
                if (newMsgs.size === 1) {
                    await newMsgs.first().delete();
                    deletedCount += 1;
                } else if (newMsgs.size > 1) {
                    const bulk = await interaction.channel.bulkDelete(newMsgs, true);
                    deletedCount += bulk.size;
                }

                // Delete old messages one by one
                for (const [, msg] of oldMsgs) {
                    try {
                        await msg.delete();
                        deletedCount++;
                        await new Promise(r => setTimeout(r, 300));
                    } catch { /* skip */ }
                }

                remaining -= messages.size;
                if (messages.size < fetchLimit) break;
            }

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setDescription(`🛡️ Cleared **${deletedCount}** message${deletedCount !== 1 ? 's' : ''}.`)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `❌ Stopped after deleting **${deletedCount}** messages. Missing permissions or hit a rate limit.` });
        }
    },
};

