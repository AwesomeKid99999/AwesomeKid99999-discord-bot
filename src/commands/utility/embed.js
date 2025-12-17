const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const {Embed, Level, XPSettings} = require("../../models/");

const { getUserLevelingData } = require('../../helpers/leveling/getUserLevelingData');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('embed')
		.setDMPermission(false)
		.setDescription('Do stuff with embeds!')
		.addSubcommand(subcommand => subcommand
			.setName('generate')
			.setDescription('Replies with a customized embed!')
			.addStringOption(option => option
				.setName('author_text')
				.setDescription('The author text of the embed')
				.setMaxLength(256))
			.addStringOption(option => option
				.setName('author_image')
				.setDescription('The author image of the embed (optional)')
				.setMaxLength(2048))
			.addStringOption(option => option
				.setName('color')
				.setDescription('The color of the embed')
				.setMaxLength(9))
			.addStringOption(option => option
				.setName('title')
				.setDescription('The title of the embed')
				.setMaxLength(256))
			.addStringOption(option => option
				.setName('description')
				.setDescription('The description (main text) of the embed')
				.setMaxLength(4096))
			.addStringOption(option => option
				.setName('thumbnail')
				.setDescription('The thumbnail of the embed (use a picture url)')
				.setMaxLength(2048))
			.addStringOption(option => option
				.setName('image')
				.setDescription('The image of the embed (use a picture url)')
				.setMaxLength(2048))
			.addStringOption(option => option
				.setName('footer_text')
				.setDescription('The footer text of the embed')
				.setMaxLength(2048))
			.addStringOption(option => option
				.setName('footer_image')
				.setDescription('The footer image of the embed')
				.setMaxLength(2048))
			.addBooleanOption(option => option
				.setName('timestamp')
				.setDescription('Whether or not to include the timestamp in the footer'))
			.addChannelOption(option => option
				.setName('channel')
				.setDescription('Where I should send the embed')))
		.addSubcommand(subcommand => subcommand
			.setName('create')
			.setDescription('Create a customizable embed for the database. (STAFF ONLY)')
			.addStringOption(option => option
				.setName('name')
				.setDescription('The name of the embed')
				.setMaxLength(100)
				.setRequired(true))
			.addStringOption(option => option
				.setName('author_text')
				.setDescription('The author text of the embed')
				.setMaxLength(256))
			.addStringOption(option => option
				.setName('author_image')
				.setDescription('The author image of the embed (optional)')
				.setMaxLength(2048))
			.addStringOption(option => option
				.setName('color')
				.setDescription('The color of the embed')
				.setMaxLength(9))
			.addStringOption(option => option
				.setName('title')
				.setDescription('The title of the embed')
				.setMaxLength(256))
			.addStringOption(option => option
				.setName('description')
				.setDescription('The description (main text) of the embed')
				.setMaxLength(4096))
			.addStringOption(option => option
				.setName('thumbnail')
				.setDescription('The thumbnail of the embed (use a picture url)')
				.setMaxLength(2048))
			.addStringOption(option => option
				.setName('image')
				.setDescription('The image of the embed (use a picture url)')
				.setMaxLength(2048))
			.addStringOption(option => option
				.setName('footer_text')
				.setDescription('The footer text of the embed')
				.setMaxLength(2048))
			.addStringOption(option => option
				.setName('footer_image')
				.setDescription('The footer image of the embed')
				.setMaxLength(2048))
			.addBooleanOption(option => option
				.setName('timestamp')
				.setDescription('Whether or not to include the timestamp in the footer'))
			.addBooleanOption(option => option
				.setName('active')
				.setDescription('Whether or not the embed is active')))
		.addSubcommand(subcommand => subcommand
			.setName('edit')
			.setDescription('Edit a customizable embed for the database. (STAFF ONLY)')
			.addStringOption(option => option
				.setName('name')
				.setDescription('The name of the embed to edit')
				.setMaxLength(100)
				.setRequired(true))
			.addStringOption(option => option
				.setName('author_text')
				.setDescription('The author text of the embed')
				.setMaxLength(256))
			.addStringOption(option => option
				.setName('author_image')
				.setDescription('The author image of the embed (optional)')
				.setMaxLength(2048))
			.addStringOption(option => option
				.setName('color')
				.setDescription('The color of the embed')
				.setMaxLength(9))
			.addStringOption(option => option
				.setName('title')
				.setDescription('The title of the embed')
				.setMaxLength(256))
			.addStringOption(option => option
				.setName('description')
				.setDescription('The description (main text) of the embed')
				.setMaxLength(4096))
			.addStringOption(option => option
				.setName('thumbnail')
				.setDescription('The thumbnail of the embed (use a picture url)')
				.setMaxLength(2048))
			.addStringOption(option => option
				.setName('image')
				.setDescription('The image of the embed (use a picture url)')
				.setMaxLength(2048))
			.addStringOption(option => option
				.setName('footer_text')
				.setDescription('The footer text of the embed')
				.setMaxLength(2048))
			.addStringOption(option => option
				.setName('footer_image')
				.setDescription('The footer image of the embed')
				.setMaxLength(2048))
			.addBooleanOption(option => option
				.setName('timestamp')
				.setDescription('Whether or not to include the timestamp in the footer'))
			.addBooleanOption(option => option
				.setName('active')
				.setDescription('Whether or not the embed is active')))
		.addSubcommand(subcommand => subcommand
			.setName('delete')
			.setDescription('Delete a customizable embed in the database. (STAFF ONLY)')
			.addStringOption(option => option
				.setName('name')
				.setDescription('The name of the embed to delete')
				.setMaxLength(100)
				.setRequired(true)))
		.addSubcommand(subcommand => subcommand
			.setName('list')
			.setDescription('List the customizable embeds in the database. (STAFF ONLY)'))
		.addSubcommand(subcommand => subcommand
			.setName('show')
			.setDescription('Show a customizable embed in the server. (STAFF ONLY)')
			.addStringOption(option => option
				.setName('name')
				.setDescription('The name of the embed to show')
				.setMaxLength(100))),
		category: 'utility',
	async execute(interaction) {

		if (interaction.options.getSubcommand() === 'generate') {
			const channel = interaction.options.getChannel('channel');
			let authorText = interaction.options.getString('author_text');
			if (authorText) authorText = authorText.replace(/\\n/g, '\n');
			let authorImage = interaction.options.getString('author_image');

			const color = interaction.options.getString('color') ?? 'Default';
			let title = interaction.options.getString('title');
			if (title) title = title.replace(/\\n/g, '\n');
			let description = interaction.options.getString('description');
			if (description) description = description.replace(/\\n/g, '\n');
			let thumbnail = interaction.options.getString('thumbnail');
			let image = interaction.options.getString('image');

			let footerText = interaction.options.getString('footer_text');
			if (footerText) footerText = footerText.replace(/\\n/g, '\n');
			let footerImage = interaction.options.getString('footer_image')
			let timestamp = interaction.options.getBoolean('timestamp');

			// Get user leveling data
			const levelingData = await getUserLevelingData(interaction.user.id, interaction.guild.id);



			if (authorText) {
				if (!authorText.startsWith(`\\`)) {
					authorText = authorText.replace('{user}', `<@${interaction.user.id}>`) // Mention the user
					.replace('{username}', interaction.user.username) // Username of the user
					.replace('{tag}', interaction.user.tag) // Username or tag of the user (e.g., "username")
					.replace('{server}', interaction.guild.name)
					.replace('{server_members}', interaction.guild.memberCount);

					// Add leveling placeholders
					if (levelingData) {
						authorText = authorText.replace('{level}', levelingData.level)
							.replace('{current_xp}', levelingData.currentXp)
							.replace('{total_xp}', levelingData.totalXp)
							.replace('{next_level_xp}', levelingData.nextLevelXp)
							.replace('{rank}', levelingData.rank);
					}

				}
			}

			if ((authorImage && !authorText) || (authorText && !isValidImageUrl(authorImage))) {
				authorImage = null;
			}


				if (title && !title.startsWith(`\\`)) {
					title = title.replace('{user}', `<@${interaction.user.id}>`) // Mention the user
					.replace('{username}', interaction.user.username) // Username of the user
					.replace('{tag}', interaction.user.tag) // Username or tag of the user (e.g., "username")
					.replace('{server}', interaction.guild.name)
						.replace('{server_members}', interaction.guild.memberCount);

					// Add leveling placeholders
					if (levelingData) {
						title = title.replace('{level}', levelingData.level)
							.replace('{current_xp}', levelingData.currentXp)
							.replace('{total_xp}', levelingData.totalXp)
							.replace('{next_level_xp}', levelingData.nextLevelXp)
							.replace('{rank}', levelingData.rank);
					}
				}


			if (description && !description.startsWith(`\\`)) {
				description = description.replace('{user}', `<@${interaction.user.id}>`) // Mention the user
					.replace('{username}', interaction.user.username) // Username of the user
					.replace('{tag}', interaction.user.tag) // Username or tag of the user (e.g., "username")
					.replace('{server}', interaction.guild.name)
					.replace('{server_members}', interaction.guild.memberCount);

				// Add leveling placeholders
				if (levelingData) {
					description = description.replace('{level}', levelingData.level)
						.replace('{current_xp}', levelingData.currentXp)
						.replace('{total_xp}', levelingData.totalXp)
						.replace('{next_level_xp}', levelingData.nextLevelXp)
						.replace('{rank}', levelingData.rank);
				}
			}


			if (!isValidImageUrl(image)) image = null;
			




				if (footerText && !footerText.startsWith(`\\`)) {
					footerText = footerText.replace('{user}', `<@${interaction.user.id}>`) // Mention the user
					.replace('{username}', interaction.user.username) // Username of the user
					.replace('{tag}', interaction.user.tag) // Username or tag of the user (e.g., "username")
					.replace('{server}', interaction.guild.name)
						.replace('{server_members}', interaction.guild.memberCount);

					// Add leveling placeholders
					if (levelingData) {
						footerText = footerText.replace('{level}', levelingData.level)
							.replace('{current_xp}', levelingData.currentXp)
							.replace('{total_xp}', levelingData.totalXp)
							.replace('{next_level_xp}', levelingData.nextLevelXp)
							.replace('{rank}', levelingData.rank);
					}
				}


			if (((footerImage) && !footerText) || (footerText && !isValidImageUrl(footerImage))) {
				footerImage = null;
			}


			if (!authorText && !authorImage && !title && !description && !thumbnail && !image && !footerText && !footerImage) description = '<:spacer:1329265736555827242>';


			const botMember = interaction.guild.members.cache.get(interaction.client.user.id);


			// builds the embed
			try {
				const customEmbed = new EmbedBuilder()

				.setColor(color)
				.setTitle(title)
				.setDescription(description)
				if (authorImage === "{user_avatar}") {
					customEmbed.setAuthor({
						name: authorText || interaction.user.username,
						iconURL: interaction.user.displayAvatarURL({dynamic: true}),
					});
				} else if (authorImage === "{server_avatar}") {
					customEmbed.setAuthor({
						name: authorText || interaction.guild.name,
						iconURL: interaction.guild.iconURL({dynamic: true}),
					});
				} else {
					customEmbed.setAuthor({
						name: authorText || null,
						iconURL: authorImage || null,
					})
				}


				if (thumbnail === "{user_avatar}") {
					customEmbed.setThumbnail(interaction.user.displayAvatarURL({dynamic: true}));
				} else if (thumbnail === "{server_avatar}") {
					customEmbed.setThumbnail(interaction.guild.iconURL({dynamic: true}));
				} else {
					customEmbed.setThumbnail(thumbnail)
				}
				if (image === "{user_avatar}") {
					customEmbed.setImage(interaction.user.displayAvatarURL({dynamic: true}));
				} else if (image === "{server_avatar}") {
					customEmbed.setImage(interaction.guild.iconURL({dynamic: true}));
				} else {
					customEmbed.setImage(image)
				}

				if (footerImage === "{user_avatar}") {
					// Replace the placeholder with the actual user avatar URL
					customEmbed.setFooter({
						text: footerText || '', // If footerText is provided, use it; otherwise, use an empty string
						iconURL: interaction.user.displayAvatarURL({dynamic: true}) // This will use the user's avatar URL, dynamic for GIF support
					});
				} else if (footerImage === "{server_avatar}") {
					// Replace the placeholder with the actual user avatar URL
					customEmbed.setFooter({
						text: footerText, // If footerText is provided, use it; otherwise, use an empty string
						iconURL: interaction.guild.iconURL({dynamic: true}) // This will use the user's avatar URL, dynamic for GIF support
					});
				} else if (footerImage && isValidImageUrl(footerImage)) {
					// If the footerImage is a valid image URL, set it as the icon
					customEmbed.setFooter({
						text: footerText,
						iconURL: footerImage
					});
				} else {
					// If no valid footerImage, just set the footer text
					customEmbed.setFooter({
						text: footerText
					});
				}
				if (timestamp) customEmbed.setTimestamp();
					



				if (!channel || channel.id === interaction.channel.id ) {
					return await interaction.reply({ embeds: [customEmbed] });
				}

				if (!botMember.permissions.has(PermissionsBitField.Flags.SendMessages)) {
					return interaction.reply(':warning: I do not have permission to send embeds.');

				}
				try {
					await channel.send({ embeds: [customEmbed] });
					return await interaction.reply(`Sent an embed in ${channel}!`);
				} catch (error) {
					if (error.message === 'Missing Permissions') {
						return await interaction.reply(`I do not have permissions to send embeds in ${channel}.`);
					}
				}
			} catch (error) {

			console.log(error)
			if (error.code === 'ColorConvert') {
				return await interaction.reply('Invalid color input. View the colors [here](https://old.discordjs.dev/#/docs/discord.js/main/typedef/ColorResolvable). (the strings are case-sensitive)');
			}

			
			if (error.code === 50035) {
				return await interaction.reply('There was an error generating the embed.');
			}			}
		}

		if (interaction.options.getSubcommand() === 'create') {


			const name = interaction.options.getString('name');
			const isActive = interaction.options.getBoolean('active');
			let authorText = interaction.options.getString('author_text');
			if (authorText) authorText = authorText.replace(/\\n/g, '\n');
			let authorImage = interaction.options.getString('author_image');

			const color = interaction.options.getString('color') ?? 'Default';
			let title = interaction.options.getString('title');
			if (title) title = title.replace(/\\n/g, '\n');
			let description = interaction.options.getString('description');
			if (description) description = description.replace(/\\n/g, '\n');
			let thumbnail = interaction.options.getString('thumbnail');
			let image = interaction.options.getString('image');

			let footerText = interaction.options.getString('footer_text');
			if (footerText) footerText = footerText.replace(/\\n/g, '\n');
			let footerImage = interaction.options.getString('footer_image')
			let timestamp = interaction.options.getBoolean('timestamp');

			// Get user leveling data
			const levelingData = await getUserLevelingData(interaction.user.id, interaction.guild.id);

			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
				return await interaction.reply('Sorry, you do not have permission to run this command.');
			}


			const existingEmbed = await Embed.findOne({ where: { serverId: interaction.guild.id, embedName: name } });
			if (existingEmbed) {
				return interaction.reply({ content: `The embed **${name}** already exists!`, ephemeral: true });
			}

			if (authorImage === ("{user_avatar}" || "{server_avatar}")) {
				// Placeholder detected, no need to validate
			} else if (!isValidImageUrl(authorImage)) {
				authorImage = null; // Clear invalid URLs
			}

			if ((authorImage && !authorText) || (authorText && !isValidImageUrl(authorImage))) {
				authorImage = null;
			}


			if (image === ("{user_avatar}" || "{server_avatar}")) {
			} else if (!isValidImageUrl(image)) image = null;


			if (thumbnail === ("{user_avatar}" || "{server_avatar}")) {
			} else if (!isValidImageUrl(thumbnail)) thumbnail = null;

			if (((footerImage) && !footerText) || (footerText && !isValidImageUrl(footerImage))) {
				footerImage = null;
			}


			if (!authorText && !authorImage && !title && !description && !thumbnail && !image && !footerText && !footerImage) description = '<:spacer:1329265736555827242>';

			await Embed.create({

					serverId: interaction.guild.id,
					embedName: name,
					authorText: authorText,
					authorImage: authorImage,
					title: title,
					description: description,
					thumbnail: thumbnail,
					image: image,
					footerText: footerText,
					footerImage: footerImage,
					color: color,
					timestamp: timestamp,
					isActive: isActive

			});


				if (authorText && !authorText.startsWith(`\\`)) {
					authorText = authorText.replace('{user}', `<@${interaction.user.id}>`) // Mention the user
						.replace('{username}', interaction.user.username) // Username of the user
						.replace('{tag}', interaction.user.tag) // Username or tag of the user (e.g., "username")
						.replace('{server}', interaction.guild.name)
						.replace('{server_members}', interaction.guild.memberCount);

					// Add leveling placeholders
					if (levelingData) {
						authorText = authorText.replace('{level}', levelingData.level)
							.replace('{current_xp}', levelingData.currentXp)
							.replace('{total_xp}', levelingData.totalXp)
							.replace('{next_level_xp}', levelingData.nextLevelXp)
							.replace('{rank}', levelingData.rank);
					}
				}





				if (title && !title.startsWith(`\\`)) {
					title = title.replace('{user}', `<@${interaction.user.id}>`) // Mention the user
						.replace('{username}', interaction.user.username) // Username of the user
						.replace('{tag}', interaction.user.tag) // Username or tag of the user (e.g., "username")
						.replace('{server}', interaction.guild.name)
						.replace('{server_members}', interaction.guild.memberCount);

					// Add leveling placeholders
					if (levelingData) {
						title = title.replace('{level}', levelingData.level)
							.replace('{current_xp}', levelingData.currentXp)
							.replace('{total_xp}', levelingData.totalXp)
							.replace('{next_level_xp}', levelingData.nextLevelXp)
							.replace('{rank}', levelingData.rank);
					}
				}




			if (description && !description.startsWith(`\\`)) {
				description = description.replace('{user}', `<@${interaction.user.id}>`) // Mention the user
					.replace('{username}', interaction.user.username) // Username of the user
					.replace('{tag}', interaction.user.tag) // Username or tag of the user (e.g., "username")
					.replace('{server}', interaction.guild.name)
					.replace('{server_members}', interaction.guild.memberCount);
			}


			if (footerText && !footerText.startsWith(`\\`)) {
				footerText = footerText.replace('{user}', `<@${interaction.user.id}>`) // Mention the user
					.replace('{username}', interaction.user.username) // Username of the user
					.replace('{tag}', interaction.user.tag) // Username or tag of the user (e.g., "username")
					.replace('{server}', interaction.guild.name)
					.replace('{server_members}', interaction.guild.memberCount);
			}



			const botMember = interaction.guild.members.cache.get(interaction.client.user.id);




			// builds the embed
			try {
				const customEmbed = new EmbedBuilder()


					.setColor(color)
					.setTitle(title)
					.setDescription(description)
				if (authorImage === "{user_avatar}") {
					customEmbed.setAuthor({
						name: authorText || interaction.user.username,
						iconURL: interaction.user.displayAvatarURL({dynamic: true}),
					});
				} else if (authorImage === "{server_avatar}") {
					customEmbed.setAuthor({
						name: authorText || interaction.guild.name,
						iconURL: interaction.guild.iconURL({dynamic: true}),
					});
				} else {
					customEmbed.setAuthor({
						name: authorText || null,
						iconURL: authorImage || null,
					})
				}


				if (thumbnail === "{user_avatar}") {
					customEmbed.setThumbnail(interaction.user.displayAvatarURL({dynamic: true}));
				} else if (thumbnail === "{server_avatar}") {
					customEmbed.setThumbnail(interaction.guild.iconURL({dynamic: true}));
				} else {
					customEmbed.setThumbnail(thumbnail)
				}
				if (image === "{user_avatar}") {
					customEmbed.setImage(interaction.user.displayAvatarURL({dynamic: true}));
				} else if (image === "{server_avatar}") {
					customEmbed.setImage(interaction.guild.iconURL({dynamic: true}));
				} else {
					customEmbed.setImage(image)
				}

				if (footerImage === "{user_avatar}") {
					// Replace the placeholder with the actual user avatar URL
					customEmbed.setFooter({
						text: footerText || '', // If footerText is provided, use it; otherwise, use an empty string
						iconURL: interaction.user.displayAvatarURL({dynamic: true}) // This will use the user's avatar URL, dynamic for GIF support
					});
				} else if (footerImage === "{server_avatar}") {
					// Replace the placeholder with the actual user avatar URL
					customEmbed.setFooter({
						text: footerText, // If footerText is provided, use it; otherwise, use an empty string
						iconURL: interaction.guild.iconURL({dynamic: true}) // This will use the user's avatar URL, dynamic for GIF support
					});
				} else if (footerImage && isValidImageUrl(footerImage)) {
					// If the footerImage is a valid image URL, set it as the icon
					customEmbed.setFooter({
						text: footerText,
						iconURL: footerImage
					});
				} else {
					// If no valid footerImage, just set the footer text
					customEmbed.setFooter({
						text: footerText
					});
				}
					if (timestamp) customEmbed.setTimestamp();


					if (!botMember.permissions.has(PermissionsBitField.Flags.SendMessages)) {
						return interaction.reply(':warning: I do not have permission to send embeds.');

					}


				await interaction.reply(`Embed ${name} created!`);
				return await interaction.channel.send({ embeds: [customEmbed] });

		} catch (error) {

			console.log(error)
			if (error.code === 'ColorConvert') {
				return await interaction.reply('Invalid color input. View the colors [here](https://old.discordjs.dev/#/docs/discord.js/main/typedef/ColorResolvable). (the strings are case-sensitive)');
			}


			if (error.code === 50035) {
				return await interaction.reply('There was an error saving the embed.');
			}

		}		}

		if (interaction.options.getSubcommand() === 'delete') {
			const name = interaction.options.getString('name');

			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
				return await interaction.reply('Sorry, you do not have permission to run this command.');
			}


			const existingEmbed = await Embed.findOne({ where: { serverId: interaction.guild.id, embedName: name } });
			if (!existingEmbed) {
				return interaction.reply({ content: `The embed **${name}** does not exist.`, ephemeral: true });
			}

			existingEmbed.destroy();



			return interaction.reply({ content: `The embed **${name}** has been deleted.` });
		}

		if (interaction.options.getSubcommand() === 'edit') {


			const name = interaction.options.getString('name');
			const isActive = interaction.options.getBoolean('active');
			let authorText = interaction.options.getString('author_text');
			if (authorText) authorText = authorText.replace(/\\n/g, '\n');
			let authorImage = interaction.options.getString('author_image');

			const color = interaction.options.getString('color') ?? 'Default';
			let title = interaction.options.getString('title');
			if (title) title = title.replace(/\\n/g, '\n');
			let description = interaction.options.getString('description');
			if (description) description = description.replace(/\\n/g, '\n');
			let thumbnail = interaction.options.getString('thumbnail');
			let image = interaction.options.getString('image');

			let footerText = interaction.options.getString('footer_text');
			if (footerText) footerText = footerText.replace(/\\n/g, '\n');
			let footerImage = interaction.options.getString('footer_image')
			let timestamp = interaction.options.getBoolean('timestamp');

			// Get user leveling data
			const levelingData = await getUserLevelingData(interaction.user.id, interaction.guild.id);


			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
				return await interaction.reply('Sorry, you do not have permission to run this command.');
			}


			const existingEmbed = await Embed.findOne({where: {serverId: interaction.guild.id, embedName: name}});
			if (!existingEmbed) {
				return interaction.reply({content: `The embed **${name}** does not exist.`, ephemeral: true});
			}

			if (authorImage === ("{user_avatar}" || "{server_avatar}")) {
				// Placeholder detected, no need to validate
			} else if (!isValidImageUrl(authorImage)) {
				authorImage = null; // Clear invalid URLs
			}

			if ((authorImage && !authorText) || (authorText && !isValidImageUrl(authorImage))) {
				authorImage = null;
			}


			if (image === ("{user_avatar}" || "{server_avatar}")) {
			} else if (!isValidImageUrl(image)) image = null;


			if (thumbnail === ("{user_avatar}" || "{server_avatar}")) {
			} else if (!isValidImageUrl(thumbnail)) thumbnail = null;

			if (((footerImage) && !footerText) || (footerText && !isValidImageUrl(footerImage))) {
				footerImage = null;
			}


			if (!authorText && !authorImage && !title && !description && !thumbnail && !image && !footerText && !footerImage) description = '<:spacer:1329265736555827242>';

			await existingEmbed.update({

				serverId: interaction.guild.id,
				embedName: name,
				authorText: authorText,
				authorImage: authorImage,
				title: title,
				description: description,
				thumbnail: thumbnail,
				image: image,
				footerText: footerText,
				footerImage: footerImage,
				color: color,
				timestamp: timestamp,
				isActive: isActive

			});


			if (authorText && !authorText.startsWith(`\\`)) {
				authorText = authorText.replace('{user}', `<@${interaction.user.id}>`) // Mention the user
					.replace('{username}', interaction.user.username) // Username of the user
					.replace('{tag}', interaction.user.tag) // Username or tag of the user (e.g., "username")
					.replace('{server}', interaction.guild.name)
					.replace('{server_members}', interaction.guild.memberCount);

				// Add leveling placeholders
				if (levelingData) {
					authorText = authorText.replace('{level}', levelingData.level)
						.replace('{current_xp}', levelingData.currentXp)
						.replace('{total_xp}', levelingData.totalXp)
						.replace('{next_level_xp}', levelingData.nextLevelXp)
						.replace('{rank}', levelingData.rank);
				}
			}


			if (title && !title.startsWith(`\\`)) {
				title = title.replace('{user}', `<@${interaction.user.id}>`) // Mention the user
					.replace('{username}', interaction.user.username) // Username of the user
					.replace('{tag}', interaction.user.tag) // Username or tag of the user (e.g., "username")
					.replace('{server}', interaction.guild.name)
					.replace('{server_members}', interaction.guild.memberCount);

				// Add leveling placeholders
				if (levelingData) {
					title = title.replace('{level}', levelingData.level)
						.replace('{current_xp}', levelingData.currentXp)
						.replace('{total_xp}', levelingData.totalXp)
						.replace('{next_level_xp}', levelingData.nextLevelXp)
						.replace('{rank}', levelingData.rank);
				}
				}


			if (description && !description.startsWith(`\\`)) {
				description = description.replace('{user}', `<@${interaction.user.id}>`) // Mention the user
					.replace('{username}', interaction.user.username) // Username of the user
					.replace('{tag}', interaction.user.tag) // Username or tag of the user (e.g., "username")
					.replace('{server}', interaction.guild.name)
					.replace('{server_members}', interaction.guild.memberCount);

				// Add leveling placeholders
				if (levelingData) {
					description = description.replace('{level}', levelingData.level)
						.replace('{current_xp}', levelingData.currentXp)
						.replace('{total_xp}', levelingData.totalXp)
						.replace('{next_level_xp}', levelingData.nextLevelXp)
						.replace('{rank}', levelingData.rank);
				}
			}


			if (footerText && !footerText.startsWith(`\\`)) {
				footerText = footerText.replace('{user}', `<@${interaction.user.id}>`) // Mention the user
					.replace('{username}', interaction.user.username) // Username of the user
					.replace('{tag}', interaction.user.tag) // Username or tag of the user (e.g., "username")
					.replace('{server}', interaction.guild.name)
					.replace('{server_members}', interaction.guild.memberCount);

				// Add leveling placeholders
				if (levelingData) {
					footerText = footerText.replace('{level}', levelingData.level)
						.replace('{current_xp}', levelingData.currentXp)
						.replace('{total_xp}', levelingData.totalXp)
						.replace('{next_level_xp}', levelingData.nextLevelXp)
						.replace('{rank}', levelingData.rank);
				}
			}


			const botMember = interaction.guild.members.cache.get(interaction.client.user.id);


			// builds the embed
			try {
				const customEmbed = new EmbedBuilder()


					.setColor(color)
					.setTitle(title)
					.setDescription(description)
				if (authorImage === "{user_avatar}") {
					customEmbed.setAuthor({
						name: authorText || interaction.user.username,
						iconURL: interaction.user.displayAvatarURL({dynamic: true}),
					});
				} else if (authorImage === "{server_avatar}") {
					customEmbed.setAuthor({
						name: authorText || interaction.guild.name,
						iconURL: interaction.guild.iconURL({dynamic: true}),
					});
				} else {
					customEmbed.setAuthor({
						name: authorText || null,
						iconURL: authorImage || null,
					})
				}


				if (thumbnail === "{user_avatar}") {
					customEmbed.setThumbnail(interaction.user.displayAvatarURL({dynamic: true}));
				} else if (thumbnail === "{server_avatar}") {
					customEmbed.setThumbnail(interaction.guild.iconURL({dynamic: true}));
				} else {
					customEmbed.setThumbnail(thumbnail)
				}
				if (image === "{user_avatar}") {
					customEmbed.setImage(interaction.user.displayAvatarURL({dynamic: true}));
				} else if (image === "{server_avatar}") {
					customEmbed.setImage(interaction.guild.iconURL({dynamic: true}));
				} else {
					customEmbed.setImage(image)
				}

				if (footerImage === "{user_avatar}") {
					// Replace the placeholder with the actual user avatar URL
					customEmbed.setFooter({
						text: footerText || '', // If footerText is provided, use it; otherwise, use an empty string
						iconURL: interaction.user.displayAvatarURL({dynamic: true}) // This will use the user's avatar URL, dynamic for GIF support
					});
				} else if (footerImage === "{server_avatar}") {
					// Replace the placeholder with the actual user avatar URL
					customEmbed.setFooter({
						text: footerText, // If footerText is provided, use it; otherwise, use an empty string
						iconURL: interaction.guild.iconURL({dynamic: true}) // This will use the user's avatar URL, dynamic for GIF support
					});
				} else if (footerImage && isValidImageUrl(footerImage)) {
					// If the footerImage is a valid image URL, set it as the icon
					customEmbed.setFooter({
						text: footerText,
						iconURL: footerImage
					});
				} else {
					// If no valid footerImage, just set the footer text
					customEmbed.setFooter({
						text: footerText
					});
				}
					if (timestamp) customEmbed.setTimestamp();


					if (!botMember.permissions.has(PermissionsBitField.Flags.SendMessages)) {
						return interaction.reply(':warning: I do not have permission to send embeds.');

					}


					await interaction.reply(`Embed ${name} updated!`);

					return await interaction.channel.send({embeds: [customEmbed]});


		} catch (error)
			{

				console.log(error)
				if (error.code === 'ColorConvert') {
					return await interaction.reply('Invalid color input. View the colors [here](https://old.discordjs.dev/#/docs/discord.js/#/typedef/ColorResolvable). (the strings are case-sensitive)');
				}


				if (error.code === 50035) {
					return await interaction.reply('There was an error saving the embed.');
				}

			}			}

		if (interaction.options.getSubcommand() === 'list') {
			const serverId = interaction.guild.id;


			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
				return await interaction.reply('Sorry, you do not have permission to run this command.');
			}

			try {
				// Fetch embeds from the database for the current server
				const embeds = await Embed.findAll({
					where: { serverId: serverId },
					order: [['embedName', 'ASC']], // Order embeds by the name
				});

				// If no embeds are found
				if (embeds.length === 0) {
					return interaction.reply({
						content: 'There are no embeds set up for this server.',
						ephemeral: true,
					});
				}

				// Create a message listing the embeds
				const embedList = embeds
					.map(
						(embed) =>
							`**${embed.embedName}**`
					)
					.join('\n');

				// Split the message into chunks if it exceeds 2000 characters
				const splitMessages = [];
				let chunk = '';

				embedList.split('\n').forEach((line) => {
					if (chunk.length + line.length + 1 > 2000) {
						splitMessages.push(chunk);
						chunk = '';
					}
					chunk += `${line}\n`;
				});
				if (chunk.length > 0) splitMessages.push(chunk);

				// Edit the reply with the first chunk
				await interaction.reply({
					content: `Here is the embed list:\n` + splitMessages[0],
				});

				// Send the remaining chunks as follow-ups
				for (let i = 1; i < splitMessages.length; i++) {
					await interaction.followUp({
						content: splitMessages[i],
					});
				}
			} catch (error) {
				console.error(error);
				await interaction.reply({
					content:
						'An error occurred while trying to list the embeds. Please try again later.',
					ephemeral: true,
				});
			}


		}

		if (interaction.options.getSubcommand() === 'show') {

			const name = interaction.options.getString('name');

			// Get user leveling data
			const levelingData = await getUserLevelingData(interaction.user.id, interaction.guild.id);

			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
				return await interaction.reply('Sorry, you do not have permission to run this command.');
			}


			const existingEmbed = await Embed.findOne({ where: { serverId: interaction.guild.id, embedName: name } });
			if (!existingEmbed) {
				return interaction.reply({ content: `The embed **${name}** does not exist.`, ephemeral: true });
			}


			let authorText = existingEmbed.authorText;
			let authorImage = existingEmbed.authorImage;

			const color = existingEmbed.color;
			let title = existingEmbed.title;
			let description = existingEmbed.description;
			let thumbnail = existingEmbed.thumbnail;
			let image = existingEmbed.image;
			let footerText = existingEmbed.footerText;
			let footerImage = existingEmbed.footerImage;
			let timestamp = existingEmbed.timestamp;



			if (authorText && !authorText.startsWith(`\\`)) {
				authorText = authorText.replace('{user}', `<@${interaction.user.id}>`) // Mention the user
					.replace('{username}', interaction.user.username) // Username of the user
					.replace('{tag}', interaction.user.tag) // Username or tag of the user (e.g., "username")
					.replace('{server}', interaction.guild.name)
					.replace('{server_members}', interaction.guild.memberCount);

				// Add leveling placeholders
				if (levelingData) {
					authorText = authorText.replace('{level}', levelingData.level)
						.replace('{current_xp}', levelingData.currentXp)
						.replace('{total_xp}', levelingData.totalXp)
						.replace('{next_level_xp}', levelingData.nextLevelXp)
						.replace('{rank}', levelingData.rank);
				}
			}





			if (title && !title.startsWith(`\\`)) {
				title = title.replace('{user}', `<@${interaction.user.id}>`) // Mention the user
					.replace('{username}', interaction.user.username) // Username of the user
					.replace('{tag}', interaction.user.tag) // Username or tag of the user (e.g., "username")
					.replace('{server}', interaction.guild.name)
					.replace('{server_members}', interaction.guild.memberCount);

				// Add leveling placeholders
				if (levelingData) {
					title = title.replace('{level}', levelingData.level)
						.replace('{current_xp}', levelingData.currentXp)
						.replace('{total_xp}', levelingData.totalXp)
						.replace('{next_level_xp}', levelingData.nextLevelXp)
						.replace('{rank}', levelingData.rank);
				}
			}




			if (description && !description.startsWith(`\\`)) {
				description = description.replace('{user}', `<@${interaction.user.id}>`) // Mention the user
					.replace('{username}', interaction.user.username) // Username of the user
					.replace('{tag}', interaction.user.tag) // Username or tag of the user (e.g., "username")
					.replace('{server}', interaction.guild.name)
					.replace('{server_members}', interaction.guild.memberCount);

				// Add leveling placeholders
				if (levelingData) {
					description = description.replace('{level}', levelingData.level)
						.replace('{current_xp}', levelingData.currentXp)
						.replace('{total_xp}', levelingData.totalXp)
						.replace('{next_level_xp}', levelingData.nextLevelXp)
						.replace('{rank}', levelingData.rank);
				}
			}


			if (footerText && !footerText.startsWith(`\\`)) {
				footerText = footerText.replace('{user}', `<@${interaction.user.id}>`) // Mention the user
					.replace('{username}', interaction.user.username) // Username of the user
					.replace('{tag}', interaction.user.tag) // Username or tag of the user (e.g., "username")
					.replace('{server}', interaction.guild.name)
					.replace('{server_members}', interaction.guild.memberCount);

				// Add leveling placeholders
				if (levelingData) {
					footerText = footerText.replace('{level}', levelingData.level)
						.replace('{current_xp}', levelingData.currentXp)
						.replace('{total_xp}', levelingData.totalXp)
						.replace('{next_level_xp}', levelingData.nextLevelXp)
						.replace('{rank}', levelingData.rank);
				}
			}

			const botMember = interaction.guild.members.cache.get(interaction.client.user.id);


			// builds the embed
			try {
				const customEmbed = new EmbedBuilder()


					.setColor(color)
					.setTitle(title)
					.setDescription(description)
				if (authorImage === "{user_avatar}") {
					customEmbed.setAuthor({
						name: authorText || interaction.user.username,
						iconURL: interaction.user.displayAvatarURL({dynamic: true}),
					});
				} else if (authorImage === "{server_avatar}") {
					customEmbed.setAuthor({
						name: authorText || interaction.guild.name,
						iconURL: interaction.guild.iconURL({dynamic: true}),
					});
				} else {
					customEmbed.setAuthor({
						name: authorText || null,
						iconURL: authorImage || null,
					})
				}


				if (thumbnail === "{user_avatar}") {
					customEmbed.setThumbnail(interaction.user.displayAvatarURL({dynamic: true}));
				} else if (thumbnail === "{server_avatar}") {
					customEmbed.setThumbnail(interaction.guild.iconURL({dynamic: true}));
				} else {
					customEmbed.setThumbnail(thumbnail)
				}
				if (image === "{user_avatar}") {
					customEmbed.setImage(interaction.user.displayAvatarURL({dynamic: true}));
				} else if (image === "{server_avatar}") {
					customEmbed.setImage(interaction.guild.iconURL({dynamic: true}));
				} else {
					customEmbed.setImage(image)
				}

				if (footerImage === "{user_avatar}") {
					// Replace the placeholder with the actual user avatar URL
					customEmbed.setFooter({
						text: footerText || '', // If footerText is provided, use it; otherwise, use an empty string
						iconURL: interaction.user.displayAvatarURL({dynamic: true}) // This will use the user's avatar URL, dynamic for GIF support
					});
				} else if (footerImage === "{server_avatar}") {
					// Replace the placeholder with the actual user avatar URL
					customEmbed.setFooter({
						text: footerText, // If footerText is provided, use it; otherwise, use an empty string
						iconURL: interaction.guild.iconURL({dynamic: true}) // This will use the user's avatar URL, dynamic for GIF support
					});
				} else if (footerImage && isValidImageUrl(footerImage)) {
					// If the footerImage is a valid image URL, set it as the icon
					customEmbed.setFooter({
						text: footerText,
						iconURL: footerImage
					});
				} else {
					// If no valid footerImage, just set the footer text
					customEmbed.setFooter({
						text: footerText
					});
				}
					if (timestamp) customEmbed.setTimestamp();


					if (!botMember.permissions.has(PermissionsBitField.Flags.SendMessages)) {
						return interaction.reply(':warning: I do not have permission to send embeds.');

					}


				await interaction.reply(`Showing embed ${name}!`);


				return await interaction.channel.send({ embeds: [customEmbed] });

		} catch (error) {

			console.log(error)
			if (error.code === 'ColorConvert') {
				return await interaction.reply('Invalid color input. View the colors [here](https://old.discordjs.dev/#/docs/discord.js/main/typedef/ColorResolvable). (the strings are case-sensitive)');
			}


			if (error.code === 50035) {
				return await interaction.reply('There was an error saving the embed.');
			}

		}

	}
},
};
async function isValidImageUrl(url) {
	const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"];
	try {
		const parsedUrl = new URL(url); // Verify it's a valid URL
		return imageExtensions.some((ext) => parsedUrl.pathname.toLowerCase().endsWith(ext));
	} catch (e) {
		return false; // Invalid URL
	}
}