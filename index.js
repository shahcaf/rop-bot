const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const { loadEvents } = require('./handlers/eventHandler');
const { loadCommands } = require('./handlers/commandHandler');
const logger = require('./utils/logger');
const http = require('http');

// Render requires a port to be bound for Web Services to confirm it's healthy
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running gracefully!');
}).listen(process.env.PORT || 3000, '0.0.0.0', () => {
    logger.info(`Dummy web server listening on port ${process.env.PORT || 3000} to satisfy Render's port scan.`);
});
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();
client.cooldowns = new Collection();

client.login(process.env.BOT_TOKEN || process.env.DISCORD_TOKEN).then(async () => {
    logger.info(`Logged in as ${client.user.tag}`);
    const { initDB } = require('./database/connection');
    
    // Initialize Local SQLite Database
    await initDB();
    
    await loadEvents(client);
    await loadCommands(client);

    // Automatic Giveaway Checker
    setInterval(async () => {
        try {
            const { query } = require('./database/connection');
            const res = await query('SELECT * FROM giveaways WHERE ends_at <= CURRENT_TIMESTAMP AND ended = FALSE');
            for (const giveaway of res.rows) {
                try {
                    const channel = await client.channels.fetch(giveaway.channel_id).catch(() => null);
                    if (!channel) continue;
                    const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
                    if (!message) continue;

                    const reaction = message.reactions.cache.get('🎉');
                    const users = await reaction.users.fetch();
                    const entries = users.filter(u => !u.bot);

                    let winners = [];
                    if (entries.size > 0) {
                        winners = entries.random(Math.min(entries.size, giveaway.winners_count));
                    }
                    const winnerMentions = winners.length > 0 ? winners.map(w => w.toString()).join(', ') : 'No one';

                    await query('UPDATE giveaways SET ended = TRUE WHERE message_id = $1', [giveaway.message_id]);

                    const embed = EmbedBuilder.from(message.embeds[0])
                        .setColor(0xFF0000)
                        .setTitle('🎉 GIVEAWAY ENDED 🎉')
                        .setDescription(`Prize: **${giveaway.prize}**\nWinner(s): ${winnerMentions}\nHost: <@${giveaway.host_id}>`);

                    await message.edit({ embeds: [embed] });
                    if (winners.length > 0) {
                        await channel.send(`Congratulations ${winnerMentions}! You won **${giveaway.prize}**!`);
                    } else {
                        await channel.send(`The giveaway for **${giveaway.prize}** ended, but no one entered.`);
                    }
                } catch (err) {
                    logger.error('Error ending giveaway in loop:', err);
                }
            }
        } catch (globalErr) {
            // Usually this throws "Database is not configured" 
            // We can silently ignore or just log it at debug level
            // logger.warn('Giveaway checker skipped: ' + globalErr.message);
        }
    }, 60000);
}).catch((err) => {
    logger.error('Failed to login:', err);
});

// Basic error handling for the process
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception thrown:', err);
});
