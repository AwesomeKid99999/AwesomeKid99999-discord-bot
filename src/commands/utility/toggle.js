const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { CommandToggle } = require('../../models');
const fs = require('node:fs');
const path = require('node:path');

// Get all available commands
function getAllCommands() {
    const commands = [];
    const excludedCommands = ['toggle', 'toggle_memes', 'commands', 'help', 'info', 'repository', 'setup', 'website', 'avatar', 'ping', 'time', 'placeholders']; // Exclude info/utility commands
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
                if ('data' in command && command.data.name && !excludedCommands.includes(command.data.name)) {
                    commands.push({
                        name: command.data.name,
                        description: command.data.description || 'No description',
                        category: command.category || commandFolder
                    });
                }
            } catch (error) {
                console.log(`Could not load command from ${filePath}`);
            }
        }
    }
    
    return commands;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('toggle')
        .setDMPermission(false)
        .setDescription('Toggle commands or features on/off for this server. (ADMIN ONLY)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('command')
                .setDescription('Toggle a specific command. (ADMIN ONLY)')
                .addStringOption(option =>
                    option
                        .setName('command')
                        .setDescription('The command to toggle')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addBooleanOption(option =>
                    option
                        .setName('state')
                        .setDescription('Set to true to enable, false to disable (omit to disable)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('module')
                .setDescription('Toggle an entire module on/off. (ADMIN ONLY)')
                .addStringOption(option =>
                    option
                        .setName('module')
                        .setDescription('The module to toggle')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Application', value: 'application' },
                            { name: 'Leveling', value: 'leveling' }
                        ))
                .addBooleanOption(option =>
                    option
                        .setName('state')
                        .setDescription('Set to true to enable, false to disable (omit to disable)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Show all commands and their toggle status'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable-all')
                .setDescription('Enable all commands'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable-all')
                .setDescription('Disable all commands')),
    category: 'utility',
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const commands = getAllCommands();
        const filtered = commands
            .filter(cmd => cmd.name.toLowerCase().startsWith(focusedValue.toLowerCase()))
            .slice(0, 25);
        await interaction.respond(
            filtered.map(cmd => ({ name: cmd.name, value: cmd.name }))
        );
    },
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const serverId = interaction.guild.id;
        const allCommands = getAllCommands();

        if (subcommand === 'command') {
            const commandName = interaction.options.getString('command').toLowerCase();
            const command = allCommands.find(cmd => cmd.name === commandName);

            if (!command) {
                return await interaction.reply({
                    content: '❌ Command not found!',
                    ephemeral: true
                });
            }

            // Check if user has admin permissions
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return await interaction.reply({
                    content: 'Sorry, you need the Manage Guild permission to use this command.',
                    ephemeral: true
                });
            }

            // Get the desired state (true/false/null for toggle)
            const desiredState = interaction.options.getBoolean('state');

            // Get or create toggle record
            let toggle = await CommandToggle.findOne({
                where: { serverId, commandName }
            });

            if (!toggle) {
                toggle = await CommandToggle.create({
                    serverId,
                    commandName,
                    enabled: desiredState !== null ? desiredState : false
                });
            } else {
                toggle.enabled = desiredState !== null ? desiredState : false;
                await toggle.save();
            }

            const status = toggle.enabled ? 'enabled' : 'disabled';
            await interaction.reply({ content: `\`${commandName}\` is now **${status}**` });
        } else if (subcommand === 'module') {
            // Check if user has admin permissions
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return await interaction.reply({
                    content: 'Sorry, you need the Manage Guild permission to use this command.',
                    ephemeral: true
                });
            }

            const moduleName = interaction.options.getString('module').toLowerCase();
            const validModules = ['application', 'leveling'];

            if (!validModules.includes(moduleName)) {
                return await interaction.reply({
                    content: '❌ Invalid module!',
                    ephemeral: true
                });
            }

            // Get all commands in the module
            const moduleCommands = allCommands.filter(cmd => cmd.category === moduleName);

            if (moduleCommands.length === 0) {
                return await interaction.reply({
                    content: `❌ No commands found in the **${moduleName}** module!`,
                    ephemeral: true
                });
            }

            // Get the desired state (true/false/null defaults to false)
            const desiredState = interaction.options.getBoolean('state');

            const newState = desiredState !== null ? desiredState : false;

            // Toggle all commands in the module
            for (const cmd of moduleCommands) {
                await CommandToggle.upsert({
                    serverId,
                    commandName: cmd.name,
                    enabled: newState
                });
            }

            const status = newState ? 'enabled' : 'disabled';
            const commandList = moduleCommands.map(c => `\`${c.name}\``).join(', ');
            await interaction.reply({ content: `**${moduleName}** module is now **${status}**\n${commandList}` });
        } else if (subcommand === 'list') {
            // Check if user has admin permissions
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return await interaction.reply({
                    content: 'Sorry, you need the Manage Guild permission to view this list.',
                    ephemeral: true
                });
            }

            // Get all toggles for this server
            const toggles = await CommandToggle.findAll({
                where: { serverId }
            });

            const toggleMap = new Map(toggles.map(t => [t.commandName, t.enabled]));

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
                        const isEnabled = toggleMap.get(cmd.name) !== false; // Default to enabled
                        const status = isEnabled ? '✅' : '❌';
                        return `${status} \`${cmd.name}\``;
                    })
                    .join('\n');

                if (commandList) {
                    message += `**${category}**\n${commandList}\n\n`;
                }
            }

            await interaction.reply({ content: message, ephemeral: true });
        } else if (subcommand === 'enable-all') {
            // Check if user has admin permissions
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return await interaction.reply({
                    content: 'Sorry, you need the Manage Guild permission to use this command.',
                    ephemeral: true
                });
            }

            // Delete all disabled commands for this server (or set all to enabled)
            await CommandToggle.destroy({
                where: { serverId }
            });

            await interaction.reply({ content: 'All commands have been **enabled** for this server' });
        } else if (subcommand === 'disable-all') {
            // Check if user has Manage Guild permissions
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return await interaction.reply({
                    content: 'Sorry, you need the Manage Guild permission to use this command.',
                    ephemeral: true
                });
            }

            // Disable all commands
            for (const cmd of allCommands) {
                await CommandToggle.upsert({
                    serverId,
                    commandName: cmd.name,
                    enabled: false
                });
            }

            await interaction.reply({ content: 'All commands have been **disabled** for this server' });
        }
    }
};
