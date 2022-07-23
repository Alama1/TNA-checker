const { SlashCommandBuilder } = require('@discordjs/builders');
const InteractionHandler = require('../handlers/InteractionHandler')
export{ InteractionHandler }

class guildCheck {
    private interactionHandler: typeof InteractionHandler;
    constructor(interactionHandler) {
        this.interactionHandler = interactionHandler
    }

    data = new SlashCommandBuilder()
        .setName('guildcheck')
        .setDescription('Check all ingame users if they have relevant weight roles')
}

module.exports = guildCheck
