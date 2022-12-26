const path = require("path");

const fs = require('fs')
const {EmbedBuilder, Collection} = require('discord.js')

class ButtonsHandler {
    private buttons: typeof Collection;
    private discord: any;
    private bonzoRole
    private lividRole
    private necronRole
    private eliteRole

    constructor(discord) {
        this.discord = discord
        this.buttons = new Collection()
        let buttonFiles = fs.readdirSync(path.resolve(__dirname, '../buttons'))
        for (const file of buttonFiles) {
            const button = new (require(path.resolve(__dirname, '../buttons', file)))(discord)
            this.buttons.set(button.name, button)
        }

        this.discord.client.guilds.fetch(this.discord.app.config.discord.guildID).then(async guild => {
            this.bonzoRole = await guild.roles.fetch(this.discord.app.config.discord.bonzoRole)
            this.lividRole = await guild.roles.fetch(this.discord.app.config.discord.lividRole)
            this.necronRole = await guild.roles.fetch(this.discord.app.config.discord.necronRole)
            this.eliteRole = await guild.roles.fetch(this.discord.app.config.discord.eliteRole)
        })
    }

    async handle(interaction) {
        switch (interaction.customId) {
            case 'roleRequestButton':
                if (!interaction.member._roles.some(role => role === this.bonzoRole.id || role === this.lividRole.id
                    || role === this.necronRole.id || role === this.eliteRole.id)) {
                    const replyEmbed = new EmbedBuilder()
                        .setColor('#DC143C')
                        .setTitle(`Permission denied!`)
                        .setDescription('You need to have any weight role to press that!')
                    await interaction.editReply({
                        embeds: [replyEmbed],
                        ephemeral: true
                    })
                    return false
                }
                const interactionButtonID = interaction.customId

                let buttonPressed = this.buttons.get(interactionButtonID)

                if (!buttonPressed) return false

                this.discord.app.log.discord(`[${buttonPressed.name}] pressed`)

                buttonPressed.onPressed(interaction)
                return true
            default:
                return
        }
    }
}
export{}
module.exports = ButtonsHandler
