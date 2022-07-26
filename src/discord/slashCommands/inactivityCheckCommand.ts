const { EmbedBuilder } = require('discord.js')
const interactionHandler = require('../handlers/InteractionHandler')
const minecraftManager = require('../../minecraft/minecraftManager')
export {}

class inactivityCheckCommand {
    private discord: typeof interactionHandler;
    private name: string;
    private minecraftManager: typeof minecraftManager;

    constructor(discord) {
        this.discord = discord
        this.name = 'inactivitycheck'
        this.minecraftManager = this.discord.app.minecraft
    }

    async onCommand(interaction) {
        const guild = await this.minecraftManager.getGuild()
        const guildMembers = guild.guild.members

        const startedEmbed = new EmbedBuilder()
            .setTitle('Beep')
            .setDescription('Boop')
            .setColor('#FFFF00')

        await interaction.editReply({
            ephemeral: false,
            embeds: [startedEmbed]
        })

        let nickAndExpMembers = []
        let membersCount = 0
        for (const member of guildMembers) {
            await this.timeout(100)
            if (member.rank === 'Guild Master' || member.rank === 'STAFF') continue
            membersCount++
            const membersProgress = new EmbedBuilder()
            if (membersCount % 5 === 0) {
                membersProgress
                    .setColor('#FFFF00')
                    .setAuthor({ name: `Loading members. ${membersCount}/${guildMembers.length}` })
                interaction.editReply({
                    ephemeral: false,
                    embeds: [membersProgress]
                })
            }
            const username = await fetch(`https://api.mojang.com/user/profile/${member.uuid}`)
                .then(async r => await r.json())
                .catch(e => console.log(e))
            if (!username.hasOwnProperty('name')) continue
            if (username.hasOwnProperty('error')) continue
            nickAndExpMembers.push({
                name: username.name,
                expHistory: member.expHistory,
                daysInactive: 0
            })
        }
        const loadingMembersDone = new EmbedBuilder()
        loadingMembersDone
            .setColor('#FFFF00')
            .setAuthor({ name: `Loading members done.` })
        interaction.editReply({
            ephemeral: false,
            embeds: [loadingMembersDone]
        })

        for (let i = 0; i < nickAndExpMembers.length; i++) {
            for (let j = 0; j < 7; j++) {
                if (nickAndExpMembers[i].expHistory[Object.keys(nickAndExpMembers[i].expHistory)[j]] === 0) {
                    nickAndExpMembers[i].daysInactive++
                }
                else {
                    break
                }
            }
        }
        nickAndExpMembers.sort((a, b) => b.daysInactive - a.daysInactive )

        let finalFields = []
        const finalEmbed = new EmbedBuilder()
        finalEmbed
            .setColor('#0099ff')
            .setTitle('Members check done!')
            .setAuthor({ name: 'TNA', iconURL: 'https://i.imgur.com/bdNxeHt.jpeg' })
            .setThumbnail('https://i.imgur.com/bdNxeHt.jpeg')
            .setTimestamp()

        nickAndExpMembers.forEach((member, index) => {
            if (index > 15) return
            finalFields.push({ name: member.name, value: `Days inactive: ${member.daysInactive}`})
        })
        finalEmbed.addFields(finalFields)

        interaction.editReply({
            ephemeral: false,
            embeds: [finalEmbed]
        })
    }
    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}


module.exports = inactivityCheckCommand
