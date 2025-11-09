const { SlashCommandBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const {Question, Application, Guild, StaffRoles, Embed} = require('../../models')
const fs = require('fs');
const {acceptApplication, denyApplication} = require("../../helpers/applicationActions"); // Required to work with file system

module.exports = {
    data: new SlashCommandBuilder()
        .setName('application')
        .setDMPermission(false)
        .setDescription('Manage applications in the server. (STAFF ONLY)')
        .addSubcommand(subcommand => subcommand
            .setName('apply')
            .setDescription('Start your application process.')
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('The type of application you want to submit (single word only)')
                    .setRequired(true)
                    .setMaxLength(50)))
        .addSubcommand(subcommand => subcommand
            .setName('cancel')
            .setDescription('Cancel your application.')
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('The type of application you want to cancel (single word only)')
                    .setRequired(true)
                    .setMaxLength(50)))
        .addSubcommand(subcommand => subcommand
            .setName('list')
            .setDescription('List all application types and their current status (open/closed).'))
        .addSubcommand(subcommand => subcommand
            .setName('channel')
            .setDescription('Add, change, or remove the application submission channel in the server. (STAFF ONLY)')
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The channel to set')))
        .addSubcommand(subcommand => subcommand
            .setName('toggle')
            .setDescription('Open or close a type of application in the server. (STAFF ONLY)')
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('The type of application to toggle (single word only)')
                    .setRequired(true)
                    .setMaxLength(50))
            .addBooleanOption(option => option
                .setName('open')
                .setDescription('Whether or not to open applications for this type')))
        .addSubcommand(subcommand => subcommand
            .setName('accept')
            .setDescription('Accept an application. (STAFF ONLY)')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user whose application you want to accept.')
                .setRequired(true))
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('The type of application to accept (single word only)')
                    .setRequired(true)
                    .setMaxLength(50))
            .addStringOption(option => option
                .setName('reason')
                .setDescription('Reason for accepting the application.')
                .setRequired(false)
                .setMaxLength(1000)))
        .addSubcommand(subcommand => subcommand
            .setName('deny')
            .setDescription('Deny an application. (STAFF ONLY)')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user whose application you want to deny.')
                .setRequired(true))
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('The type of application to deny (single word only)')
                    .setRequired(true)
                    .setMaxLength(50))
            .addStringOption(option => option
                .setName('reason')
                .setDescription('Reason for denying the application.')
                .setRequired(false)
                .setMaxLength(1000))),
                category: 'application',
    async execute(interaction) {

        const subCommand = interaction.options.getSubcommand();

        if (subCommand === "apply") {
            const serverId = interaction.guild.id;
            const user = interaction.user;
            const applicationType = interaction.options.getString('type').toLowerCase();

            await interaction.deferReply({ ephemeral: true });
            // Validate that application type is a single word
            if (applicationType.includes(' ') || applicationType.includes('-') || applicationType.includes('_')) {
                return await interaction.editReply({
                    content: 'Application type must be a single word (no spaces, hyphens, or underscores).',
                    ephemeral: true,
                });
            }



            const categoryName = 'Applications'; // Name of the category where channels will be created
            const guild = await Guild.findOne({where: {serverId: await interaction.guild.id}});

            if (!guild) {
                console.log(`${interaction.guild.name} does not exist in the database`);
                return await interaction.editReply(`Please contact staff to set up something in the database for this server.`);
            }

            // Check if applications for this type are enabled
            const applicationToggle = await Application.findOne({
                where: {
                    serverId: serverId,
                    applicationType: applicationType,
                    userId: 'SYSTEM_TOGGLE'
                }
            });

            if (!applicationToggle || !applicationToggle.applicationToggle) {
                return await interaction.editReply(`Sorry, ${applicationType} applications are closed at this time.`);
            }

            if (!guild.applicationChannelId) {
                return await interaction.editReply(`Please contact staff to set up an application review channel.`);
            }

            const staffChannel = await interaction.guild.channels.fetch(`${guild.applicationChannelId}`);


            const staffRoles = await StaffRoles.findAll({
                where: { serverId: interaction.guild.id },
            });

            if (!staffRoles.length) {
                console.log(`${interaction.guild.name} does not have a staff role set`);
                return await interaction.editReply(`Error: I am unsure of the staff role. Please contact staff for help.`);
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
                (channel) => channel.name === `application-${applicationType}-${user.username.toLowerCase()}` && channel.type === 0 // 0 = GuildText
            );

            if (existingChannel) {
                return interaction.editReply({
                    content: 'You already have an open application channel with type ' + applicationType + '! Please complete it before starting another one.',
                    ephemeral: true,
                });
            }

            const existingApplication = await Application.findOne({
                where: { userId: user.id, serverId: serverId, status: 'pending', applicationType: applicationType },
            });

            if (existingApplication) {
                return interaction.editReply({
                    content: `You already have an active application with type **${applicationType}**. Please wait for it to be reviewed.`,
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
                name: `application-${applicationType}-${user.username.toLowerCase()}`,
                type: 0, // Text channel
                parent: category.id,
                permissionOverwrites,
            });

            // Notify the user
            await interaction.editReply({
                content: `Your application channel has been created: ${applicationChannel}`,
                ephemeral: true,
            });

            // Fetch the application questions for the specific type
            const questions = await Question.findAll({
                where: { serverId, QuestionType: applicationType },
                order: [['questionNumber', 'ASC']]
            });

            if (questions.length === 0) {
                await applicationChannel.send(`This server has no ${applicationType} application questions set up. Please contact staff.`);
                return;
            }

            // Start the application process
            try {
                const responses = {};
                const responseMessageIdByQuestion = {};
                const onMessageUpdate = async (oldMessage, newMessage) => {
                    try {
                        if (!newMessage || !newMessage.author || newMessage.author.bot) return;
                        if (newMessage.channelId !== applicationChannel.id) return;
                        if (newMessage.author.id !== user.id) return;
                        for (const [qNum, msgId] of Object.entries(responseMessageIdByQuestion)) {
                            if (newMessage.id === msgId) {
                                responses[`Question ${qNum}`] = newMessage.content;
                                break;
                            }
                        }
                    } catch {}
                };
                interaction.client.on('messageUpdate', onMessageUpdate);
                await applicationChannel.send(`${user}, welcome to your ${applicationType} application! Please answer the following questions one by one.`);

                for (const question of questions) {
                    // Prepare question content
                    let questionContent = `**Question ${question.questionNumber}:**`;

                    // Add question text or placeholder
                    if (question.questionText) {
                        questionContent += ` ${question.questionText}`;
                    } else {
                        questionContent += ` View image/embed below`;
                    }

                    // Send the question text
                    await applicationChannel.send(questionContent);

                    // Send embed if it exists
                    if (question.QuestionEmbedId) {
                        const embed = await Embed.findOne({ where: { id: question.QuestionEmbedId } });
                        if (embed && embed.isActive) {
                            const { EmbedBuilder } = require('discord.js');
                            const questionEmbed = new EmbedBuilder()
                                .setAuthor({
                                    name: embed.authorText ? embed.authorText
                                        .replace('{user}', `<@${user.id}>`)
                                        .replace('{username}', user.username)
                                        .replace('{tag}', user.tag)
                                        .replace('{server}', interaction.guild.name)
                                        .replace('{server_members}', interaction.guild.memberCount): null,
                                    iconURL: embed.authorImage ? embed.authorImage
                                        .replace('{user_avatar}', user.displayAvatarURL({ dynamic: true }))
                                        .replace('{server_avatar}', interaction.guild.iconURL({ dynamic: true })) : null
                                })
                                .setTitle(embed.title ? embed.title
                                    .replace('{user}', `<@${user.id}>`)
                                    .replace('{username}', user.username)
                                    .replace('{tag}', user.tag)
                                    .replace('{server}', interaction.guild.name)
                                    .replace('{server_members}', interaction.guild.memberCount): null)
                                .setDescription(embed.description ? embed.description
                                    .replace('{user}', `<@${user.id}>`)
                                    .replace('{username}', user.username)
                                    .replace('{tag}', user.tag)
                                    .replace('{server}', interaction.guild.name)
                                    .replace('{server_members}', interaction.guild.memberCount): null)
                                .setThumbnail(embed.thumbnail === "{user_avatar}" ? user.displayAvatarURL({ dynamic: true }) :
                                    embed.thumbnail === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                                        embed.thumbnail || null)
                                .setFooter({
                                    text: embed.footerText ? embed.footerText
                                        .replace('{user}', `<@${user.id}>`)
                                        .replace('{username}', user.username)
                                        .replace('{tag}', user.tag)
                                        .replace('{server}', interaction.guild.name)
                                        .replace('{server_members}', interaction.guild.memberCount): null,
                                    iconURL: embed.footerImage === "{user_avatar}" ? user.displayAvatarURL({ dynamic: true }) :
                                        embed.footerImage === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                                            (embed.footerImage || null)
                                })
                                .setColor(embed.color || null)
                                .setImage(embed.image === "{user_avatar}" ? user.displayAvatarURL({ dynamic: true }) :
                                    embed.image === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                                        embed.image || null);

                            if (embed.timestamp) questionEmbed.setTimestamp();

                            await applicationChannel.send({ embeds: [questionEmbed] });
                        }
                    }

                    // Send image if it exists
                    if (question.questionImage) {
                        await applicationChannel.send({ content: question.questionImage });
                    }

                    // Wait for the user's response
                    const filter = (response) => response.author.id === user.id;
                    const collected = await applicationChannel.awaitMessages({ filter, max: 1, time: 900000, errors: ['time'] });
                    const responseMessage = collected.first();
                    const answer = responseMessage.content;
                    responses[`Question ${question.questionNumber}`] = answer;
                    responseMessageIdByQuestion[question.questionNumber] = responseMessage.id;
                }

                try {
                    let applicationContent = `**New ${applicationType.charAt(0).toUpperCase() + applicationType.slice(1)} Application from ${user.tag}**\n\n`;
                    for (const question of questions) {
                        const questionText = question.questionText || 'Question with image or embed';
                        const answer = responses[`Question ${question.questionNumber}`];


                        // Add indicators for embed and image
                        let questionDisplay = questionText;
                        if (question.QuestionEmbedId) {
                            const embed = await Embed.findOne({ where: { id: question.QuestionEmbedId } });
                            questionDisplay += ` [embed: ${embed.embedName}]`;
                        }
                        if (question.questionImage) {
                            questionDisplay += ` [image: ${question.questionImage}]`;
                        }

                        applicationContent += `\n**Question ${question.questionNumber}:** ${questionDisplay}\nAnswer: ${answer}\n`;
                    }



                    // Send the message with buttons
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`accept-${user.id}-${applicationType}`)
                            .setLabel('Accept')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId(`accept_reason-${user.id}-${applicationType}`)
                            .setLabel('Accept with Reason')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId(`deny-${user.id}-${applicationType}`)
                            .setLabel('Deny')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId(`deny_reason-${user.id}-${applicationType}`)
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
                            content: `New ${applicationType} application from ${user.tag}:`,
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
                            applicationType: applicationType,
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
                            applicationType: applicationType,
                        });
                    }




                    interaction.client.off('messageUpdate', onMessageUpdate);
                    return await applicationChannel.send(`${user}, thank you for completing your **${applicationType}** application! It has been submitted for review.`);
                } catch (error) {
                    console.error('Error while saving application:', error);
                    interaction.client.off('messageUpdate', onMessageUpdate);
                    return await applicationChannel.send(`${user}, the application process either timed out or an error has occurred. Please restart by using \`/application apply\` again.`);
                }
            } catch (error) {
                console.error(error);
                try { interaction.client.off('messageUpdate', onMessageUpdate); } catch {}
                return await applicationChannel.send(`${user}, the application process either timed out or an error has occurred. Please restart by using \`/application apply\` again.`);
            }
        }

        if (subCommand === "cancel") {
            const userId = interaction.user.id;
            const serverId = interaction.guild.id;
            const applicationType = interaction.options.getString('type').toLowerCase();

            // Validate that application type is a single word
            if (applicationType.includes(' ') || applicationType.includes('-') || applicationType.includes('_')) {
                return await interaction.reply({
                    content: 'Application type must be a single word (no spaces, hyphens, or underscores).',
                    ephemeral: true,
                });
            }

            const guild = await Guild.findOne({where: {serverId: await interaction.guild.id}});

            // Check if the user already has an application channel
            const existingChannel = interaction.guild.channels.cache.find(
                (channel) => channel.name === `application-${applicationType}-${interaction.user.username.toLowerCase()}` && channel.type === 0 // 0 = GuildText
            );


            try {
                // Find the application for the user
                const application = await Application.findOne({
                    where: { userId: userId, serverId: serverId, status: 'pending', applicationType: applicationType },
                });

                if (!application && existingChannel) {
                    existingChannel.delete();
                    return interaction.reply({
                        content: 'Deleted in progress application with type ' + applicationType + '.',
                        ephemeral: true,
                    });
                }
                if (!application) {
                    return interaction.reply({
                        content: 'You do not have a pending application with type ' + applicationType + ' to cancel.',
                        ephemeral: true,
                    });
                }


                // Fetch the original message from the staff response channel
                if (!guild.applicationChannelId) {
                    return interaction.reply({
                        content: 'Staff response channel not found. Please contact staff for help.',
                        ephemeral: true,
                    });
                }
                const staffChannel = await interaction.guild.channels.fetch(guild.applicationChannelId);


                const confirmationMessageId = application.confirmationId;
                let staffMessage;
                if (confirmationMessageId) {
                    try {
                        staffMessage = await staffChannel.messages.fetch(confirmationMessageId);
                        staffMessage.delete();
                    } catch {
                        console.log('Original confirmation message not found.');
                    }
                }


                existingChannel.delete();


                // Delete the application record from the database
                await application.destroy();

                // Notify the user
                await interaction.reply({
                    content: 'Your application with type ' + applicationType + ' has been successfully canceled.',
                    ephemeral: true,
                });


            } catch (error) {
                console.error('Error canceling application:', error);
                return await interaction.reply({
                    content: 'An error occurred while attempting to cancel your application. Please try again or contact the staff.',
                    ephemeral: true,
                });
            }
        }

        if (subCommand === "list") {
            const serverId = interaction.guild.id;

            try {
                // Get all application toggle records for this server
                const applicationToggles = await Application.findAll({
                    where: {
                        serverId: serverId,
                        userId: 'SYSTEM_TOGGLE'
                    },
                    order: [['applicationType', 'ASC']]
                });

                if (applicationToggles.length === 0) {
                    return await interaction.reply({
                        content: 'No application types have been configured yet. Please contact staff for more information.',
                        ephemeral: true,
                    });
                }

                // Create plain text message
                let message = '**Application Types Status**\n';
                message += 'Current status of all application types in this server\n\n';

                // Add each application type
                for (const toggle of applicationToggles) {
                    const status = toggle.applicationToggle ? '🟢 Open' : '🔴 Closed';
                    const typeName = toggle.applicationType;
                    message += `**${typeName} Applications:** ${status}\n`;
                }

                // Add summary
                const openCount = applicationToggles.filter(t => t.applicationToggle).length;
                const closedCount = applicationToggles.length - openCount;

                message += '\n**Summary:**\n';
                message += `Open: ${openCount}\n`;
                message += `Closed: ${closedCount}\n`;
                message += `Total: ${applicationToggles.length}`;

                await interaction.reply({ content: message });

            } catch (error) {
                console.error('Error fetching application list:', error);
                await interaction.reply({
                    content: 'An error occurred while fetching the application list. Please try again.',
                    ephemeral: true,
                });
            }
        }

        if (subCommand === "channel") {
            const channel = interaction.options.getChannel('channel');
            const [guild] = await Guild.findOrCreate({where: {serverId: await interaction.guild.id}});




            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return interaction.reply(':x: You do not have permission to manage channels.');

            }

            const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return interaction.reply(':warning: I do not have permission to manage channels.');

            }


            if (!channel) {
                await guild.update({ applicationChannelId: null });
                return await interaction.reply('Application submission channel has been set to **none**.');



            } else {
                await guild.update({ applicationChannelId: channel.id });
                return await interaction.reply(`Application submission channel has been set to **${channel}**`);
            }
        }

        if (subCommand === "toggle") {
            const enable = interaction.options.getBoolean('open');
            const applicationType = interaction.options.getString('type').toLowerCase();
            const serverId = interaction.guild.id;

            // Validate that application type is a single word
            if (applicationType.includes(' ') || applicationType.includes('-') || applicationType.includes('_')) {
                return await interaction.reply({
                    content: 'Application type must be a single word (no spaces, hyphens, or underscores).',
                    ephemeral: true,
                });
            }

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return interaction.reply(':x: You do not have permission to manage the server.');
            }

            // Find or create an application record for this server and type to store the toggle state
            const [applicationToggle] = await Application.findOrCreate({
                where: {
                    serverId: serverId,
                    applicationType: applicationType,
                    userId: 'SYSTEM_TOGGLE' // Use a special system user ID for toggle records
                },
                defaults: {
                    serverId: serverId,
                    userId: 'SYSTEM_TOGGLE',
                    channelId: 'SYSTEM',
                    confirmationId: 'SYSTEM',
                    applicationType: applicationType,
                    response: {},
                    applicationToggle: enable,
                    status: 'pending'
                }
            });

            // Update the toggle state
            await applicationToggle.update({ applicationToggle: enable });

            if (!enable) {
                console.log(`${applicationType} applications disabled in ${interaction.guild.name}`);
                return await interaction.reply(`${applicationType.charAt(0).toUpperCase() + applicationType.slice(1)} applications have been **closed**.`);
            } else {
                console.log(`${applicationType} applications enabled in ${interaction.guild.name}`);
                return await interaction.reply(`${applicationType.charAt(0).toUpperCase() + applicationType.slice(1)} applications have been **opened**.`);
            }

        }

        if (subCommand === "accept") {
            const user = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'No specific reason provided';
            const applicationType = interaction.options.getString('type').toLowerCase();
            const serverId = interaction.guild.id;

            await interaction.deferReply({ ephemeral: true });
            // Validate that application type is a single word
            if (applicationType.includes(' ') || applicationType.includes('-') || applicationType.includes('_')) {
                return await interaction.reply({
                    content: 'Application type must be a single word (no spaces, hyphens, or underscores).',
                    ephemeral: true,
                });
            }

            await acceptApplication(interaction, user.id, reason, serverId, applicationType);

        }

        if (subCommand === "deny") {
            const user = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'No specific reason provided';
            const applicationType = interaction.options.getString('type').toLowerCase();
            const serverId = interaction.guild.id;

            await interaction.deferReply({ ephemeral: true });
            // Validate that application type is a single word
            if (applicationType.includes(' ') || applicationType.includes('-') || applicationType.includes('_')) {
                return await interaction.reply({
                    content: 'Application type must be a single word (no spaces, hyphens, or underscores).',
                    ephemeral: true,
                });
            }


            await denyApplication(interaction, user.id, reason, serverId, applicationType);

        }

    },
};