const { SlashCommandBuilder } = require('discord.js');
const { Guild, Application } = require('../../models');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('applicationlist')
        .setDescription('List all application types and their current status (open/closed)')
        .setDMPermission(false),

    async execute(interaction) {
        const serverId = interaction.guild.id;

        try {
            // Get all application toggle records for this server
            const applicationToggles = await Application.findAll({
                where: { 
                    serverId: serverId,
                    userId: 'SYSTEM_TOGGLE'
                },
                order: [['applicationType', 'ASC']]
            });

            if (applicationToggles.length === 0) {
                return await interaction.reply({
                    content: 'No application types have been configured yet. Use `/applicationtoggle` to set up application types.',
                    ephemeral: true,
                });
            }

            // Create plain text message
            let message = '**Application Types Status**\n';
            message += 'Current status of all application types in this server\n\n';

            // Add each application type
            for (const toggle of applicationToggles) {
                const status = toggle.applicationToggle ? '🟢 Open' : '🔴 Closed';
                const typeName = toggle.applicationType;
                message += `**${typeName} Applications:** ${status}\n`;
            }

            // Add summary
            const openCount = applicationToggles.filter(t => t.applicationToggle).length;
            const closedCount = applicationToggles.length - openCount;
            
            message += '\n**Summary:**\n';
            message += `Open: ${openCount}\n`;
            message += `Closed: ${closedCount}\n`;
            message += `Total: ${applicationToggles.length}`;

            await interaction.reply({ content: message });

        } catch (error) {
            console.error('Error fetching application list:', error);
            await interaction.reply({
                content: 'An error occurred while fetching the application list. Please try again.',
                ephemeral: true,
            });
        }
    },
};
