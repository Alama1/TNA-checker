import {webcrypto} from "crypto";

const interactionHandler = require('../handlers/InteractionHandler')
const minecraftManager = require('../../minecraft/minecraftManager')
const fetch = require('node-fetch')
const {EmbedBuilder} = require('discord.js')
export {}

class DiscordCheck {
    private discord: typeof interactionHandler;
    private name: string;
    private minecraftManager: typeof minecraftManager;

    constructor(discord) {
        this.discord = discord
        this.name = 'discordcheck'
        this.minecraftManager = this.discord.app.minecraft
    }

    bonzoRole
    lividRole
    necronRole
    eliteRole
    shouldRemoveRoles

    async onCommand(interaction) {
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

        this.bonzoRole = await interaction.guild.roles.fetch(this.discord.app.config.properties.discord.bonzoRole)
        this.lividRole = await interaction.guild.roles.fetch(this.discord.app.config.properties.discord.lividRole)
        this.necronRole = await interaction.guild.roles.fetch(this.discord.app.config.properties.discord.necronRole)
        this.eliteRole = await interaction.guild.roles.fetch(this.discord.app.config.properties.discord.eliteRole)

        this.shouldRemoveRoles = interaction.options._hoistedOptions[0].value
        let allDiscordUsersWithWeightRoles
        let allDiscordUsers

        let guild = await this.minecraftManager.getGuild()
        const guildMembers = guild.guild.members

        const startedEmbed = new EmbedBuilder()
            .setTitle('Beep')
            .setDescription('Boop')
            .setColor('#FFFF00')
        await interaction.editReply({
            ephemeral: false,
            embeds: [startedEmbed]
        })

        await interaction.guild.members
            .fetch()
            .then((members) => {
                allDiscordUsers = Array.from(members)
                allDiscordUsersWithWeightRoles = members.filter(m => m._roles.some(role =>
                    role === this.bonzoRole.id ||
                    role === this.lividRole.id ||
                    role === this.necronRole.id ||
                    role === this.eliteRole.id
                ))
            })

        let allPlayersInfo = []
        let allowedDiscords = []
        let index = 0
        for (const member of guildMembers) {
            index++
            const loadingMembersEmbed = new EmbedBuilder()
                .setTitle('Loading guild members profiles...')
                .setDescription(`${index}/${guildMembers.length}`)
                .setColor('#FFFF00')
            if (index%5 === 0) {
                interaction.editReply({
                    ephemeral: false,
                    embeds: [loadingMembersEmbed]
                })
            }
            let senitherProfile = await this.minecraftManager.getSenitherProfileWithUUID(member.uuid)
            let hypixelProfile = await this.minecraftManager.getHypixelProfiles(member.uuid)
            if (!hypixelProfile.player.hasOwnProperty('socialMedia')) {
                continue
            }
            const discordLink = hypixelProfile.player.socialMedia.links.DISCORD ?? 'none#none'
            if (!hypixelProfile.player.socialMedia.links.DISCORD) {

            }
            const weight = senitherProfile.data.weight + senitherProfile.data.weight_overflow
            allowedDiscords.push(discordLink.split('#')[0])
            allPlayersInfo.push({uuid: member.uuid, weight: weight, rank: member.rank, discord: discordLink})
            await wait(2000)
        }

        const loadingFinishedEmbed = new EmbedBuilder()
            .setTitle('Loading finished...')
            .setDescription('Fixing ranks')
            .setColor('#FFFF00')
        interaction.editReply({
            ephemeral: false,
            embeds: [loadingFinishedEmbed]
        })

        let membersChangedArray = []

        allDiscordUsers.forEach(member => {
            const nick = member[1].nickname ? member[1].nickname : member[1].user.username
            const found = allPlayersInfo.some(item => item.discord.split('#')[0] === member[1].user.username)
            if (found) {
                let profile = allPlayersInfo.find(item => item.discord.split('#')[0] === member[1].user.username)
                let relevantRole = this.getPlayerRank(profile.weight)
                if (!member[1]._roles.includes(relevantRole.id)) {
                    member[1].roles.add(relevantRole.id)
                    membersChangedArray.push(
                        { name: nick, value: `${relevantRole.name} role added`, inline: true})
                }
                switch (relevantRole.name.toLowerCase()) {
                    case 'bonzo':
                        member[1].roles.remove(this.lividRole.id)
                        member[1].roles.remove(this.necronRole.id)
                        member[1].roles.remove(this.eliteRole.id)
                        break
                    case 'livid':
                        member[1].roles.remove(this.necronRole.id)
                        member[1].roles.remove(this.eliteRole.id)
                        break
                    case 'necron':
                        member[1].roles.remove(this.eliteRole.id)
                        break
                    case 'elite':
                        break
                    default:
                        break
                }
            } else {
                let weightRolesThatUserHas = member[1]._roles.some(role =>
                    role === this.bonzoRole.id ||
                    role === this.lividRole.id ||
                    role === this.necronRole.id ||
                    role === this.eliteRole.id)
                if (weightRolesThatUserHas) {
                    member[1].roles.remove(this.bonzoRole.id)
                    member[1].roles.remove(this.lividRole.id)
                    member[1].roles.remove(this.necronRole.id)
                    member[1].roles.remove(this.eliteRole.id)
                    membersChangedArray.push(
                        { name: nick, value: `All weight roles removed`, inline: true})
                }
            }
        })
        const returnEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Members check done!')
            .setAuthor({ name: 'TNA', iconURL: 'https://i.imgur.com/bdNxeHt.jpeg' })
            .setDescription('Here\'s all users that got changed')
            .setThumbnail('https://i.imgur.com/bdNxeHt.jpeg')
            .setTimestamp()

        const secondEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Second list')
            .setAuthor({ name: 'TNA', iconURL: 'https://i.imgur.com/bdNxeHt.jpeg' })
            .setDescription('Here\'s some more users')
        let embedsToReturn = [returnEmbed]
        if (membersChangedArray.length > 20) {
            const secondPart = membersChangedArray.splice(21)
            returnEmbed.addFields(membersChangedArray)
            secondEmbed.addFields(secondPart)
            embedsToReturn.push(secondEmbed)
        } else {
            returnEmbed.addFields(membersChangedArray)
        }
        interaction.editReply({
            ephemeral: false,
            embeds: embedsToReturn
        })
    }

    getPlayerRank(totalWeight) {
        const bonzoReq = this.discord.app.config.properties.minecraft.bonzo
        const lividReq = this.discord.app.config.properties.minecraft.livid
        const necronReq = this.discord.app.config.properties.minecraft.necron
        const eliteReq = this.discord.app.config.properties.minecraft.elite

        switch (true) {
            case (totalWeight < lividReq):
                return this.bonzoRole
            case (totalWeight < necronReq):
                return this.lividRole
            case (totalWeight < eliteReq):
                return this.necronRole
            default:
                return this.eliteRole
        }
    }
}

module.exports = DiscordCheck
