const stateHandlerDiscord = require('../DiscordManager')

class StateHandler {
    private discord: typeof stateHandlerDiscord;
    constructor(discord) {
        this.discord = discord
    }

    onReady() {
        this.discord.app.log.discord('Client ready, logged in as ' + this.discord.client.user.tag)
        this.discord.client.user.setActivity('the chat', { type: 'LISTENING' })
        this.discord.client.user.setStatus('online')
    }
}
export {}

module.exports = StateHandler
