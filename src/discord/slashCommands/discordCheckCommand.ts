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
        this.bonzoRole = await interaction.guild.roles.fetch(this.discord.app.config.properties.discord.bonzoRole)
        this.lividRole = await interaction.guild.roles.fetch(this.discord.app.config.properties.discord.lividRole)
        this.necronRole = await interaction.guild.roles.fetch(this.discord.app.config.properties.discord.necronRole)
        this.eliteRole = await interaction.guild.roles.fetch(this.discord.app.config.properties.discord.eliteRole)

        this.shouldRemoveRoles = interaction.options._hoistedOptions[0].value
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
            let user = map[1]
            const nick = user.nickname ? user.nickname : user.user.username
            setTimeout(async () => {
                if (index % 5 === 0) {
                    const progressEmbed = new EmbedBuilder()
                        .setColor('#FFFF00')
                        .setAuthor({name: `Loading members. ${index}/${allUsersWithWeightRoles.size}`})
                    interaction.editReply({
                        embeds: [progressEmbed]
                    })
                }
                const senitherProfile = await this.minecraftManager.getSenitherProfile(nick)
                if (senitherProfile.status === 200) {
                    discordUsersInfo.push({
                        username: nick,
                        user: user,
                        weight: senitherProfile.data.weight + senitherProfile.data.weight_overflow
                    })
                }
                if (index + 1 === allUsersWithWeightRoles.size) {
                    const progressEmbed = new EmbedBuilder()
                        .setColor('#FFFF00')
                        .setAuthor({name: `Done! Fixing player ranks...`})
                    interaction.editReply({
                        embeds: [progressEmbed]
                    })
                    this.processAllMembers(discordUsersInfo, interaction, allUsersWithWeightRoles)
                }
            }, index * 1000)
        })
    }

    async processAllMembers(members, interaction, allUsersWithWeightRoles) {
        let anyoneChanged = false

        const rolesChangedEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Members check done!')
            .setAuthor({name: 'TNA', iconURL: 'https://i.imgur.com/bdNxeHt.jpeg'})
            .setDescription('Here\'s all users that got changed')
            .setThumbnail('https://i.imgur.com/bdNxeHt.jpeg')

        const rolesRemovedEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('And also')
            .setAuthor({name: 'TNA', iconURL: 'https://i.imgur.com/bdNxeHt.jpeg'})
            .setDescription('Here\'s all users that got their roles removed because they are not in the guild anymore')
            .setTimestamp()
        let rolesChangedFields = []
        let rolesRemovedFields = []

        for (const member of members) {
            const userRoles = member.user._roles
            let realPlayerRank = this.getPlayerRank(member.weight)
            if (!member.user._roles.some(roles => roles === realPlayerRank.id)) {
                anyoneChanged = true
                rolesChangedFields.push({
                    name: member.username,
                    value: `Weight: ${member.weight.toFixed(0)} \n Relevant role: ${realPlayerRank.name}`,
                    inline: true
                })
                member.user.roles.add(realPlayerRank)
            }

            switch (realPlayerRank.name) {
                case this.bonzoRole.name:
                    if (userRoles.some(roles => roles === this.lividRole.id || roles === this.necronRole.id || roles === this.eliteRole.id)) {
                        anyoneChanged = true
                        rolesChangedFields.push({
                            name: member.username,
                            value: `Weight: ${member.weight.toFixed(0)} \n Relevant role: ${realPlayerRank.name}`,
                            inline: true
                        })
                        member.user.roles.add(realPlayerRank)
                        member.user.roles.remove(this.lividRole)
                        member.user.roles.remove(this.necronRole)
                        member.user.roles.remove(this.eliteRole)
                    }
                    break
                case this.lividRole.name:
                    if (userRoles.some(roles => roles === this.necronRole.id || roles === this.eliteRole.id)) {
                        anyoneChanged = true
                        rolesChangedFields.push({
                            name: member.username,
                            value: `Weight: ${member.weight.toFixed(0)} \n Relevant role: ${realPlayerRank.name}`,
                            inline: true
                        })
                        member.user.roles.remove(this.necronRole)
                        member.user.roles.remove(this.eliteRole)
                    }
                    break
                case this.necronRole.name:
                    if (userRoles.some(roles => roles === this.eliteRole.id)) {
                        anyoneChanged = true
                        rolesChangedFields.push({
                            name: member.username,
                            value: `Weight: ${member.weight.toFixed(0)} \n Relevant role: ${realPlayerRank.name}`,
                            inline: true
                        })
                        member.user.roles.remove(this.eliteRole)
                    }
                    break
            }
        }
        const guild = await this.minecraftManager.getGuild()
        const guildMembers = guild.guild.members
        const guildNicknames = []
        for (const member of guildMembers) {
            const nick = await this.minecraftManager.getMinecraftNameByUUID(member.uuid)
            if (!nick) continue
            guildNicknames.push(nick)
        }
        const guildNicknamesInLowerCase = guildNicknames.map(name => name.toLowerCase())
        let removedMembersCount = 0
        for (let member of members) {
            const ingameDiscordUsername = member.username

            if (!guildNicknamesInLowerCase.includes(ingameDiscordUsername.toLowerCase()) && this.shouldRemoveRoles) {
                if (removedMembersCount < 25) {
                    rolesRemovedFields.push({
                        name: ingameDiscordUsername,
                        value: `All weight roles removed.`,
                        inline: true
                    })
                }
                member.user.roles.remove(this.bonzoRole)
                member.user.roles.remove(this.lividRole)
                member.user.roles.remove(this.necronRole)
                member.user.roles.remove(this.eliteRole)
            }
            removedMembersCount++
        }
        const embedsToReturn = [rolesChangedEmbed]
        if (this.shouldRemoveRoles) embedsToReturn.push(rolesRemovedEmbed)


        rolesChangedEmbed.addFields(rolesChangedFields)
        rolesRemovedEmbed.addFields(rolesRemovedFields)
        interaction.editReply({
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
