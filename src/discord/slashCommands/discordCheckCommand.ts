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

    async onCommand(interaction) {
        this.bonzoRole = await interaction.guild.roles.fetch(this.discord.app.config.properties.discord.bonzoRole)
        this.lividRole = await interaction.guild.roles.fetch(this.discord.app.config.properties.discord.lividRole)
        this.necronRole = await interaction.guild.roles.fetch(this.discord.app.config.properties.discord.necronRole)
        this.eliteRole = await interaction.guild.roles.fetch(this.discord.app.config.properties.discord.eliteRole)

        let allUsersWithWeightRoles

        const startedEmbed = new EmbedBuilder()
            .setTitle('Beep')
            .setDescription('Boop')
            .setColor('#FFFF00')
        await interaction.reply({
            embeds: [startedEmbed]
        })

        await interaction.guild.members
            .fetch()
            .then((members) =>
                allUsersWithWeightRoles = members.filter(m => m._roles.some(role =>
                    role === this.bonzoRole.id ||
                    role === this.lividRole.id ||
                    role === this.necronRole.id ||
                    role === this.eliteRole.id
                )))
        let discordUsersInfo = []
        Array.from(allUsersWithWeightRoles.entries()).forEach((map, index) => {
            if (index % 5 === 0) {
                const progressEmbed = new EmbedBuilder()
                    .setColor('#FFFF00')
                    .setAuthor({ name: `Loading members. ${index + 1}/${allUsersWithWeightRoles.size}` })
                interaction.editReply({
                    embeds: [progressEmbed]
                })
            }

            let user = map[1]
            const nick = user.nickname ? user.nickname : user.user.username
            setTimeout(async () => {
                const senitherProfile = await this.minecraftManager.getSenitherProfile(nick)
                if (senitherProfile.status === 200) {
                    discordUsersInfo.push({username: nick, user: user, weight: senitherProfile.data.weight + senitherProfile.data.weight_overflow })
                }
                if (index + 1 === allUsersWithWeightRoles.size) {
                    const progressEmbed = new EmbedBuilder()
                        .setColor('#FFFF00')
                        .setAuthor({ name: `Done! Fixing player ranks...` })
                    interaction.editReply({
                        embeds: [progressEmbed]
                    })
                    this.processAllMembers(discordUsersInfo, interaction)
                }
            }, index * 1000)
        })
    }

    processAllMembers(members, interaction) {
        let anyoneChanged = false

        const returnEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Members check done!')
            .setAuthor({ name: 'TNA', iconURL: 'https://i.imgur.com/bdNxeHt.jpeg' })
            .setDescription('Here\'s all users that got changed')
            .setThumbnail('https://i.imgur.com/bdNxeHt.jpeg')
            .setTimestamp()
        let returnFields = []

        for (const member of members) {
            const userRoles = member.user._roles
            let realPlayerRank = this.getPlayerRank(member.weight)
            if (!member.user._roles.some(roles => roles === realPlayerRank.id)) {
                anyoneChanged = true
                returnFields.push({ name: member.username, value: `Weight: ${member.weight.toFixed(0)} \n Relevant role: ${realPlayerRank.name}`, inline: true})
                member.user.roles.add(realPlayerRank)
            }

            switch (realPlayerRank.name) {
                case this.bonzoRole.name:
                    if (userRoles.some(roles => roles === this.lividRole.id || roles === this.necronRole.id || roles === this.eliteRole.id)) {
                        anyoneChanged = true
                        returnFields.push({ name: member.username, value: `Weight: ${member.weight.toFixed(0)} \n Relevant role: ${realPlayerRank.name}`, inline: true})
                        member.user.roles.add(realPlayerRank)
                        member.user.roles.remove(this.lividRole)
                        member.user.roles.remove(this.necronRole)
                        member.user.roles.remove(this.eliteRole)
                    }
                    break
                case this.lividRole.name:
                    if (userRoles.some(roles => roles === this.necronRole.id || roles === this.eliteRole.id)) {
                        anyoneChanged = true
                        returnFields.push({ name: member.username, value: `Weight: ${member.weight.toFixed(0)} \n Relevant role: ${realPlayerRank.name}`, inline: true})
                        member.user.roles.remove(this.necronRole)
                        member.user.roles.remove(this.eliteRole)
                    }
                    break
                case this.necronRole.name:
                    if (userRoles.some(roles => roles === this.eliteRole.id)) {
                        anyoneChanged = true
                        returnFields.push({ name: member.username, value: `Weight: ${member.weight.toFixed(0)} \n Relevant role: ${realPlayerRank.name}`, inline: true})
                        member.user.roles.remove(this.eliteRole)
                    }
                    break
            }
        }
        returnEmbed.addFields(returnFields)
        interaction.editReply({
            embeds: [returnEmbed]
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
