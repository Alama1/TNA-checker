const Configuration = require('./Configuration')
const DiscordManager = require('./discord/DiscordManager')
const ExpressManager = require('./express/ExpressManager')
const MinecraftManager = require('./minecraft/minecraftManager')
const Logger = require('./Logger')

class Application {
    private log: typeof Logger;
    private config: typeof Configuration;
    private discord: typeof DiscordManager;
    private express: typeof ExpressManager;
    private minecraft: typeof MinecraftManager;
    async register() {
        this.config = new Configuration()
        this.log = new Logger()
        this.discord = new DiscordManager(this)
        this.express = new ExpressManager(this)
        this.minecraft = new MinecraftManager(this)
    }

    async connect() {
        this.discord.connect()
        this.express.initialize()
        this.minecraft.connect()
    }
}

module.exports = new Application()
