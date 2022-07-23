const { SlashCommandBuilder } = require('@discordjs/builders');
const InteractionHandler = require('../handlers/InteractionHandler')
export{ InteractionHandler }

class createButton {
    private interactionHandler: typeof InteractionHandler;
    constructor(interactionHandler) {
        this.interactionHandler = interactionHandler
    }

    data = new SlashCommandBuilder()
        .setName('createbutton')
        .setDescription('Create a button for some interaction')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('What type of button do you need?')
                .setRequired(true)
                .addChoices(
                    { name: 'Role request', value: 'rolerequestbutton' }
                ))
        .addStringOption(option =>
            option.setName('text_1')
                .setDescription('Button text')
                .setRequired(true)
                .setMaxLength(20)
        )
        .addStringOption(option =>
            option.setName('text_2')
                .setDescription('Text over the button')
                .setRequired(true)
        )
}

module.exports = createButton
