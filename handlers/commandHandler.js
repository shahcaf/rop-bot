const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

async function loadCommands(client) {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        if(!fs.lstatSync(folderPath).isDirectory()) continue;
        
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            try {
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    logger.info(`Loaded command: ${command.data.name} [${folder}]`);
                } else {
                    logger.warn(`The command at ${filePath} is missing "data" or "execute" properties.`);
                }
            } catch (error) {
                logger.error(`Failed to load command at ${file}:`, error);
            }
        }
    }
}

module.exports = { loadCommands };
