const { Events, EmbedBuilder, Collection } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'help_category') {
                try {
                    const category = interaction.values[0];
                    const fs = require('fs');
                    const path = require('path');
                    const cmdFiles = fs.readdirSync(path.join(__dirname, `../commands/${category}`)).filter(f => f.endsWith('.js'));
                    
                    const cmdNames = [];
                    for (const f of cmdFiles) {
                        try {
                            const cmdModule = require(path.join(__dirname, `../commands/${category}/${f}`));
                            if (cmdModule && cmdModule.data && cmdModule.data.name) {
                                cmdNames.push(`\`/${cmdModule.data.name}\``);
                            }
                        } catch (e) {
                            logger.warn(`Could not load command info for help menu from ${f}: ${e.message}`);
                        }
                    }

                    const embed = new EmbedBuilder()
                        .setColor(0x2B2D31)
                        .setTitle(`📂 ${category} Commands Module`)
                        .setDescription(`Here are all the available commands for the **${category}** module:\n\n` + (cmdNames.length > 0 ? cmdNames.join(', ') : 'No commands found.'))
                        .setTimestamp();

                    return await interaction.update({ embeds: [embed] });
                } catch (error) {
                    logger.error('Error generating help menu:', error);
                    return await interaction.reply({ content: 'An error occurred while loading this category.', flags: ['Ephemeral'] });
                }
            }
        }

        if (interaction.isButton()) {
            if (interaction.customId.startsWith('ticket_open_')) {
                try {
                    const categoryId = interaction.customId.replace('ticket_open_', '');
                    const category = interaction.guild.channels.cache.get(categoryId);
                    
                    const channel = await interaction.guild.channels.create({
                        name: `ticket-${interaction.user.username}`,
                        type: require('discord.js').ChannelType.GuildText,
                        parent: category,
                        permissionOverwrites: [
                            { id: interaction.guild.roles.everyone, deny: [require('discord.js').PermissionFlagsBits.ViewChannel] },
                            { id: interaction.user.id, allow: [require('discord.js').PermissionFlagsBits.ViewChannel, require('discord.js').PermissionFlagsBits.SendMessages, require('discord.js').PermissionFlagsBits.ReadMessageHistory] }
                        ]
                    });

                    const { query } = require('../database/connection');
                    try {
                        await query('INSERT INTO tickets (channel_id, guild_id, user_id) VALUES ($1, $2, $3)', [channel.id, interaction.guildId, interaction.user.id]);
                    } catch (dbErr) {
                        logger.warn('Skipped saving ticket to DB (not configured).');
                    }

                    const embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle('Ticket Opened')
                        .setDescription(`Welcome ${interaction.user}! A moderator will be with you shortly. Use \`/ticket-close\` to end this session.`)
                        .setTimestamp();

                    const row = new (require('discord.js')).ActionRowBuilder()
                        .addComponents(
                            new (require('discord.js')).ButtonBuilder()
                                .setCustomId('ticket_claim')
                                .setLabel('Claim Ticket')
                                .setStyle(require('discord.js').ButtonStyle.Success),
                            new (require('discord.js')).ButtonBuilder()
                                .setCustomId('ticket_delete')
                                .setLabel('Close Ticket')
                                .setStyle(require('discord.js').ButtonStyle.Danger)
                        );

                    await channel.send({ embeds: [embed], components: [row] });
                    return await interaction.reply({ content: `Ticket created: ${channel}`, flags: ['Ephemeral'] });
                } catch (error) {
                    logger.error('Error creating ticket:', error);
                    return await interaction.reply({ content: 'Failed to create the ticket.', flags: ['Ephemeral'] });
                }
            }
            
            if (interaction.customId === 'ticket_claim') {
                if (!interaction.memberPermissions.has(require('discord.js').PermissionFlagsBits.ManageMessages)) {
                    return await interaction.reply({ content: 'You do not have permission to claim tickets.', flags: ['Ephemeral'] });
                }
                
                try {
                    const { query } = require('../database/connection');
                    await query("UPDATE tickets SET claimer_id = $1, status = 'claimed' WHERE channel_id = $2", [interaction.user.id, interaction.channelId]);
                } catch (dbErr) {
                    logger.warn('Skipped DB update for ticket claim.');
                }
                
                const claimedEmbed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setDescription(`🎟️ **Ticket Claimed**\nThis ticket will be handled by ${interaction.user}.`);
                
                const disabledRow = new (require('discord.js')).ActionRowBuilder()
                    .addComponents(
                        new (require('discord.js')).ButtonBuilder()
                            .setCustomId('ticket_claim')
                            .setLabel('Claimed by ' + interaction.user.username)
                            .setStyle(require('discord.js').ButtonStyle.Secondary)
                            .setDisabled(true),
                        new (require('discord.js')).ButtonBuilder()
                            .setCustomId('ticket_delete')
                            .setLabel('Close Ticket')
                            .setStyle(require('discord.js').ButtonStyle.Danger)
                    );
                    
                await interaction.update({ components: [disabledRow] });
                return await interaction.channel.send({ embeds: [claimedEmbed] });
            }

            if (interaction.customId === 'ticket_delete') {
                await interaction.reply({ content: 'Closing ticket in 5 seconds...' });
                setTimeout(async () => {
                    try {
                        const { query } = require('../database/connection');
                        await query('DELETE FROM tickets WHERE channel_id = $1', [interaction.channelId]);
                    } catch (error) {
                        logger.warn('Skipped deleting ticket from DB.');
                    }
                    try {
                        await interaction.channel.delete();
                    } catch (error) {
                        logger.error('Failed to delete channel:', error);
                    }
                }, 5000);
                return;
            }
            
            if (interaction.customId === 'verify_button') {
                try {
                    const { query } = require('../database/connection');
                    const res = await query('SELECT verify_role FROM guild_settings WHERE guild_id = $1', [interaction.guildId]);
                    
                    if (res.rows.length === 0 || !res.rows[0].verify_role) {
                        return await interaction.reply({ content: 'The server administrator has not set up a verification role yet.', flags: ['Ephemeral'] });
                    }
                    
                    const roleId = res.rows[0].verify_role;
                    const role = interaction.guild.roles.cache.get(roleId);
                    
                    if (!role) {
                        return await interaction.reply({ content: 'The configured verification role no longer exists.', flags: ['Ephemeral'] });
                    }
                    
                    if (interaction.member.roles.cache.has(roleId)) {
                        return await interaction.reply({ content: 'You are already verified!', flags: ['Ephemeral'] });
                    }
                    
                    await interaction.member.roles.add(role);
                    return await interaction.reply({ content: '✅ You have been successfully verified!', flags: ['Ephemeral'] });
                } catch (error) {
                    logger.error('Verification error:', error);
                    return await interaction.reply({ content: 'An error occurred while verifying you.', flags: ['Ephemeral'] });
                }
            }
        }

        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            logger.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        // Cooldowns
        const { cooldowns } = client;
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownDuration = 3;
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                return interaction.reply({ 
                    content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, 
                    flags: ['Ephemeral'] 
                });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
            await command.execute(interaction, client);
        } catch (error) {
            logger.error(`Error executing ${interaction.commandName}`);
            logger.error(error);

            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Error')
                .setDescription('There was an error while executing this command!')
                .setFooter({ text: 'If this persists, contact the bot owner.' });

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], flags: ['Ephemeral'] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: ['Ephemeral'] });
            }
        }
    },
};
