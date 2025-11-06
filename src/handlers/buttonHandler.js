// handlers/buttonHandler.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

const { acceptApplication, denyApplication } = require('../helpers/applicationActions');

module.exports = async (interaction) => {
    const [action, userId, applicationType] = interaction.customId.split('-');
    const serverId = interaction.guild.id;

    switch (action) {
        case 'accept':
            // Defer the interaction to prevent timeout
            await interaction.deferReply({ ephemeral: true });
            await acceptApplication(interaction, userId, "No specific reason provided", serverId, applicationType);
            break;
        case 'deny':
            // Defer the interaction to prevent timeout
            await interaction.deferReply({ ephemeral: true });
            await denyApplication(interaction, userId, "No specific reason provided", serverId, applicationType);
            break;
        case 'accept_reason': {
            const modal = new ModalBuilder()
                .setCustomId(`accept_reason_modal-${userId}-${applicationType}`)
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
                .setCustomId(`deny_reason_modal-${userId}-${applicationType}`)
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