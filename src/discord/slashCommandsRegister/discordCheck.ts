const { SlashCommandBuilder } = require('@discordjs/builders');
const InteractionHandler = require('../handlers/InteractionHandler')
export{ InteractionHandler }

class discordCheck {
    private interactionHandler: typeof InteractionHandler;
    constructor(interactionHandler) {
        this.interactionHandler = interactionHandler
    }

    data = new SlashCommandBuilder()
        .setName('discordcheck')
        .setDescription('Check all discord users if they have relevant weight roles')
        .addBooleanOption(option =>
            option.setName('remove')
                .setDescription('Do you wand me to remove weight roles from members that left?')
                .setRequired(true)
        )
}

module.exports = discordCheck
