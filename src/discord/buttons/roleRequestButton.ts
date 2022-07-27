const fetch = require('node-fetch')
const { EmbedBuilder } = require('discord.js')
const minecraftManager = require('../../minecraft/minecraftManager')
export {}

class RoleRequestButton {
    private bridgeBotChannel: any;
    private bonzoRole: any;
    private lividRole: any;
    private eliteRole: any;
    private necronRole: any;
    private name: string;
    private discord: any;
    private minecraftManager: typeof minecraftManager;
    constructor(discord) {
        this.name = 'roleRequestButton'
        this.discord = discord
        this.minecraftManager = this.discord.app.minecraft
    }

    async onPressed(interaction) {
        this.bridgeBotChannel = this.discord.app.config.properties.minecraft.bridge_bot_channel
        this.bonzoRole = interaction.guild.roles.cache.find(r => r.id === this.discord.app.config.properties.discord.bonzoRole)
        this.lividRole = interaction.guild.roles.cache.find(r => r.id === this.discord.app.config.properties.discord.lividRole)
        this.necronRole = interaction.guild.roles.cache.find(r => r.id === this.discord.app.config.properties.discord.necronRole)
        this.eliteRole = interaction.guild.roles.cache.find(r => r.id === this.discord.app.config.properties.discord.eliteRole)

        await interaction.deferReply({
            ephemeral: true
        })

        let memberUsername = interaction.member.nickname ? interaction.member.nickname : interaction.member.user.username
        const memberUUID = await this.minecraftManager.getMinecraftUUID(memberUsername)

        if (!memberUUID) {
            let apiUnavailable = new EmbedBuilder()
            apiUnavailable.setTitle('Nick not found!')
            apiUnavailable.setDescription('Make sure that some furry didn\'t change your discord nickname and it is the same as in game.')
            apiUnavailable.setColor('#F04947')
            await interaction.editReply({
                embeds: [apiUnavailable],
                ephemeral: true
            })
            return
        }

        const ingameGuild = await fetch(`https://api.hypixel.net/guild?key=${this.discord.app.config.properties.minecraft.api_key}&id=602915918ea8c9cb50ede5fd`).then(g => g.json())
        const guildMembers = ingameGuild.guild.members
        const userInGuild = guildMembers.filter(user => user.uuid === memberUUID.id)
        if (userInGuild.length === 0) {
            let apiUnavailable = new EmbedBuilder()
            apiUnavailable.setTitle('User not found')
            apiUnavailable.setDescription(`There’s no ${memberUsername} in our guild!`)
            apiUnavailable.setColor('#F04947')
            await interaction.editReply({
                embeds: [apiUnavailable],
                ephemeral: true
            })
            return
        }

        if (userInGuild[0].rank.toLowerCase() === 'staff' || userInGuild[0].rank.toLowerCase() === 'gm') {
            let rankAlreadyRelevant = new EmbedBuilder()
            rankAlreadyRelevant.setTitle('Retard alert!')
            rankAlreadyRelevant.setDescription('Staff members can\'t do that!')
            rankAlreadyRelevant.setColor('#F04947')
            await interaction.editReply({
                embeds: [rankAlreadyRelevant],
                ephemeral: true
            })
            return
        }

        const userWeight = await this.minecraftManager.getSenitherProfile(memberUsername)
        const totalWeight = userWeight.data.weight + userWeight.data.weight_overflow
        const relevantRole = this.getPlayerRank(totalWeight)

        if (relevantRole.name === 'Not enough weight') {
            let notEnoughWeight = new EmbedBuilder()
            notEnoughWeight.setTitle('OOF')
            notEnoughWeight.setDescription('Not enough weight even for a bonzo rank! You better fix it!')
            notEnoughWeight.setColor('#F04947')
            await interaction.editReply({
                embeds: [notEnoughWeight],
                ephemeral: true
            })
            return
        }

        if (userInGuild[0].rank.toLowerCase() === relevantRole.name.toLowerCase()) {
            const lividReq = this.discord.app.config.properties.minecraft.livid
            const necronReq = this.discord.app.config.properties.minecraft.necron
            const eliteReq = this.discord.app.config.properties.minecraft.elite
            let weightLeft
            console.log(lividReq)
            console.log(totalWeight)
            switch (relevantRole.name) {
                case 'bonzo':
                    weightLeft = `You need ${(lividReq - totalWeight).toFixed(0)} more weight for the next rank.`
                    break
                case 'livid':
                    weightLeft = `You need ${(necronReq - totalWeight).toFixed(0)} more weight for the next rank.`
                    break
                case 'necron':
                    weightLeft = `You need ${(eliteReq - totalWeight).toFixed(0)} more weight for the next rank.`
                    break
                case 'elite':
                    weightLeft = 'You need 177013 more weight for the next rank.'
            }
            let rankAlreadyRelevant = new EmbedBuilder()
            rankAlreadyRelevant.setTitle('You already have relevant role!')
            rankAlreadyRelevant.setDescription(`Current weight: ${totalWeight.toFixed(0)}. -100 social credit \n ${weightLeft}`)
            rankAlreadyRelevant.setColor('#F04947')
            await interaction.editReply({
                embeds: [rankAlreadyRelevant],
                ephemeral: true
            })
            return
        }
        const bridgeBotChannel = await this.discord.client.channels.fetch(this.bridgeBotChannel)
        let rankSet = new EmbedBuilder()
        rankSet.setTitle('Done!')
        rankSet.setDescription(`Your new rank is ${relevantRole.name}! \nMake sure that bridge bot is online and it updated your rank ingame!`)
        rankSet.setColor('#0099ff')
        await interaction.editReply({
            embeds: [rankSet],
            ephemeral: true
        })
        bridgeBotChannel.send(`!setrank ${memberUsername} ${relevantRole.name}`)

        const userRoles = interaction.member._roles

        if (relevantRole.name !== 'Not enough weight') {
            if (!userRoles.some(roles => roles === relevantRole.id)) {
                interaction.member.roles.add(relevantRole)
            }
        }

        switch (relevantRole.name) {
            case this.bonzoRole.name:
                if (userRoles.some(roles => roles === this.lividRole.id || roles === this.necronRole.id || roles === this.eliteRole.id)) {
                    interaction.member.roles.remove(this.lividRole)
                    interaction.member.roles.remove(this.necronRole)
                    interaction.member.roles.remove(this.eliteRole)
                }
                break
            case this.lividRole.name:
                if (userRoles.some(roles => roles === this.necronRole.id || roles === this.eliteRole.id)) {
                    interaction.member.roles.remove(this.necronRole)
                    interaction.member.roles.remove(this.eliteRole)
                }
                break
            case this.necronRole.name:
                if (userRoles.some(roles => roles === this.eliteRole.id)) {
                    interaction.member.roles.remove(this.eliteRole)
                }
                break
        }
    }

    getPlayerRank(totalWeight) {
        const bonzoReq = this.discord.app.config.properties.minecraft.bonzo
        const lividReq = this.discord.app.config.properties.minecraft.livid
        const necronReq = this.discord.app.config.properties.minecraft.necron
        const eliteReq = this.discord.app.config.properties.minecraft.elite

        if (totalWeight < bonzoReq) {
            return { name: 'Not enough weight' }
        }

        switch (true) {
            case (parseInt(totalWeight) < lividReq):
                return this.bonzoRole
            case (parseInt(totalWeight) < necronReq):
                return this.lividRole
            case (parseInt(totalWeight) < eliteReq):
                return this.necronRole
            default:
                return this.eliteRole
        }
    }
}

module.exports = RoleRequestButton
