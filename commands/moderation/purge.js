const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDMPermission(false)
		.setDescription('Bulk delete up to 100 messages.')
		.addIntegerOption(option => option.setName('amount').setDescription('Number of messages to delete')),
	async execute(interaction) {
		const amount = interaction.options.getInteger('amount');
		
        const channel = interaction.channel;
		await interaction.deferReply({ephemeral: true});
		
		
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
			return interaction.editReply('You do not have permission to delete messages.');
		}
		if (amount < 1 || amount > 100) {
			return interaction.editReply('You need to input a number between 1 and 100.');
		}
		
		try {( interaction.channel.bulkDelete(amount, filterOld = true))
					.then(messages => console.log(`Bulk deleted ${messages.size} messages`),
		)} catch(error)  
		{
			console.error(error);
			return interaction.editReply('There was an error trying to delete messages in this channel!');
		};

const messages = await interaction.channel.bulkDelete(amount, filterOld = true);
await interaction.editReply({content: `Successfully deleted ${messages.size} messages.`, ephemeral: true });
 await interaction.channel.send(`**${interaction.user.tag}** deleted ${messages.size} messages.`);
         const sentMessage = await channel.messages.fetch({ limit: 1 });
         await wait(5000);
        if (sentMessage.size > 0) {
          const recentMessage = sentMessage.first();
         return recentMessage.delete();
        }
	},
};
