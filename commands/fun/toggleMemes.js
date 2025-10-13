const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Guild } = require('../../models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('toggle_memes')
		.setDescription('Enable or disable the memes (six-seven, 9+10=21, etc.) in this server')
		.setDMPermission(false)
		.addBooleanOption(option => option
			.setName('enabled')
			.setDescription('Set to true to enable, false/empty to disable')),
	category: 'fun',
	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
			return interaction.reply({ content: 'You do not have permission to run this command.', ephemeral: true });
		}

		const serverId = interaction.guild.id;
		const enabled = interaction.options.getBoolean('enabled');

		let guild = await Guild.findOne({ where: { serverId } });
		if (!guild) {
			guild = await Guild.create({ serverId });
		}

		await guild.update({ memesEnabled: enabled });

		return interaction.reply({ content: `Memes have been ${enabled ? 'enabled' : 'disabled'} for this server.`, ephemeral: true });
	}
};


