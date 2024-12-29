const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDMPermission(false)
		.setDescription('Bulk delete up to 100 messages.')
		.addIntegerOption(option => option
			.setName('amount')
			.setDescription('Number of messages to delete')),
	async execute(interaction) {
		
		await interaction.deferReply({ephemeral: true});
		const amount = await interaction.options.getInteger('amount');
		
		
		const botMember = await interaction.guild.members.cache.get(interaction.client.user.id);

		if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
			return interaction.editReply(':warning: You do not have permission to delete messages.');
		}
		if (amount < 2 || amount > 100) {
			return interaction.editReply(':warning: You need to input a number between 2 and 100.');
		}
		

		if (!botMember.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
			return interaction.editReply(':warning: I do not have permission to delete messages.');
		}

		try {( interaction.channel.bulkDelete(amount, filterOld = true))
			.then(messages => console.log(`Bulk deleted ${messages.size} messages`),
		)} catch(error) {
			console.error(error);
			return interaction.editReply('There was an error trying to delete messages in this channel!');
		}
		const messages = await interaction.channel.bulkDelete(amount, filterOld = true);
 		await interaction.editReply({content: `Successfully deleted ${messages.size} messages.`});
 		await interaction.channel.send(`**${interaction.user.tag}** deleted ${messages.size} messages.`);
 		const sentMessage = await interaction.channel.messages.fetch({ limit: 1 });
 		await wait(5000);
		if (sentMessage.size > 0) {
  			const recentMessage = sentMessage.first();
 			return recentMessage.delete();
		}

	},
};
