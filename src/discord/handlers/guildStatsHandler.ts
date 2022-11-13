const discordManeger = require('../DiscordManager')

class guildStatsHandler {
    private discord: typeof discordManeger;
    constructor(discord) {
        this.discord = discord
    }

    async onReady() {
        // setInterval(() => {
        //     this.updateChannelNames()
        // }, 60000)
    }

    async updateChannelNames() {
        const config = this.discord.app.config.properties
        let mainGuild
        await this.discord.client.guilds.fetch(config.discord.guildID).then(async guild => {
            mainGuild = guild
        })
        let a = await mainGuild.channels.fetch('1041410007566135306')
        a.setName('E')
    }
}
export {}

module.exports = guildStatsHandler
