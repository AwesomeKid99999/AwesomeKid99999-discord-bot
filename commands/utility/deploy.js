const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const { clientId, guildId, token } = require('../../config.json');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deploy')
		.setDMPermission(false)
		.setDescription('Deploys all commands. (OWNER ONLY)'),
		category: 'utility',
	async execute(interaction) {

		if (interaction.user.id !== "582305323063312384") {
			return interaction.reply({ content: 'Sorry, only the owner can deploy the commands.', ephemeral: true });
		}

const commands = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, '..');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		await interaction.reply(`Started refreshing ${commands.length} application (/) commands.`);
		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
		interaction.editReply(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();

	},
};