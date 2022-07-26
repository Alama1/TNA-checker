const chalk = require('chalk')
export {}

class Logger {
    discord(message) {
        return console.log(chalk.bgMagenta.black(`[${this.getCurrentTime()}] Discord >`) + ' ' + chalk.magenta(message))
    }

    minecraft(message) {
        return console.log(chalk.bgGreenBright.black(`[${this.getCurrentTime()}] Minecraft >`) + ' ' + chalk.greenBright(message))
    }

    express(message) {
        return console.log(chalk.bgCyan.black(`[${this.getCurrentTime()}] Express >`) + ' ' + chalk.cyan(message))
    }

    error(message) {
        return console.log(chalk.bgRedBright.black(`[${this.getCurrentTime()}] Error >`) + ' ' + chalk.redBright(message))
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    }
}

module.exports = Logger
