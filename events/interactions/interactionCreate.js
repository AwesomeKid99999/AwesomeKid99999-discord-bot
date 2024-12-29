const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
            console.log(`${interaction.user.tag} in #${interaction.channel.name} at ${interaction.guild.name} triggered an interaction named ${interaction.commandName}.`)
		} catch (error) {
			console.error(`${interaction.user.tag} in #${interaction.channel.name} at ${interaction.guild.name} tried executing ${interaction.commandName}, but there was an error.`);
			console.error(error);
		}
	},
};