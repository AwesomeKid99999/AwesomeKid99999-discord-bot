const { Events } = require('discord.js');
const buttonHandler = require('../../handlers/buttonHandler')
const {acceptApplication, denyApplication} = require("../../helpers/applicationActions");
const { CommandToggle } = require('../../models');


module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			// Build possible invoked command names (support subcommands and groups)
			const invokedNames = [];
			try {
				const group = interaction.options.getSubcommandGroup(false);
				const sub = interaction.options.getSubcommand(false);
				if (group && sub) invokedNames.push(`${interaction.commandName} ${group} ${sub}`);
				if (sub) invokedNames.push(`${interaction.commandName} ${sub}`);
			} catch (e) {
				// no subcommands
			}
			// Only include base command when there is no subcommand.
			if (invokedNames.length === 0) invokedNames.push(interaction.commandName);

			// Check toggles in order (most specific -> least specific)
			let toggle = null;
			for (const name of invokedNames) {
				toggle = await CommandToggle.findOne({
					where: {
						serverId: interaction.guild.id,
						commandName: String(name).toLowerCase()
					}
				});
				if (toggle) break;
			}

			if (toggle && !toggle.enabled) {
				return await interaction.reply({
					content: `❌ The \`${invokedNames[0]}\` command is currently disabled on this server.`,
					ephemeral: true
				});
			}

			try {
				await command.execute(interaction);
				console.log(`${interaction.user.tag} at ${interaction.guild.name} triggered an interaction named ${interaction.commandName}.`)
			} catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.log(`${interaction.user.tag} at ${interaction.guild.name} tried executing ${interaction.commandName}, but there was an error.`)

				console.error(error);
			}
		} else if (interaction.isAutocomplete()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.autocomplete(interaction);
			} catch (error) {
				console.error(`Error executing autocomplete for ${interaction.commandName}`);
				console.error(error);
			}
		} else if (interaction.isButton()) {

			await buttonHandler(interaction);

		} else if (interaction.isStringSelectMenu()) {


		} else if (interaction.isModalSubmit()) {
			const [action, userId, applicationType] = interaction.customId.split('-');
			const serverId = interaction.guild.id;

			// Defer the modal interaction to prevent timeout
			await interaction.deferReply({ ephemeral: true });

			if (action === 'accept_reason_modal') {
				const reason = interaction.fields.getTextInputValue('reason');
				await acceptApplication(interaction, userId, reason, serverId, applicationType);
			} else if (action === 'deny_reason_modal') {
				const reason = interaction.fields.getTextInputValue('reason');
				await denyApplication(interaction, userId, reason, serverId, applicationType);
			}
		}

	},
};

