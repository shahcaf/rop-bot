const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('🎫 Setup the ticket system.')
        .addChannelOption(option => option.setName('category').setDescription('🎫 Category where tickets will be created').setRequired(true).addChannelTypes(ChannelType.GuildCategory))
        .addRoleOption(option => option.setName('support_role').setDescription('🎫 Role that can view tickets').setRequired(false))
        .addStringOption(option => option.setName('title').setDescription('🎫 Title of the ticket message'))
        .addStringOption(option => option.setName('description').setDescription('🎫 Description of the ticket message'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const category = interaction.options.getChannel('category');
        const supportRole = interaction.options.getRole('support_role');
        const title = interaction.options.getString('title') ?? 'Support Ticket';
        const description = interaction.options.getString('description') ?? 'Click the button below to open a ticket.';

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();

        const customId = supportRole ? `ticket_open_${category.id}_${supportRole.id}` : `ticket_open_${category.id}`;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(customId)
                    .setLabel('Open Ticket')
                    .setEmoji('🎫')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: 'Ticket system setup successfully!', flags: ['Ephemeral'] });
    },
};
