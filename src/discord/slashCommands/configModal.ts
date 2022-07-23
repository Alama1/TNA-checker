const {ModalBuilder , TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js')
export{ ActionRowBuilder }

class ConfigModal {
    private discord: any;
    private name: string;
    constructor(discord) {
        this.discord = discord
        this.name = 'config'
    }

    async onCommand(interaction) {
        const modalReply = new ModalBuilder ()
            .setCustomId('configmodal')
            .setTitle('Config')

        const apiKey = new TextInputBuilder()
            .setCustomId('apiKey')
            .setLabel(`Key: ${this.discord.app.config.properties.minecraft.api_key}`)
            .setPlaceholder('New api key')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(40)
            .setMinLength(30)
            .setRequired(false)

        const bonzoRoleReq = new TextInputBuilder()
            .setCustomId('bonzoReq')
            .setLabel(`Bonzo role req: ${this.discord.app.config.properties.minecraft.bonzo}`)
            .setPlaceholder('New bonzo requirement')
            .setStyle(TextInputStyle.Short)
            .setMinLength(3)
            .setMaxLength(5)
            .setRequired(false)

        const lividRoleReq = new TextInputBuilder()
            .setCustomId('lividReq')
            .setLabel(`Livid role req: ${this.discord.app.config.properties.minecraft.livid}`)
            .setPlaceholder('New livid requirement')
            .setStyle(TextInputStyle.Short)
            .setMinLength(3)
            .setMaxLength(5)
            .setRequired(false)

        const necronRoleReq = new TextInputBuilder()
            .setCustomId('necronReq')
            .setLabel(`Necron role req: ${this.discord.app.config.properties.minecraft.necron}`)
            .setPlaceholder('New necron requirement')
            .setStyle(TextInputStyle.Short)
            .setMinLength(3)
            .setMaxLength(5)
            .setRequired(false)

        const eliteRoleReq = new TextInputBuilder()
            .setCustomId('eliteReq')
            .setLabel(`Elite role req: ${this.discord.app.config.properties.minecraft.elite}`)
            .setPlaceholder('New elite requirement')
            .setStyle(TextInputStyle.Short)
            .setMinLength(3)
            .setMaxLength(5)
            .setRequired(false)

        const apiKeyRow = new ActionRowBuilder().addComponents(apiKey)
        const bonzoRow = new ActionRowBuilder().addComponents(bonzoRoleReq)
        const lividRow = new ActionRowBuilder().addComponents(lividRoleReq)
        const necronRow = new ActionRowBuilder().addComponents(necronRoleReq)
        const eliteRow = new ActionRowBuilder().addComponents(eliteRoleReq)


        modalReply.addComponents(apiKeyRow, bonzoRow, lividRow, necronRow, eliteRow)
        await interaction.showModal(modalReply)
    }

}

module.exports = ConfigModal
