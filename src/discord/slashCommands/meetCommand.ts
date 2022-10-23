const fs = require('fs')
const path = require('path')

const {EmbedBuilder} = require('discord.js')
const Discord = require('../DiscordManager')
export {}

class createButtonCommand {
    private discord: typeof Discord;
    private name: string;

    constructor(discord) {
        this.discord = discord
        this.name = 'meet'
    }

    async onCommand(interaction) {
        await interaction.deferReply()
        let username = interaction.options._hoistedOptions[0].value
        const senitherProfile = await this.discord.interactionHandler.minecraftManager.getSenitherProfile(username)

        if (!senitherProfile) {
            interaction.editReply({content: 'Something went wrong, pls check username that you provided.'})
            return
        }

        if (!senitherProfile.data) {
            interaction.editReply({content: 'Something went wrong, pls check username that you provided.'})
            return
        }

        const uuid = await this.discord.interactionHandler.minecraftManager.getMinecraftUUID(username)
        const hypixelProfiles = await this.discord.interactionHandler.minecraftManager.getHypixelProfile(senitherProfile.data.id)
        const hypixelProfile = hypixelProfiles.profile.members[uuid.id]



        const slayerBosses = hypixelProfile.slayer_bosses

        let dungeonExp = hypixelProfile.dungeons.dungeon_types.catacombs.experience
        const cataLevels = this.discord.cataLevelExp.levels

        let cataLevel = 0
        let total = 0;
        let counter = 1;
        for (let [key, value] of Object.entries(cataLevels)) {
            total += +value;
            counter += 1;
            if (dungeonExp < total) {
                counter -= 1;
                let level = Object.keys(cataLevels).indexOf(counter.toString());
                if (level > cataLevel) {
                    cataLevel = level;
                }
            }

        }
        dungeonExp = cataLevel

        const slayersExp = slayerBosses.zombie.xp + slayerBosses.wolf.xp + slayerBosses.spider.xp + slayerBosses.enderman.xp + slayerBosses.blaze.xp
        const weight = senitherProfile.data.weight + senitherProfile.data.weight_overflow
        const skillAvg = senitherProfile.data.skills.average_skills.toFixed(0)
        let hasPassed = false


        let replyEmbed = new EmbedBuilder()
            .setTitle(username)
        let changedProperties = []

        replyEmbed
            .addFields(changedProperties)
            .setDescription(`Weight: ${weight.toFixed(0)}`)

        const bonzoReq = this.discord.app.config.properties.minecraft.bonzo
        const lividReq = this.discord.app.config.properties.minecraft.livid
        const necronReq = this.discord.app.config.properties.minecraft.necron
        const eliteReq = this.discord.app.config.properties.minecraft.elite
        let rolesMet = ''
        if (weight > bonzoReq) {
            hasPassed = true
        }

        if (weight > bonzoReq) {
            rolesMet += 'Bonzo: :white_check_mark:\n'
        } else {
            rolesMet += 'Bonzo: :o:\n'
        }
        if (weight > lividReq) {
            rolesMet += 'Livid: :white_check_mark:\n'
        } else {
            rolesMet += 'Livid: :o:\n'
        }
        if (weight > necronReq) {
            rolesMet += 'Necron: :white_check_mark:\n'
        } else {
            rolesMet += 'Necron: :o:\n'
        }
        if (weight > eliteReq) {
            rolesMet += 'Elite: :white_check_mark:\n'
        } else {
            rolesMet += 'Elite: :o:\n'
        }
        changedProperties.push({name: 'Requirements', value: rolesMet})


        let bypasses = ''
        if (skillAvg > 50) {
            bypasses += `Skill avg (${skillAvg}/50): :white_check_mark: \n`
            hasPassed = true
        } else {
            bypasses += `Skill avg (${skillAvg}/50): :o: \n`
        }
        if (cataLevel > 42) {
            bypasses += `Cata lvl (${cataLevel}/42): :white_check_mark: \n`
            hasPassed = true
        } else {
            bypasses += `Cata lvl (${cataLevel}/42): :o: \n`
        }

        if (slayersExp > 8000000) {
            bypasses += `Slayers exp (${this.numFormatter(slayersExp)}/8M): :white_check_mark: \n`
            hasPassed = true
        } else {
            bypasses += `Slayers exp (${this.numFormatter(slayersExp)}/8M): :o: \n`
        }

        changedProperties.push({name: 'Bypasses', value: bypasses})

        if (hasPassed) {
            replyEmbed.setColor('#0099ff')
        } else {
            replyEmbed.setColor('#cc1b1b')
        }
        console.log(hasPassed)

        interaction.editReply({embeds: [replyEmbed]})
    }
    numFormatter(num) {
        if(num > 999 && num < 1000000){
            return (num/1000).toFixed(1) + 'K'
        }else if(num > 1000000){
            return (num/1000000).toFixed(1) + 'M'
        }else if(num < 900){
            return num
        }
    }

}


module.exports = createButtonCommand
