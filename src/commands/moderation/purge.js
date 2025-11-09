const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDMPermission(false)
		.setDescription('Bulk delete messages. (STAFF ONLY)')
		.addIntegerOption(option => option
			.setName('amount')
			.setDescription('Number of messages to delete')
			.setMinValue(1)
			.setMaxValue(1000)
			.setRequired(true)), // Limit to 1000 messages to prevent overuse
	category: 'moderation',
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const amount = interaction.options.getInteger('amount');
		const botMember = interaction.guild.members.cache.get(interaction.client.user.id);

		// Check Permissions
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
			return interaction.editReply(':warning: You do not have permission to delete messages.');
		}
		if (!botMember.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
			return interaction.editReply(':warning: I do not have permission to delete messages.');
		}

		let deletedTotal = 0;

		try {
			while (deletedTotal < amount) {
				const deleteCount = Math.min(amount - deletedTotal, 100); // Up to 100 at a time

				// Fetch messages
				const fetchedMessages = await interaction.channel.messages.fetch({ limit: deleteCount});
				if (fetchedMessages.size === 0) break; // Stop if no more messages left

				// Delete messages and update count
				const deletedMessages = await interaction.channel.bulkDelete(fetchedMessages, true);
				deletedTotal += deletedMessages.size;
				await wait(3000);

				// If fewer than expected were deleted, break the loop
				if (deletedMessages.size < deleteCount) break;
			}

			if (deletedTotal == 0) {
				return await interaction.editReply(`❌ There were no messages found to delete. Make sure that messages are under 2 weeks old.`);

			}

			await interaction.editReply(`✅ Successfully deleted **${deletedTotal}** messages.`);
			const logMessage = await interaction.channel.send(`**${interaction.user.tag}** deleted **${deletedTotal}** messages.`);

			// Auto-delete the confirmation message after 5 seconds
			await wait(5000);
			await logMessage.delete().catch(() => {});

		} catch (error) {
			console.error(error);
			return interaction.editReply('⚠️ There was an error trying to delete messages in this channel!');
		}
	},
};