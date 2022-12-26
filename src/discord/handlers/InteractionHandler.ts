const fs = require('fs')
const path = require('path')
import {EmbedBuilder} from "discord.js";

const { Collection, InteractionType } = require('discord.js')
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const minecraftManager = require('../../minecraft/minecraftManager')

class InteractionHandler {
    private discord: any;
    private readonly slashCommandsRegister: any[];
    private slashCommands: typeof Collection;
    private minecraftManager: typeof minecraftManager;
    constructor(discord) {
        this.discord = discord
        this.slashCommandsRegister = []
        this.minecraftManager = this.discord.app.minecraft
        let slashCommandRegisterFiles = fs.readdirSync(path.resolve(__dirname, '../slashCommandsRegister'))
        for (const file of slashCommandRegisterFiles) {
            const command = new (require(path.resolve(__dirname, '../slashCommandsRegister', file)))(this);
            this.slashCommandsRegister.push(command.data)
        }

        this.slashCommands = new Collection()
        let slashCommandFiles = fs.readdirSync(path.resolve(__dirname, '../slashCommands'))
        for (const file of slashCommandFiles) {
            const command = new (require(path.resolve(__dirname, '../slashCommands', file)))(this.discord);
            this.slashCommands.set(command.name, command)
        }

        const rest = new REST({ version: '9' }).setToken(this.discord.app.config.properties.discord.token);

        (async () => {
            try {
                console.log('Started refreshing application (/) commands.');
                await rest.put(
                    Routes.applicationGuildCommands(this.discord.client.user.id, this.discord.app.config.properties.discord.guildID),
                    { body: this.slashCommandsRegister },
                );

                console.log('Successfully reloaded application (/) commands.');
            } catch (error) {
                console.error(error);
            }
        })();
    }

    async onInteraction(interaction) {

        switch (interaction.type) {
            case InteractionType.ApplicationCommand:
                if(interaction.commandName === 'config') {
                    break
                }
                await interaction.deferReply()
                break
            case InteractionType.ModalSubmit:
                break
            case InteractionType.MessageComponent: //Button pressed
                await interaction.deferReply({
                    ephemeral: true
                })
                let api = await this.isApiAvailable(interaction)
                if (!api) return
                this.discord.buttonHandler.handle(interaction)
                return
            default:
                return
        }

        if (!this.canInteract(interaction)) {
            const cannotInteractEmbed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle(`Permission denied!`)
                .setDescription('Only staff members can use that!')
            interaction.editReply({
                embeds: [cannotInteractEmbed],
                ephemeral: true
            })
            return
        }

        if (interaction.customId !== 'configmodal' && interaction.commandName !== 'updatekey' && interaction.commandName !== 'config') {
            let api = await this.isApiAvailable(interaction)
            if (!api) return
        }

        if (interaction.customId) { //For interactions that have customID
            const command = this.slashCommands.get(interaction.customId) ||
                this.slashCommands.find(cmd => cmd.aliases && cmd.aliases.includes(interaction.customId))
            if (!command) return
            command.onCommand(interaction)
            return
        }
        const command = this.slashCommands.get(interaction.commandName)
        if (!command) return
        command.onCommand(interaction)
    }

    canInteract(interaction) {
        return (this.isCommander(interaction) || this.isOwner(interaction) || this.allowedCommands(interaction))
    }

    isCommander(interaction) {
        return interaction.member._roles.some(role => role === this.discord.app.config.properties.discord.commandRole)
            || interaction.member._roles.some(role => role === this.discord.app.config.properties.discord.discordStaff)
    }

    isOwner(interaction) {
        return interaction.member.id === this.discord.app.config.properties.discord.ownerId
    }

    allowedCommands(interaction) {
        return interaction.commandName === 'meet'
    }
    delay = ms => new Promise(resolve => setTimeout(resolve, ms))

    async isApiAvailable(interaction) {
        const apiStatus = (await this.minecraftManager.checkApiKeyAvailability()).status

        if(apiStatus === 200) {
            return true
        }

        if (apiStatus === 403) {
            let success = false
            try {
                await fetch(this.discord.app.config.properties.discord.apiNewURL)
                    .then(async r => {
                        const res = await r.json()
                        if (res.success) {
                            success = true
                        }
                    })
            } catch (e) {
                let apiUnavailable = new EmbedBuilder()
                    .setTitle('API error')
                    .setDescription('Api key is not available right now.')
                    .setColor('#F04947')
                await interaction.editReply({
                    embeds: [apiUnavailable],
                    ephemeral: true
                })
            }
            await this.delay(2000)
            return success
        }
        if (apiStatus === 429) {
            let apiUnavailable = new EmbedBuilder()
                .setTitle('API error')
                .setDescription('Api key reached requests limit, wait a minute and try again.')
                .setColor('#F04947')
            await interaction.editReply({
                embeds: [apiUnavailable],
                ephemeral: true
            })
            return false
        }
    }
}
module.exports = InteractionHandler
