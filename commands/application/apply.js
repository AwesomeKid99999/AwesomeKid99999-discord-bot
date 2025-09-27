const { SlashCommandBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const {Question, Application, Guild, StaffRoles, Embed} = require('../../models')
const fs = require('fs'); // Required to work with file system

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply')
        .setDMPermission(false)
        .setDescription('Start your application process.')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of application you want to submit (single word only)')
                .setRequired(true)
                .setMaxLength(50)),
    async execute(interaction) {
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

                const answer = collected.first().content;
                responses[`Question ${question.questionNumber}`] = answer;
            }

            try {
                let applicationContent = `**New ${applicationType.charAt(0).toUpperCase() + applicationType.slice(1)} Application from ${user.tag}**\n\n`;
                for (const question of questions) {
                    const questionText = question.questionText || 'Question with image or embed';
                    const answer = responses[`Question ${question.questionNumber}`];
                    
                    // Add indicators for embed and image
                    let questionDisplay = questionText;
                    if (question.QuestionEmbedId) {
                        questionDisplay += ` [embed]`;
                    }
                    if (question.questionImage) {
                        questionDisplay += ` [image]`;
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




                return await applicationChannel.send(`${user}, thank you for completing your **${applicationType}** application! It has been submitted for review.`);
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