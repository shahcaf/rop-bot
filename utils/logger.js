const chalk = require('chalk');
const moment = require('moment');

const logger = {
    info: (msg) => {
        console.log(`${chalk.gray(`[${moment().format('HH:mm:ss')}]`)} ${chalk.blue('INFO')}  : ${msg}`);
    },
    warn: (msg) => {
        console.log(`${chalk.gray(`[${moment().format('HH:mm:ss')}]`)} ${chalk.yellow('WARN')}  : ${msg}`);
    },
    error: (msg, ...args) => {
        console.log(`${chalk.gray(`[${moment().format('HH:mm:ss')}]`)} ${chalk.red('ERROR')} : ${msg}`, ...args);
    },
    cmd: (msg) => {
        console.log(`${chalk.gray(`[${moment().format('HH:mm:ss')}]`)} ${chalk.magenta('CMD')}   : ${msg}`);
    },
    success: (msg) => {
        console.log(`${chalk.gray(`[${moment().format('HH:mm:ss')}]`)} ${chalk.green('SUCCESS')}: ${msg}`);
    }
};

module.exports = logger;
