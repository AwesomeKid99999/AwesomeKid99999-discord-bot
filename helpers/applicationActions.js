const {Guild, Application, Question, StaffRoles, Embed } = require("../models/");
const { PermissionsBitField, AttachmentBuilder } = require("discord.js");
const fs = require("fs");


async function acceptApplication(interaction, userId, reason = null, serverId, applicationType) {
    const reasonText = reason ? `**Reason:** ${reason}\n\n` : '**Reason:** None provided.\n\n';
    
    // Determine if this is a modal or button interaction
    const isModal = interaction.isModalSubmit();





    const guild = await Guild.findOne({ where: { serverId: serverId } });
    if (!guild) {
        console.log(`${interaction.guild.name} does not exist in the database`);
        return await interaction.reply({
            content: 'Please set up something in the database for this server.',
            ephemeral: true,
        });
    }
    const staffRoles = await StaffRoles.findAll({
        where: { serverId: interaction.guild.id },
    });
    const staffRoleIds = staffRoles.map((role) => role.roleId);

    // Permission check
    if (
        !interaction.member.roles.cache.some((role) => staffRoleIds.includes(role.id)) &&
        !interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)
    ) {
        return await interaction.editReply({
            content: 'Sorry, you do not have permission to run this command.',
        });
    }

    // Permission check
    if (
        !interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)
    ) {
        return await interaction.editReply({
            content: 'Sorry, you do not have permission to manage roles, so you cannot process applications.',
        });
    }

    try {
        // Find the application
        const application = await Application.findOne({
            where: { userId: userId, serverId, status: 'pending', applicationType: applicationType },
        });

        if (!application) {
            return interaction.editReply({
                content: `No pending ${applicationType} application found for this user.`,
            });
        }

        // Fetch the original message from the staff response channel
        if (!guild.applicationChannelId) {
            return interaction.editReply({
                content: 'Staff response channel not found. Please check the configuration.',
            });
        }
        const staffChannel = await interaction.guild.channels.fetch(guild.applicationChannelId);


        const confirmationMessageId = application.confirmationId;
        let staffMessage;
        if (confirmationMessageId) {
            try {
                staffMessage = await staffChannel.messages.fetch(confirmationMessageId);
            } catch {
                console.log('Original confirmation message not found.');
            }
        }

        const questions = await Question.findAll({ where: { serverId, QuestionType: applicationType }, order: [['questionNumber', 'ASC']] });

        // Format the responses
        const responses = application.response;
        let formattedResponses = '**Application Details:**\n';
        for (const question of questions) {
            const questionText = question.questionText;
            const answer = responses[`Question ${question.questionNumber}`] || 'No answer provided.';
            
            // Add indicators for embed and image
            let questionDisplay = questionText || 'Question with image or embed';
            if (question.QuestionEmbedId) {
                const embed = await Embed.findOne({ where: { id: question.QuestionEmbedId } });
                questionDisplay += ` [embed: ${embed.embedName}]`;
            }
            if (question.questionImage) {
                questionDisplay += ` [image: ${question.questionImage}]`;
            }
            
            formattedResponses += `\n**Question ${question.questionNumber}:** ${questionDisplay}\nAnswer: ${answer}\n`;
        }

        // Update the application's status to 'accepted'
        application.status = 'accepted';
        await application.save();

        const applicant = await interaction.guild.members.fetch(userId);

        const applicationChannel = interaction.guild.channels.cache.get(application.channelId);
        if (applicationChannel) {
            await applicationChannel.delete();
        }


        if (staffMessage) {
            // Edit the existing message
            await sendFormattedResponse(
                staffChannel,
                staffMessage,
                interaction.user.tag,
                formattedResponses,
                applicant.user.tag,
                reasonText,
                "accepted",
                applicationType
            );
        } else {
            // Send a new message
            console.log(`Original confirmation message not found for application ID ${application.id}. Sending a new message.`);
            await sendFormattedResponse(
                staffChannel,
                null, // No existing message to edit
                interaction.user.tag,
                formattedResponses,
                applicant.user.tag,
                reasonText,
                "accepted",
                applicationType
            );
        }

        if (applicant) {
            await applicant.send(
                `Your **${applicationType}** application in **${interaction.guild.name}** has been accepted.\n${reason ? `**Reason:** ${reason}.` : ''}\nWelcome to the team!`
            );
        }


        await interaction.editReply({
            content: `The **${applicationType}** application from **${applicant.user.tag}** has been accepted. ${reason ? `**Reason:** ${reason}` : ''}`,
        });
    } catch (error) {
        console.error(`Error accepting application from User ID ${userId} in Server ID ${serverId}:`, error);
       return  interaction.editReply({
            content: 'An error occurred while accepting the application. Please try again.',
        });
    }
}


async function denyApplication(interaction, userId, reason = null, serverId, applicationType) {
    const reasonText = reason ? `**Reason:** ${reason}\n\n` : '**Reason:** None provided.\n\n';

    const guild = await Guild.findOne({ where: { serverId: serverId } });
    if (!guild) {
        console.log(`${interaction.guild.name} does not exist in the database`);
        return await interaction.reply({
            content: 'Please set up something in the database for this server.',
            ephemeral: true,
        });
    }

    const staffRoles = await StaffRoles.findAll({
        where: { serverId: interaction.guild.id },
    });
    const staffRoleIds = staffRoles.map((role) => role.roleId);

    // Permission check
    if (
        !interaction.member.roles.cache.some((role) => staffRoleIds.includes(role.id)) &&
        !interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)
    ) {
        return await interaction.editReply({
            content: 'Sorry, you do not have permission to run this command.',
        });
    }

    // Permission check
    if (
        !interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)
    ) {
        return await interaction.editReply({
            content: 'Sorry, you do not have permission to manage roles, so you cannot process applications.',
        });
    }

    try {
        // Find the application
        const application = await Application.findOne({
            where: { userId: userId, serverId, status: 'pending', applicationType: applicationType },
        });

        if (!application) {
            return interaction.editReply({
                content: `No pending ${applicationType} application found for this user.`,
            });
        }

        if (!guild.applicationChannelId) {
            return interaction.editReply({
                content: 'Staff response channel not found. Please check the configuration.',
            });
        }
        // Fetch the original message from the staff response channel
        const staffChannel = await interaction.guild.channels.fetch(guild.applicationChannelId);


        const confirmationMessageId = application.confirmationId;
        let staffMessage;
        if (confirmationMessageId) {
            try {
                staffMessage = await staffChannel.messages.fetch(confirmationMessageId);
            } catch {
                console.log('Original confirmation message not found.');
            }
        }


        const questions = await Question.findAll({ where: { serverId, QuestionType: applicationType }, order: [['questionNumber', 'ASC']] });

        let formattedResponses = '**Application Details:**\n';
        const responses = application.response;
        for (const question of questions) {
            const questionText = question.questionText;
            const answer = responses[`Question ${question.questionNumber}`] || 'No answer provided.';
            
            // Add indicators for embed and image
            let questionDisplay = questionText || 'Question with image or embed';
            if (question.QuestionEmbedId) {
                const embed = await Embed.findOne({ where: { id: question.QuestionEmbedId } });
                questionDisplay += ` [embed: ${embed.embedName}]`;
            }
            if (question.questionImage) {
                questionDisplay += ` [image: ${question.questionImage}]`;
            }
            
            formattedResponses += `\n**Question ${question.questionNumber}:** ${questionDisplay}\nAnswer: ${answer}\n`;
        }
        // Update the application's status to 'denied'
        application.status = 'denied';
        await application.save();

        const applicant = await interaction.guild.members.fetch(userId);

        const applicationChannel = interaction.guild.channels.cache.get(application.channelId);
        if (applicationChannel) {

            await applicationChannel.delete();
        }



        if (staffMessage) {
            // Edit the existing message
            await sendFormattedResponse(
                staffChannel,
                staffMessage,
                interaction.user.tag,
                formattedResponses,
                applicant.user.tag,
                reasonText,
                "denied",
                applicationType
            );
        } else {
            // Send a new message
            console.log(`Original confirmation message not found for application ID ${application.id}. Sending a new message.`);
            await sendFormattedResponse(
                staffChannel,
                null, // No existing message to edit
                interaction.user.tag,
                formattedResponses,
                applicant.user.tag,
                reasonText,
                "denied",
                applicationType
            );
        }

        if (applicant) {
            await applicant.send(
                `Your **${applicationType}** application in **${interaction.guild.name}** has been denied.\n${reason ? `**Reason:** ${reason}.` : ''}\nDon't worry, there's always next time!`
            );
        }

        await interaction.editReply({
            content: `The **${applicationType}** application from **${applicant.user.tag}** has been denied. ${reason ? `**Reason:** ${reason}` : ''}`,
        });
    } catch (error) {
        console.error(`Error accepting application from User ID ${userId} in Server ID ${serverId}:`, error);
        return interaction.editReply({
            content: 'An error occurred while denying the application. Please try again.',
        });
    }
}

module.exports = {
    acceptApplication,
    denyApplication
};


async function sendFormattedResponse(staffChannel, staffMessage, staffTag, formattedResponses, applicantTag, reasonText, actionType, applicationType) {
    // Check if the message exceeds the 2000 character limit
    const fullMessage = `**Application of type ${applicationType} from ${applicantTag} has been ${actionType} by ${staffTag || "unknown"}**.\n${reasonText}${formattedResponses}`;
    if (fullMessage.length > 2000) {
        // Save the formattedResponses to a file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${applicantTag}-${applicationType}-${actionType}-${timestamp}.txt`;
        
        try {
            fs.writeFileSync(fileName, fullMessage);

            // Create an attachment and send the file
            const attachment = new AttachmentBuilder(fileName);
            if (staffMessage) {
                await staffMessage.edit({
                    content: `**Application of type ${applicationType} from ${applicantTag} has been ${actionType}.** See the attached file for details.`,
                    files: [attachment],
                    components: [],
                });
            } else {
                await staffChannel.send({
                    content: `**Application of type ${applicationType} from ${applicantTag} has been ${actionType}.** See the attached file for details.`,
                    files: [attachment],
                });
            }

            // Clean up the file after sending
            fs.unlinkSync(fileName);
        } catch (error) {
            console.error('Error handling large response:', error);
            // Fallback: send truncated message
            const truncatedMessage = fullMessage.substring(0, 1900) + '...\n\n*[Message truncated due to length]*';
            if (staffMessage) {
                await staffMessage.edit({
                    content: truncatedMessage,
                    components: [],
                });
            } else {
                await staffChannel.send({
                    content: truncatedMessage,
                });
            }
        }
    } else {
        // Send the content directly if it's under 2000 characters
        if (staffMessage) {
            await staffMessage.edit({
                content: fullMessage,
                components: [],
            });
        } else {
            await staffChannel.send({
                content: fullMessage,
            });
        }
    }
}