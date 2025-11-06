const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('message')
		.setDescription('Make me send a direct message to someone.')
		.setDMPermission(false)
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The member to message')
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName('message')
				.setDescription('The message you want to send')
				.setRequired(true)
		)
		.addBooleanOption(option =>
			option
				.setName('anonymous')
				.setDescription('Whether you want your message to be anonymous or not')
		),

	category: 'fun',

	async execute(interaction) {
		const targetMember = interaction.options.getMember('target'); // Guild member
		const targetUser = interaction.options.getUser('target'); // General user
		const messageContent = interaction.options.getString('message');
		const isAnonymous = interaction.options.getBoolean('anonymous') || false;

		// Validate target
		if (!targetMember && !targetUser) {
			return await interaction.reply({
				content: `Sorry, I cannot find that user.`,
				ephemeral: true,
			});
		}

		// Fallback to user if target is not a member
		const target = targetMember || targetUser;

		// Check if target is the bot
		if (target.id === interaction.client.user.id) {
			return await interaction.reply({
				content: `I cannot DM myself, silly!`,
				ephemeral: true,
			});
		}

		// Check if target is a bot
		if (target.user.bot) {
			return await interaction.reply({
				content: `Sorry, I cannot message bots.`,
				ephemeral: true,
			});
		}

		// Check message length
		if (messageContent.length > 1811) {
			return await interaction.reply({
				content: `Please make your message shorter.`,
				ephemeral: true,
			});
		}

		// Try to send the DM
		try {
			if (isAnonymous) {
				// Anonymous message
				await target.send(
					`Someone from **${interaction.guild.name}** has sent you a message.\n**Message:** ${messageContent}`
				);
				await interaction.reply({
					content: `Successfully sent an anonymous message to **${target.user.tag}**.`,
					ephemeral: true,
				});
			} else {
				// Non-anonymous message
				await target.send(
					`**${interaction.user.tag}** from **${interaction.guild.name}** has sent you a message.\n**Message:** ${messageContent}`
				);
				await interaction.reply({
					content: `Successfully sent **${target.user.tag}** a message.\n**Message:** ${messageContent}`,
					ephemeral: true,
				});
			}
		} catch (error) {
			console.error('Failed to send DM:', error);

			// Handle case when the user has DMs disabled
			await interaction.reply({
				content: `Failed to send the message. **${target.user.tag}** may have their DMs disabled.`,
				ephemeral: true,
			});
		}
	},
};