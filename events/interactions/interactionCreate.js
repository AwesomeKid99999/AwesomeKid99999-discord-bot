const { Events } = require('discord.js');
const buttonHandler = require('../../handlers/buttonHandler')
const {acceptApplication, denyApplication} = require("../../helpers/applicationActions");


module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
				console.log(`${interaction.user.tag} at ${interaction.guild.name} triggered an interaction named ${interaction.commandName}.`)
			} catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.log(`${interaction.user.tag} at ${interaction.guild.name} tried executing ${interaction.commandName}, but there was an error.`)

				console.error(error);
			}
		} else if (interaction.isButton()) {

			await buttonHandler(interaction);

		} else if (interaction.isStringSelectMenu()) {


		} else if (interaction.isModalSubmit()) {
			const [action, userId] = interaction.customId.split('-');
			const serverId = interaction.guild.id;

			if (action === 'accept_reason_modal') {
				const reason = interaction.fields.getTextInputValue('reason');
				await acceptApplication(interaction, userId, reason, serverId);
			} else if (action === 'deny_reason_modal') {
				const reason = interaction.fields.getTextInputValue('reason');
				await denyApplication(interaction, userId, reason, serverId);
			}
		}

	},
};

