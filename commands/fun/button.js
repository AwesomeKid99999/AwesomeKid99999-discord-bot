const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle  } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('button')
		.setDMPermission(false)
		.setDescription('Generates a clickable button!')
		.addStringOption(option => option
			.setName('label')
			.setDescription('The label of the button')
			.setMaxLength(80)
			.setRequired(true))
		.addStringOption(option => option
			.setName('color')
			.setDescription('The color of the button')
			.addChoices(
				{ name: 'blue', value: 'blue' },
				{ name: 'gray', value: 'gray' },
				{ name: 'green', value: 'green' },
				{ name: 'red', value: 'red' },
			)),
		category: 'fun',
	async execute(interaction) {
		const label = interaction.options.getString('label');

		const color = interaction.options.getString('color');
		let buttonStyle;

		if (color === 'blue' || !color) buttonStyle = ButtonStyle.Primary;
		if (color === 'gray') buttonStyle = ButtonStyle.Secondary;
		if (color === 'green') buttonStyle = ButtonStyle.Success;
		if (color === 'red') buttonStyle = ButtonStyle.Danger;


		const button = new ButtonBuilder()
			.setCustomId(`generated_button-${interaction.user.id}`)
			.setLabel(label)
			.setStyle(buttonStyle);

		const row = new ActionRowBuilder()
			.addComponents(button);

		await interaction.reply({
			content: `Here is your button:`,
			components: [row],
		});

	},
};