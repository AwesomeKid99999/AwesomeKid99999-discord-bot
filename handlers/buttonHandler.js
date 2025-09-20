// handlers/buttonHandler.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

const { acceptApplication, denyApplication } = require('../helpers/applicationActions');

module.exports = async (interaction) => {
    const [action, userId] = interaction.customId.split('-');
    const serverId = interaction.guild.id;

    switch (action) {
        case 'accept':
            await acceptApplication(interaction, userId, "No specific reason provided", serverId);
            break;
        case 'deny':
            await denyApplication(interaction, userId, "No specific reason provided", serverId);
            break;
        case 'accept_reason': {
            const modal = new ModalBuilder()
                .setCustomId(`accept_reason_modal-${userId}`)
                .setTitle('Accept Application with Reason');

            const reasonInput = new TextInputBuilder()
                .setCustomId('reason')
                .setLabel('Enter the reason for accepting:')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const actionRow = new ActionRowBuilder()
                .addComponents(reasonInput
                    .setMaxLength(1000));
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
            break;
        }

        case 'deny_reason': {
            const modal = new ModalBuilder()
                .setCustomId(`deny_reason_modal-${userId}`)
                .setTitle('Deny Application with Reason');

            const reasonInput = new TextInputBuilder()
                .setCustomId('reason')
                .setLabel('Enter the reason for denying:')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const actionRow = new ActionRowBuilder()
                .addComponents(reasonInput
                    .setMaxLength(1000));
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
            break;
        }
        case 'generated_button':
            const whoGenerated = await interaction.guild.members.fetch(userId);

            await interaction.reply({
                content: `This is a generated button by **${whoGenerated.user.tag}**.`,
                ephemeral: true,
            })
            break;
        default:
           console.log('Button not for application')
            break;
    }
};