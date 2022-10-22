import fs from "fs";
import path from "path";

const StateHandler = require('./handlers/StateHandler')
const InteractionHandler = require('./handlers/InteractionHandler')
const ButtonHandler = require('./handlers/ButtonHandler')
const { Client, IntentsBitField } = require('discord.js')
class DiscordManager  {
    private app: any;
    private stateHandler: typeof StateHandler;
    private client: typeof Client;
    private interactionHandler: typeof InteractionHandler;
    private buttonHandler: typeof ButtonHandler;
    cataLevelExp: Object
    constructor(app) {

        this.app = app
        this.stateHandler = new StateHandler(this)
        this.cataLevelExp = JSON.parse(fs.readFileSync(path.resolve('./catacombsExpNeeded.json'), { encoding: 'utf-8'}))
    }

    connect() {
        const allIntends = new IntentsBitField(9763)
        this.client = new Client({
            cacheGuilds: true,
            cacheChannels: true,
            cacheOverwrites: false,
            cacheRoles: true,
            cacheEmojis: false,
            cachePresences: false,
            intents: allIntends
        })


        this.client.on('ready', () => {
            this.stateHandler.onReady()
            this.interactionHandler = new InteractionHandler(this)
            this.buttonHandler = new ButtonHandler(this)
        })

        this.client.on('interactionCreate', interaction => {
            this.interactionHandler.onInteraction(interaction)
        })

        this.client.login(this.app.config.discord.token).catch(error => {
            this.app.log.error(error)

            process.exit(1)
        })
    }
}
export {}

module.exports = DiscordManager
