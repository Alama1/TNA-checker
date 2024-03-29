const { EmbedBuilder } = require('discord.js')
const interactionHandler = require('../handlers/InteractionHandler')
export {}

class inactivityCheckCommand {
    private discord: typeof interactionHandler;
    private name: string;

    constructor(discord) {
        this.discord = discord
        this.name = 'updatekey'
    }

    async onCommand(interaction) {
        try {
            const res = await fetch(this.discord.app.config.properties.discord.apiNewURL).then(async r => await r.json())
            if (res.success === true) {
                const returnEmbed = new EmbedBuilder()
                returnEmbed
                    .setTitle('Done!')
                    .setColor('#0099ff')
                interaction.editReply({
                    ephemeral: false,
                    embeds: [returnEmbed]
                })
            }
        } catch (e) {
            const returnEmbed = new EmbedBuilder()
            returnEmbed
                .setTitle('Oopsie')
                .setDescription(`Error code: ${e.code}`)
                .setColor('#de1b1b')
            interaction.editReply({
                embeds: [returnEmbed]
            })
        }
    }
}


module.exports = inactivityCheckCommand
