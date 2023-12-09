const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('embed')
		.setDMPermission(false)
		.setDescription('Replies with a customized embed!')
		.addStringOption(option => option
			.setName('color')
			.setDescription('The color of the embed'))
		.addStringOption(option => option
			.setName('title')
			.setDescription('The title of the embed'))
		.addStringOption(option => option
			.setName('description')
			.setDescription('The description (main text) of the embed'))
		.addStringOption(option => option
			.setName('thumbnail')
			.setDescription('The thumbnail of the embed (use a picture url)'))
		.addStringOption(option => option
			.setName('footer')
			.setDescription('The footer of the embed'))
		.addChannelOption(option => option
			.setName('channel')
			.setDescription('Where I should send the embed')),
		category: 'fun',
	async execute(interaction) {



		await interaction.deferReply();
		const channel = interaction.options.getChannel('channel');
		const color = interaction.options.getString('color') ?? 'Default';
		const title = interaction.options.getString('title');
		const description = interaction.options.getString('description');
		const thumbnail = interaction.options.getString('thumbnail');
		const footer = interaction.options.getString('footer');

		if (title) {
			if (title.length > 256) {
				return await interaction.editReply(`Your embed title is too long. Please make it shorter.`);
			}
		}


		if (description) {
			if (description.length > 4096) {
				return await interaction.editReply(`Your embed description is too long. Please make it shorter.`);
			}
		}

		if (footer) {
			if (footer.length > 2048) {
				return await interaction.editReply(`Your embed footer is too long. Please make it shorter.`);
			}
		}
		
		const botMember = interaction.guild.members.cache.get(interaction.client.user.id);


		// builds the embed
		// TODO check if image url is valid
		try {
			const customEmbed = new EmbedBuilder()
		
			.setColor(color)
			.setTitle(title)
			.setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true })})
			.setDescription(description)
			.setThumbnail(thumbnail)
			.setFooter({text: footer});
	

			

			if (!channel || channel.id === interaction.channel.id ) {
				return await interaction.editReply({ embeds: [customEmbed] });
			}

			if (!botMember.permissions.has(PermissionsBitField.Flags.SendMessages)) {
				return interaction.editReply(':warning: I do not have permission to send embeds.');
				
			}
			try {
			 await channel.send({ embeds: [customEmbed] });
			 return await interaction.editReply(`Sent an embed in ${channel}!`);
			} catch (error) {
				if (error.message === 'Missing Permissions') {
					return await interaction.editReply(`I do not have permissions to send embeds in ${channel}.`);
				}
			}
		} catch (error) {
			if (error.code === 'ColorConvert') {
				return await interaction.editReply('Invalid color input. View the colors [here](https://old.discordjs.dev/#/docs/discord.js/14.14.1/typedef/ColorResolvable). (the strings are case-sensitive)');
			}

			// if the embed is too large
			if (error.code === 50035) {
				return await interaction.editReply('Your embed might be too big. Try making it shorter.');
			}

		}
		
	},
};