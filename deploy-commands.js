const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const logger = require('./utils/logger');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    if(!fs.lstatSync(folderPath).isDirectory()) continue;
    
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }
    }
}

const rest = new REST().setToken(process.env.BOT_TOKEN || process.env.DISCORD_TOKEN);

(async () => {
    try {
        const token = process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
        const clientId = Buffer.from(token.split('.')[0], 'base64').toString();
        const guildId = process.env.GUILD_ID;

        logger.info(`Started refreshing ${commands.length} application (/) commands.`);

        let data;
        if (guildId) {
            try {
                // Deploy to a specific guild (instant update)
                data = await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: commands },
                );
                logger.success(`Successfully reloaded ${data.length} application (/) commands for guild ${guildId}.`);
            } catch (err) {
                if (err.code === 50001) {
                    logger.warn(`Missing Access for guild ${guildId}. Deploying globally instead...`);
                    data = await rest.put(
                        Routes.applicationCommands(clientId),
                        { body: commands },
                    );
                    logger.success(`Successfully reloaded ${data.length} application (/) commands globally.`);
                } else {
                    throw err;
                }
            }
        } else {
            // Deploy globally (can take up to an hour to update everywhere)
            data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );
            logger.success(`Successfully reloaded ${data.length} application (/) commands globally.`);
        }
    } catch (error) {
        logger.error(error);
    }
})();
