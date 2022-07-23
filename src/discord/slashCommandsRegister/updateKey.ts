const { SlashCommandBuilder } = require('@discordjs/builders');
const InteractionHandler = require('../handlers/InteractionHandler')
export{ InteractionHandler }

class updateKey {
    private interactionHandler: typeof InteractionHandler;
    constructor(interactionHandler) {
        this.interactionHandler = interactionHandler
    }

    data = new SlashCommandBuilder()
        .setName('updatekey')
        .setDescription('Makes you a furry.')
}

module.exports = updateKey
