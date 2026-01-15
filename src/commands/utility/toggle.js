const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { CommandToggle } = require('../../models');
const fs = require('node:fs');
const path = require('node:path');

// Get all available commands (including subcommands and subcommand groups)
function getAllCommands() {
	const commands = [];
	const excludedCommands = [
		'toggle',
		'toggle_memes',
		'commands',
		'help',
		'info',
		'repository',
		'setup',
		'website',
		'avatar',
		'ping',
		'time',
		'placeholders'
	];

	const commandFoldersPath = path.join(__dirname, '../');
	const commandFolders = fs.readdirSync(commandFoldersPath).filter(file => !file.endsWith('.js'));

	for (const commandFolder of commandFolders) {
		const commandsPath = path.join(commandFoldersPath, commandFolder);
		if (!fs.statSync(commandsPath).isDirectory()) continue;

		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			try {
				const command = require(filePath);
				if (!('data' in command) || !command.data.name) continue;
				if (excludedCommands.includes(command.data.name)) continue;

				// Prefer JSON representation for option types
				let opts = [];
				if (typeof command.data.toJSON === 'function') {
					const json = command.data.toJSON();
					if (Array.isArray(json.options)) opts = json.options;
				} else if (Array.isArray(command.data.options)) {
					opts = command.data.options
						.map(o => (o && typeof o.toJSON === 'function' ? o.toJSON() : o))
						.filter(Boolean);
				}

				const hasSubcommands = opts.some(opt => {
					if (!opt) return false;
					const t = opt.type || String(opt.type).toUpperCase();
					return t === 1 || t === 2 || String(t).toUpperCase() === 'SUB_COMMAND' || String(t).toUpperCase() === 'SUB_COMMAND_GROUP';
				});

				if (!hasSubcommands) {
					commands.push({
						name: command.data.name,
						description: command.data.description || 'No description',
						category: command.category || commandFolder
					});
				}

				for (const opt of opts) {
					const isSubcommand = opt && (opt.type === 1 || String(opt.type).toUpperCase() === 'SUB_COMMAND');
					if (isSubcommand && opt.name) {
						commands.push({
							name: `${command.data.name} ${opt.name}`,
							description: opt.description || `${command.data.name} ${opt.name}`,
							category: command.category || commandFolder
						});
					}

					const isGroup = opt && (opt.type === 2 || String(opt.type).toUpperCase() === 'SUB_COMMAND_GROUP');
					if (isGroup && opt.name && Array.isArray(opt.options)) {
						for (const child of opt.options) {
							const isChildSub = child && (child.type === 1 || String(child.type).toUpperCase() === 'SUB_COMMAND');
							if (isChildSub && child.name) {
								commands.push({
									name: `${command.data.name} ${opt.name} ${child.name}`,
									description: child.description || `${command.data.name} ${opt.name} ${child.name}`,
									category: command.category || commandFolder
								});
							}
						}
					}
				}
			} catch (error) {
				console.log(`Could not load command from ${filePath}`);
			}
		}
	}

	return commands;
}

function splitMessageIntoChunks(message, maxLength = 2000) {
	const chunks = [];
	let chunk = '';
	for (const line of String(message).split('\n')) {
		if (chunk.length + line.length + 1 > maxLength) {
			if (chunk) chunks.push(chunk);
			chunk = '';
		}
		chunk += `${line}\n`;
	}
	if (chunk) chunks.push(chunk);
	return chunks;
}

function getCommandGroupNames(allCommands) {
	const childrenByBase = new Map();
	for (const cmd of allCommands) {
		const parts = String(cmd.name).split(' ');
		if (parts.length < 2) continue;
		const base = parts[0];
		childrenByBase.set(base, (childrenByBase.get(base) || 0) + 1);
	}
	return Array.from(childrenByBase.keys()).sort();
}

function getSubcommandGroupNames(allCommands) {
	const groups = new Map();
	for (const cmd of allCommands) {
		const parts = String(cmd.name).split(' ');
		if (parts.length < 3) continue;
		const key = `${parts[0]} ${parts[1]}`;
		groups.set(key, (groups.get(key) || 0) + 1);
	}
	return Array.from(groups.keys()).sort();
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('toggle')
		.setDMPermission(false)
		.setDescription('Toggle commands or features on/off for this server. (STAFF ONLY)')
		.addSubcommand(subcommand =>
			subcommand
				.setName('command')
				.setDescription('Toggle a specific command. (STAFF ONLY)')
				.addStringOption(option =>
					option
						.setName('command')
						.setDescription('The command to toggle')
						.setRequired(true)
						.setAutocomplete(true))
				.addBooleanOption(option =>
					option
						.setName('enabled')
						.setDescription('Whether the command should be enabled')
						.setRequired(false)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('module')
				.setDescription('Toggle an entire module on/off. (STAFF ONLY)')
				.addStringOption(option =>
					option
						.setName('module')
						.setDescription('The module to toggle')
						.setRequired(true)
						.addChoices(
							{ name: 'Application', value: 'application' },
							{ name: 'Leveling', value: 'leveling' },
							{ name: 'Moderation', value: 'moderation' }
						))
				.addBooleanOption(option =>
					option
						.setName('enabled')
						.setDescription('Whether the module should be enabled')
						.setRequired(false)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('command-group')
				.setDescription('Toggle ALL subcommands of a command. (STAFF ONLY)')
				.addStringOption(option =>
					option
						.setName('command')
						.setDescription('The top-level command (e.g. embed)')
						.setRequired(true)
						.setAutocomplete(true))
				.addBooleanOption(option =>
					option
						.setName('enabled')
						.setDescription('Whether the command group should be enabled')
						.setRequired(false)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('subcommand-group')
				.setDescription('Toggle ALL subcommands inside a subcommand group. (STAFF ONLY)')
				.addStringOption(option =>
					option
						.setName('group')
						.setDescription('The subcommand group (e.g. admin role)')
						.setRequired(true)
						.setAutocomplete(true))
				.addBooleanOption(option =>
					option
						.setName('enabled')
						.setDescription('Whether the subcommand group should be enabled')
						.setRequired(false)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Show all commands and their toggle status. (STAFF ONLY)'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('enable-all')
				.setDescription('Enable all commands. (STAFF ONLY)'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('disable-all')
				.setDescription('Disable all commands. (STAFF ONLY)')),
	category: 'utility',
	async autocomplete(interaction) {
		const focused = interaction.options.getFocused(true);
		const focusedValue = focused?.value ?? '';
		const sub = interaction.options.getSubcommand();
		const commands = getAllCommands();

		let choices = [];
		if (sub === 'command' && focused?.name === 'command') {
			choices = commands.map(c => c.name);
		} else if (sub === 'command-group' && focused?.name === 'command') {
			choices = getCommandGroupNames(commands);
		} else if (sub === 'subcommand-group' && focused?.name === 'group') {
			choices = getSubcommandGroupNames(commands);
		} else {
			choices = commands.map(c => c.name);
		}

		const filtered = choices
			.filter(name => name.toLowerCase().startsWith(String(focusedValue).toLowerCase()))
			.slice(0, 25);

		await interaction.respond(filtered.map(name => ({ name, value: name })));
	},
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const serverId = interaction.guild.id;
		const allCommands = getAllCommands();

		if (subcommand === 'command') {
			const commandNameInput = interaction.options.getString('command');
			const commandName = commandNameInput ? commandNameInput.toLowerCase() : '';
			const command = allCommands.find(cmd => cmd.name.toLowerCase() === commandName);

			if (!command) {
				return await interaction.reply({ content: '❌ Command not found!', ephemeral: true });
			}

			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
				return await interaction.reply({ content: 'Sorry, you need the Manage Server permission to use this command.', ephemeral: true });
			}

			const desiredState = interaction.options.getBoolean('enabled');

			let toggle = await CommandToggle.findOne({ where: { serverId, commandName } });
			if (!toggle) {
				toggle = await CommandToggle.create({
					serverId,
					commandName: command.name.toLowerCase(),
					enabled: desiredState !== null ? desiredState : false
				});
			} else {
				toggle.enabled = desiredState !== null ? desiredState : false;
				await toggle.save();
			}

			const status = toggle.enabled ? 'enabled' : 'disabled';
			await interaction.reply({ content: `\`${command.name}\` is now **${status}**` });
			return;
		}

		if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
			return await interaction.reply({ content: 'Sorry, you need the Manage Server permission to use this command.', ephemeral: true });
		}

		if (subcommand === 'module') {
			const moduleName = interaction.options.getString('module').toLowerCase();
			const validModules = ['application', 'leveling', 'moderation'];
			if (!validModules.includes(moduleName)) {
				return await interaction.reply({ content: '❌ Invalid module!', ephemeral: true });
			}

			await interaction.deferReply({ ephemeral: true });

			const moduleCommands = allCommands.filter(cmd => cmd.category === moduleName);
			if (moduleCommands.length === 0) {
				return await interaction.editReply({ content: `❌ No commands found in the **${moduleName}** module!` });
			}

			const desiredState = interaction.options.getBoolean('enabled');
			const newState = desiredState !== null ? desiredState : false;
			for (const cmd of moduleCommands) {
				await CommandToggle.upsert({
					serverId,
					commandName: cmd.name.toLowerCase(),
					enabled: newState
				});
			}

			const status = newState ? 'enabled' : 'disabled';
			const commandList = moduleCommands.map(c => `\`${c.name}\``).join(', ');
			const message = `**${moduleName}** module is now **${status}**\n${commandList}`;
			const chunks = splitMessageIntoChunks(message, 2000);
			await interaction.editReply({ content: chunks[0] || 'No commands found.' });
			for (let i = 1; i < chunks.length; i++) {
				await interaction.followUp({ content: chunks[i], ephemeral: true });
			}
			return;
		}

		if (subcommand === 'command-group') {
			const base = interaction.options.getString('command');
			const baseLower = String(base).toLowerCase();
			const desiredState = interaction.options.getBoolean('enabled');
			const newState = desiredState !== null ? desiredState : false;

			await interaction.deferReply({ ephemeral: true });

			const children = allCommands.filter(c => String(c.name).toLowerCase().startsWith(`${baseLower} `));
			if (children.length === 0) {
				return await interaction.editReply({ content: `❌ No subcommands found under \`${base}\`.` });
			}

			for (const child of children) {
				await CommandToggle.upsert({
					serverId,
					commandName: String(child.name).toLowerCase(),
					enabled: newState
				});
			}

			const status = newState ? 'enabled' : 'disabled';
			const commandList = children.map(c => `\`${c.name}\``).join(', ');
			const message = `\`${base}\` subcommands are now **${status}**.\n${commandList}`;
			const chunks = splitMessageIntoChunks(message, 2000);
			await interaction.editReply({ content: chunks[0] || 'Done.' });
			for (let i = 1; i < chunks.length; i++) {
				await interaction.followUp({ content: chunks[i], ephemeral: true });
			}
			return;
		}

		if (subcommand === 'subcommand-group') {
			const group = interaction.options.getString('group');
			const groupLower = String(group).toLowerCase();
			const desiredState = interaction.options.getBoolean('enabled');
			const newState = desiredState !== null ? desiredState : false;

			await interaction.deferReply({ ephemeral: true });

			const children = allCommands.filter(c => String(c.name).toLowerCase().startsWith(`${groupLower} `));
			if (children.length === 0) {
				return await interaction.editReply({ content: `❌ No subcommands found under \`${group}\`.` });
			}

			for (const child of children) {
				await CommandToggle.upsert({
					serverId,
					commandName: String(child.name).toLowerCase(),
					enabled: newState
				});
			}

			const status = newState ? 'enabled' : 'disabled';
			const commandList = children.map(c => `\`${c.name}\``).join(', ');
			const message = `\`${group}\` subcommands are now **${status}**.\n${commandList}`;
			const chunks = splitMessageIntoChunks(message, 2000);
			await interaction.editReply({ content: chunks[0] || 'Done.' });
			for (let i = 1; i < chunks.length; i++) {
				await interaction.followUp({ content: chunks[i], ephemeral: true });
			}
			return;
		}

		if (subcommand === 'list') {
			await interaction.deferReply({ ephemeral: true });

			const toggles = await CommandToggle.findAll({ where: { serverId } });
			const toggleMap = new Map(toggles.map(t => [String(t.commandName).toLowerCase(), t.enabled]));

			const commandsByCategory = {};
			for (const cmd of allCommands) {
				if (!commandsByCategory[cmd.category]) commandsByCategory[cmd.category] = [];
				commandsByCategory[cmd.category].push(cmd);
			}

			let message = '**Command Toggle Status**\n\n';
			for (const [category, commands] of Object.entries(commandsByCategory)) {
				const commandList = commands
					.map(cmd => {
						const isEnabled = toggleMap.get(cmd.name.toLowerCase()) !== false;
						const status = isEnabled ? '✅' : '❌';
						return `${status} \`${cmd.name}\``;
					})
					.join('\n');
				if (commandList) message += `**${category}**\n${commandList}\n\n`;
			}

			const chunks = splitMessageIntoChunks(message, 2000);
			await interaction.editReply({ content: chunks[0] || 'No commands found.' });
			for (let i = 1; i < chunks.length; i++) {
				await interaction.followUp({ content: chunks[i], ephemeral: true });
			}
			return;
		}

		if (subcommand === 'enable-all') {
			await interaction.deferReply({ ephemeral: true });
			for (const cmd of allCommands) {
				await CommandToggle.upsert({
					serverId,
					commandName: cmd.name.toLowerCase(),
					enabled: true
				});
			}
			await interaction.editReply({ content: 'All commands have been **enabled** for this server.' });
			return;
		}

		if (subcommand === 'disable-all') {
			await interaction.deferReply({ ephemeral: true });
			for (const cmd of allCommands) {
				await CommandToggle.upsert({
					serverId,
					commandName: cmd.name.toLowerCase(),
					enabled: false
				});
			}
			await interaction.editReply({ content: 'All commands have been **disabled** for this server.' });
			return;
	     await interaction.reply({ content: chunks[0] || 'Done.', ephemeral: true });
            for (let i = 1; i < chunks.length; i++) {
                await interaction.followUp({ content: chunks[i], ephemeral: true });
            }
        } else if (subcommand === 'list') {
            // Check if user has admin permissions
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return await interaction.reply({
                    content: 'Sorry, you need the Manage Server permission to view this list.',
                    ephemeral: true
                });
            }
            await interaction.deferReply({ ephemeral: true });

            // Get all toggles for this server
            const toggles = await CommandToggle.findAll({
                where: { serverId }
            });

            const toggleMap = new Map(toggles.map(t => [String(t.commandName).toLowerCase(), t.enabled]));


            // Group commands by category
            const commandsByCategory = {};
            for (const cmd of allCommands) {
                if (!commandsByCategory[cmd.category]) {
                    commandsByCategory[cmd.category] = [];
                }
                commandsByCategory[cmd.category].push(cmd);
            }

            // Create text message with command status
            let message = '**Command Toggle Status**\n\n';

            for (const [category, commands] of Object.entries(commandsByCategory)) {
                const commandList = commands
                    .map(cmd => {
                        const isEnabled = toggleMap.get(cmd.name.toLowerCase()) !== false; // Default to enabled
                        const status = isEnabled ? '✅' : '❌';
                        return `${status} \`${cmd.name}\``;
                    })
                    .join('\n');

                if (commandList) {
                    message += `**${category}**\n${commandList}\n\n`;
                }
            }

            const chunks = splitMessageIntoChunks(message, 2000);
            await interaction.editReply({ content: chunks[0] || 'No commands found.', ephemeral: true });
            for (let i = 1; i < chunks.length; i++) {
                await interaction.followUp({ content: chunks[i], ephemeral: true });
            }
        } else if (subcommand === 'enable-all') {
            // Check if user has admin permissions
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return await interaction.reply({
                    content: 'Sorry, you need the Manage Server permission to use this command.',
                    ephemeral: true
                });
            }

            await interaction.deferReply();

            // Delete all disabled commands for this server (or set all to enabled)
            for (const cmd of allCommands) {
                await CommandToggle.upsert({
                    serverId,
                    commandName: cmd.name.toLowerCase(),
                    enabled: true
                });
            }


            await interaction.editReply({ content: 'All commands have been **enabled** for this server.' });
        } else if (subcommand === 'disable-all') {
            // Check if user has Manage Server permissions
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return await interaction.reply({
                    content: 'Sorry, you need the Manage Server permission to use this command.',
                    ephemeral: true
                });
            }

            await interaction.deferReply();
            // Disable all commands
            for (const cmd of allCommands) {
                await CommandToggle.upsert({
                    serverId,
                    commandName: cmd.name.toLowerCase(),
                    enabled: false
                });
            }

            await interaction.editReply({ content: 'All commands have been **disabled** for this server.' });
        }
    }
};
