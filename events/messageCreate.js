const { Events, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { query } = require('../database/connection');
const logger = require('../utils/logger');

const antiSpamMap = new Map();

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // Anti-Link and Anti-Spam Check
        try {
            const res = await query('SELECT * FROM guild_settings WHERE guild_id = $1', [message.guild.id]);
            const config = res.rows[0] || {};

            // Permission check: ignore admins/mods for security features
            const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator) || message.member.permissions.has(PermissionFlagsBits.ManageMessages);

            if (!isAdmin) {
                // Anti-Link
                if (config.anti_link && /(https?:\/\/[^\s]+)/g.test(message.content)) {
                    await message.delete().catch(() => {});
                    return message.channel.send(`${message.author}, links are not allowed in this server!`).then(m => setTimeout(() => m.delete(), 5000));
                }

                // Anti-Spam (Basic)
                if (config.anti_spam) {
                    const authorId = message.author.id;
                    const now = Date.now();
                    const userData = antiSpamMap.get(authorId) || { lastMessage: 0, count: 0 };

                    if (now - userData.lastMessage < 2000) { // 2 seconds threshold
                        userData.count++;
                    } else {
                        userData.count = 1;
                    }
                    userData.lastMessage = now;
                    antiSpamMap.set(authorId, userData);

                    if (userData.count > 5) {
                        await message.delete().catch(() => {});
                        if (userData.count === 6) {
                            return message.channel.send(`${message.author}, please stop spamming!`).then(m => setTimeout(() => m.delete(), 5000));
                        }
                        return;
                    }
                }
            }
        } catch (error) {
            logger.error('Error in security check:', error);
        }

        // Leveling System
        try {
            const xpToAdd = Math.floor(Math.random() * 10) + 15;
            
            const levelRes = await query('SELECT * FROM levels WHERE guild_id = $1 AND user_id = $2', [message.guild.id, message.author.id]);
            
            if (levelRes.rows.length === 0) {
                await query('INSERT INTO levels (guild_id, user_id, xp, level) VALUES ($1, $2, $3, $4)', 
                    [message.guild.id, message.author.id, xpToAdd, 0]);
            } else {
                const currentXp = levelRes.rows[0].xp;
                const currentLevel = levelRes.rows[0].level;
                const newXp = currentXp + xpToAdd;
                const newLevel = Math.floor(Math.sqrt(newXp / 100));

                await query('UPDATE levels SET xp = $1, level = $2 WHERE guild_id = $3 AND user_id = $4', 
                    [newXp, newLevel, message.guild.id, message.author.id]);

                if (newLevel > currentLevel) {
                    const settingsRes = await query('SELECT level_channel_id FROM level_settings WHERE guild_id = $1', [message.guild.id]);
                    const channelId = settingsRes.rows[0]?.level_channel_id || message.channel.id;
                    const channel = message.guild.channels.cache.get(channelId);
                    
                    if (channel) {
                        channel.send(`GG ${message.author}! You leveled up to **Level ${newLevel}**!`);
                    }
                }
            }
        } catch (error) {
            logger.error('Error in leveling system:', error);
        }
    },
};
