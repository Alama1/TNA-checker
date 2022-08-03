const interactionHandler = require('../handlers/InteractionHandler')
const minecraftManager = require('../../minecraft/minecraftManager')
const fetch = require('node-fetch')
const {EmbedBuilder} = require('discord.js')
export {}

class DiscordCheck {
    private discord: typeof interactionHandler;
    private name: string;
    private minecraftManager: typeof minecraftManager;
    private bridgeBotChannel: any;

    constructor(discord) {
        this.discord = discord
        this.name = 'guildcheck'
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
        this.bridgeBotChannel = this.discord.app.config.properties.minecraft.bridge_bot_channel

        const guild = await this.minecraftManager.getGuild()
        const guildMembers = guild.guild.members
        let uuidAndRank = []

        const startedEmbed = new EmbedBuilder()
            .setTitle('Beep')
            .setDescription('Boop')
            .setColor('#FFFF00')

        await interaction.reply({
            embeds: [startedEmbed]
        })

        guildMembers.forEach((member, index) => {
            setTimeout(async () => {
                if (index % 5 === 0) {
                    const progressEmbed = new EmbedBuilder()
                        .setColor('#FFFF00')
                        .setAuthor({ name: `Loading members. ${index}/${guildMembers.length}` })
                    interaction.editReply({
                        embeds: [progressEmbed]
                    })
                }
                if (member.rank.toLowerCase() === 'guild master' || member.rank === 'STAFF') return
                const senitherProfile = await this.minecraftManager.getSenitherProfileWithUUID(member.uuid)
                if (senitherProfile.status !== 200) return
                uuidAndRank.push({uuid: member.uuid, rank: member.rank, weight: senitherProfile.data.weight + senitherProfile.data.weight_overflow })
                if (index + 1 === guildMembers.length) {
                    const progressEmbed = new EmbedBuilder()
                        .setColor('#FFFF00')
                        .setAuthor({ name: `Done! Fixing player ranks...` })
                    interaction.editReply({
                        embeds: [progressEmbed]
                    })
                    this.processMembers(uuidAndRank, interaction)
                }
            }, index * 1000)
        })
    }


    async processMembers(membersList, interaction) {
        let membersToChange = []
        let returnFields = []
        const bridgeBotChannel = await this.discord.client.channels.fetch(this.bridgeBotChannel)
        for (const member of membersList) {
            const realRank = this.getPlayerRank(member.weight)
            if (realRank.name.toLowerCase() === member.rank.toLowerCase()) continue;
            member.realRank = realRank.name
            membersToChange.push(member)
        }
        for (const member of membersToChange) {
            const username = await this.minecraftManager.getMinecraftNameByUUID(member.uuid)
            returnFields.push({ name: username, value: `Changed to ${member.realRank} \n Weight: ${member.weight.toFixed(0)}`, inline: true})
            bridgeBotChannel.send(`/setrank ${username} ${member.realRank}`)
        }
        const returnEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Members check done!')
            .setAuthor({ name: 'TNA', iconURL: 'https://i.imgur.com/bdNxeHt.jpeg' })
            .setDescription('Here\'s all users that got changed')
            .setThumbnail('https://i.imgur.com/bdNxeHt.jpeg')
            .setTimestamp()
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
