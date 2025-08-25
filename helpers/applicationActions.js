const {Guild, Application, Question, StaffRoles } = require("../models/");
const { PermissionsBitField, AttachmentBuilder } = require("discord.js");
const fs = require("fs");


async function acceptApplication(interaction, userId, reason = null, serverId) {
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
        return await interaction.reply({
            content: 'Sorry, you do not have permission to run this command.',
            ephemeral: true,
        });
    }

    // Permission check
    if (
        !interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)
    ) {
        return await interaction.reply({
            content: 'Sorry, you do not have permission to manage roles, so you cannot make the applicant a staff.',
            ephemeral: true,
        });
    }

    try {
        // Find the application
        const application = await Application.findOne({
            where: { userId: userId, serverId, status: 'pending' },
        });

        if (!application) {
            return interaction.reply({
                content: 'No pending application found for this user.',
                ephemeral: true,
            });
        }

        // Fetch the original message from the staff response channel
        if (!guild.applicationChannelId) {
            return interaction.reply({
                content: 'Staff response channel not found. Please check the configuration.',
                ephemeral: true,
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

        const questions = await Question.findAll({ where: { serverId }, order: [['questionNumber', 'ASC']] });

        // Format the responses
        const responses = application.response;
        let formattedResponses = '**Application Details:**\n';
        for (const question of questions) {
            const questionText = question.questionText;
            const answer = responses[`Question ${question.questionNumber}`] || 'No answer provided.';
            formattedResponses += `\n**Question ${question.questionNumber}:** ${questionText}\nAnswer: ${answer}\n`;
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
                "accepted"
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
                "accepted"
            );
        }

        if (applicant) {
            await applicant.send(
                `Your application in **${interaction.guild.name}** has been accepted.\n${reason ? `**Reason:** ${reason}.` : ''}\nWelcome to the team!`
            );
        }


        await interaction.reply({
            content: `The application from **${applicant.user.tag}** has been accepted. ${reason ? `**Reason:** ${reason}` : ''}`,
            ephemeral: true,
        });
    } catch (error) {
        console.error(`Error accepting application from User ID ${userId} in Server ID ${serverId}:`, error);
       return  interaction.reply({
            content: 'An error occurred while accepting the application. Please try again.',
            ephemeral: true,
        });
    }
}


async function denyApplication(interaction, userId, reason = null, serverId) {
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
        return await interaction.reply({
            content: 'Sorry, you do not have permission to run this command.',
            ephemeral: true,
        });
    }

    // Permission check
    if (
        !interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)
    ) {
        return await interaction.reply({
            content: 'Sorry, you do not have permission to manage roles, so you cannot make the applicant a staff.',
            ephemeral: true,
        });
    }

    try {
        // Find the application
        const application = await Application.findOne({
            where: { userId: userId, serverId, status: 'pending' },
        });

        if (!application) {
            return interaction.reply({
                content: 'No pending application found for this user.',
                ephemeral: true,
            });
        }

        if (!guild.applicationChannelId) {
            return interaction.reply({
                content: 'Staff response channel not found. Please check the configuration.',
                ephemeral: true,
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


        const questions = await Question.findAll({ where: { serverId }, order: [['questionNumber', 'ASC']] });

        let formattedResponses = '**Application Details:**\n';
        const responses = application.response;
        for (const question of questions) {
            const questionText = question.questionText;
            const answer = responses[`Question ${question.questionNumber}`] || 'No answer provided.';
            formattedResponses += `\n**Question ${question.questionNumber}:** ${questionText}\nAnswer: ${answer}\n`;
        }
        // Update the application's status to 'denied'
        application.status = 'denied';
        await application.save();

        const applicant = await interaction.guild.members.fetch(userId);

        const applicationChannel = interaction.guild.channels.cache.get(application.channelId);
        if (applicationChannel) {
            await applicationChannel.send(
                `${applicant.user}, your application has been **denied**.\n\n${reasonText}`
            );
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
                "denied"
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
                "denied"
            );
        }

        if (applicant) {
            await applicant.send(
                `Your application in **${interaction.guild.name}** has been denied.\n${reason ? `**Reason:** ${reason}.` : ''}\nDon't worry, there's always next time!`
            );
        }

        await interaction.reply({
            content: `The application from **${applicant.user.tag}** has been denied. ${reason ? `**Reason:** ${reason}` : ''}`,
            ephemeral: true,
        });
    } catch (error) {
        console.error(`Error accepting application from User ID ${userId} in Server ID ${serverId}:`, error);
        return interaction.reply({
            content: 'An error occurred while denying the application. Please try again.',
            ephemeral: true,
        });
    }
}

module.exports = {
    acceptApplication,
    denyApplication
};


async function sendFormattedResponse(staffChannel, staffMessage, staffTag, formattedResponses, applicantTag, reasonText, actionType) {
    // Check if the message exceeds the 2000 character limit
    const fullMessage = `**Application from ${applicantTag} has been ${actionType} by ${staffTag || "unknown"}**.\n${reasonText}${formattedResponses}`;
    if (fullMessage.length > 2000) {
        // Save the formattedResponses to a file
        const fileName = `${applicantTag}-${actionType}.txt`;
        fs.writeFileSync(fileName, fullMessage);

        // Create an attachment and send the file
        const attachment = new AttachmentBuilder(fileName);
        if (staffMessage) {
            await staffMessage.edit({
                content: `**Application from ${applicantTag} has been ${actionType}.** See the attached file for details.`,
                files: [attachment],
                components: [],
            });
        } else {
            await staffChannel.send({
                content: `**Application from ${applicantTag} has been ${actionType}.** See the attached file for details.`,
                files: [attachment],
            });
        }

        // Clean up the file after sending
        fs.unlinkSync(fileName);
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