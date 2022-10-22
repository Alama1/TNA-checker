const { SlashCommandBuilder } = require('@discordjs/builders');
const InteractionHandler = require('../handlers/InteractionHandler')
export{ InteractionHandler }

class createButton {
    private interactionHandler: typeof InteractionHandler;
    constructor(interactionHandler) {
        this.interactionHandler = interactionHandler
    }

    data = new SlashCommandBuilder()
        .setName('meet')
        .setDescription('Shows if you meed current guild requirements')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('What\'s your IGN?')
                .setRequired(true)
        )
}

module.exports = createButton
