const fs = require('fs')
const path = require('path')

const { EmbedBuilder } = require('discord.js')
const interactionHandler = require('../handlers/InteractionHandler')
export {}

class createButtonCommand {
    private discord: typeof interactionHandler;
    private name: string;
    constructor(discord) {
        this.discord = discord
        this.name = 'configmodal'
    }

    async onCommand(interaction) {
        let config = await JSON.parse(fs.readFileSync(path.resolve('./config.json'), 'utf-8'));
        let replyEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Done!')
            .setDescription('Fields that got changed:')
        let changedProperties = []

        let apiKey = parseInt((interaction.fields.fields.get('apiKey')).value)
        let bonzoReq = parseInt((interaction.fields.fields.get('bonzoReq')).value)
        let lividReq = parseInt((interaction.fields.fields.get('lividReq')).value)
        let necronReq = parseInt((interaction.fields.fields.get('necronReq')).value)
        let eliteReq = parseInt((interaction.fields.fields.get('eliteReq')).value)

        if (apiKey) {
            this.discord.app.config.properties.minecraft.api_key = apiKey
            config.minecraft.api_key = apiKey
            changedProperties.push({name: 'Api key', value: apiKey})
        }
        if (bonzoReq) {
            this.discord.app.config.properties.minecraft.bonzoReq = bonzoReq
            config.minecraft.bonzo = bonzoReq
            changedProperties.push({name: 'Bonzo', value: bonzoReq.toString()})
        }
        if (lividReq) {
            this.discord.app.config.properties.minecraft.lividReq = lividReq
            config.minecraft.livid = lividReq
            changedProperties.push({name: 'Livid', value: lividReq.toString()})
        }
        if (necronReq) {
            this.discord.app.config.properties.minecraft.necronReq = necronReq
            config.minecraft.necron = necronReq
            changedProperties.push({name: 'Necron', value: necronReq.toString()})
        }
        if (eliteReq) {
            this.discord.app.config.properties.minecraft.eliteReq = eliteReq
            config.minecraft.elite = eliteReq
            changedProperties.push({name: 'Elite', value: eliteReq.toString()})
        }
        fs.writeFile(path.resolve('./config.json'), JSON.stringify(config), function writeJSON(err) {
            if (err) return console.log(err);
        });
        replyEmbed
            .addFields(changedProperties)
        interaction.reply({ content: 'Boop!', embeds: [replyEmbed] })
    }
}


module.exports = createButtonCommand
