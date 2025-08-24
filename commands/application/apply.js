const { SlashCommandBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const {Question, Application, Guild, StaffRoles} = require('../../models')
const fs = require('fs'); // Required to work with file system

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply')
        .setDMPermission(false)
        .setDescription('Start your application process.'),
    async execute(interaction) {
        const serverId = interaction.guild.id;
        const user = interaction.user;
        const categoryName = 'Applications'; // Name of the category where channels will be created
        const guild = await Guild.findOne({where: {serverId: await interaction.guild.id}});

        if (!guild) {
            console.log(`${interaction.guild.name} does not exist in the database`);
            return await interaction.reply(`Please contact staff to set up something in the database for this server.`);
        }

        if (!guild.applicationToggle) {
            return await interaction.reply(`Sorry, staff applications are closed at this time.`);
        }

        if (!guild.applicationChannelId) {
            return await interaction.reply(`Please contact staff to set up an application review channel.`);
        }

        const staffChannel = await interaction.guild.channels.fetch(`${guild.applicationChannelId}`);


        const staffRoles = await StaffRoles.findAll({
            where: { serverId: interaction.guild.id },
        });

        if (!staffRoles.length) {
            console.log(`${interaction.guild.name} does not have a staff role set`);
            return await interaction.reply(`Error: I am unsure of the staff role. Please contact staff for help.`);
        }


// Dynamically add permission overwrites for all staff roles
        const staffRoleOverwrites = staffRoles.map((staffRole) => ({
            id: staffRole.roleId, // Ensure `roleId` is the correct column in your StaffRoles model
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
            ], // Allow each staff role to view the channel
        }));

// Add permission overwrites for staff roles, user, and @everyone
        const permissionOverwrites = [
            {
                id: interaction.guild.roles.everyone.id,
                deny: [PermissionsBitField.Flags.ViewChannel], // Deny access to everyone
            },
            {
                id: user.id,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ReadMessageHistory,
                ], // Allow the user to view and send messages
            },
            ...staffRoleOverwrites, // Spread staff role overwrites
        ];

        // Check if the user already has an application channel
        const existingChannel = interaction.guild.channels.cache.find(
            (channel) => channel.name === `application-${user.username.toLowerCase()}` && channel.type === 0 // 0 = GuildText
        );

        if (existingChannel) {
            return interaction.reply({
                content: 'You already have an open application channel! Please complete it before starting another one.',
                ephemeral: true,
            });
        }

        const existingApplication = await Application.findOne({
            where: { userId: user.id, serverId: serverId, status: 'pending' },
        });

        if (existingApplication) {
            return interaction.reply({
                content: `You already have an active application. Please wait for it to be reviewed.`,
                ephemeral: true,
            });
        }

        // Find or create the application category
        let category = interaction.guild.channels.cache.find(
            (channel) => channel.name.toLowerCase() === categoryName.toLowerCase() && channel.type === 4 // 4 = GuildCategory
        );

        if (!category) {
            category = await interaction.guild.channels.create({
                name: categoryName,
                type: 4, // Category
            });
        }

        // Create a private application channel for the user
        const applicationChannel = await interaction.guild.channels.create({
            name: `application-${user.username.toLowerCase()}`,
            type: 0, // Text channel
            parent: category.id,
            permissionOverwrites,
        });

        // Notify the user
        await interaction.reply({
            content: `Your application channel has been created: ${applicationChannel}`,
            ephemeral: true,
        });

        // Fetch the application questions
        const questions = await Question.findAll({ where: { serverId }, order: [['questionNumber', 'ASC']] });

        if (questions.length === 0) {
            await applicationChannel.send('This server has no application questions set up. Please contact staff.');
            return;
        }

        // Start the application process
        try {
            const responses = {};
            await applicationChannel.send(`${user}, welcome to your application! Please answer the following questions one by one.`);

            for (const question of questions) {
                // Ask the question
                await applicationChannel.send(`**Question ${question.questionNumber}:** ${question.questionText}`);

                // Wait for the user's response
                const filter = (response) => response.author.id === user.id;
                const collected = await applicationChannel.awaitMessages({ filter, max: 1, time: 900000, errors: ['time'] });

                const answer = collected.first().content;
                responses[`Question ${question.questionNumber}`] = answer;
            }

            try {
                let applicationContent = `**New Application from ${user.tag}**\n\n`;
                for (const question of questions) {
                    const questionText = question.questionText;
                    const answer = responses[`Question ${question.questionNumber}`];
                    applicationContent += `\n**Question ${question.questionNumber}:** ${questionText}\nAnswer: ${answer}\n`;
                }



                // Send the message with buttons
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`accept-${user.id}`)
                        .setLabel('Accept')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`accept_reason-${user.id}`)
                        .setLabel('Accept with Reason')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`deny-${user.id}`)
                        .setLabel('Deny')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId(`deny_reason-${user.id}`)
                        .setLabel('Deny with Reason')
                        .setStyle(ButtonStyle.Danger)
                );


                // Check if the total length of the application content exceeds 2000 characters
                if (applicationContent.length > 2000) {
                    // Create a text file containing the application content
                    const fileName = `application-${user.username.toLowerCase()}.txt`;

                    // Write the content to the file
                    fs.writeFileSync(fileName, applicationContent);

                    // Use AttachmentBuilder instead of MessageAttachment
                    const fileAttachment = new AttachmentBuilder(fileName);

                    // Send the file as an attachment to the staff channel
                    const sentMessage = await staffChannel.send({
                        content: `New application from ${user.tag}:`,
                        files: [fileAttachment],
                        components: [row],
                        fetchReply: true,
                    });

                    await Application.create({
                        serverId: serverId,
                        userId: user.id,
                        channelId: applicationChannel.id,
                        confirmationId: sentMessage.id,
                        response: responses,
                    });

                    // Clean up the file after sending
                    fs.unlinkSync(fileName);
                } else {
                    // Send the application content directly if it's under 2000 characters
                    const sentMessage = await staffChannel.send({ content: applicationContent, components: [row], fetchReply: true });
                    await Application.create({
                        serverId: serverId,
                        userId: user.id,
                        channelId: applicationChannel.id,
                        confirmationId: sentMessage.id,
                        response: responses,
                    });
                }




                return await applicationChannel.send(`${user}, thank you for completing your application! It has been submitted for review.`);
            } catch (error) {
                console.error('Error while saving application:', error);
                return await applicationChannel.send(`${user}, the application process either timed out or an error has occurred. Please restart by using \`/apply\` again.`);
            }
        } catch (error) {
            console.error(error);
            return await applicationChannel.send(`${user}, the application process either timed out or an error has occurred. Please restart by using \`/apply\` again.`);
        }
    },
};