const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const interactionHandler = require('../handlers/InteractionHandler')
export {}

class createButtonCommand {
    private discord: typeof interactionHandler;
    private name: string;
    constructor(discord) {
        this.discord = discord
        this.name = 'createbutton'
    }

    onCommand(interaction) {
        let text1
        let text2
        let type
        interaction.options._hoistedOptions.forEach(option => {
            switch (option.name) {
                case 'text_1':
                    text1 = option.value
                    break
                case 'text_2':
                    text2 = option.value
                    break
                case 'type':
                    type = option.value
                    break
            }
        })

        if (type === 'rolerequestbutton') {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('roleRequestButton')
                        .setLabel(text1)
                        .setStyle(ButtonStyle.Primary),
                );
            interaction.channel.send({ content: text2, components: [row] })
            interaction.editReply({ content: `Done!`, ephemeral: true })
        }
    }
}


module.exports = createButtonCommand
