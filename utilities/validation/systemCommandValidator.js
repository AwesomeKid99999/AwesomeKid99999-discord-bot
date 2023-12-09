const config = require('config');
const embedOptions = config.get('embedOptions');
const systemOptions = config.get('systemOptions');
const { EmbedBuilder } = require('discord.js');

exports.notValidGuildId = async ({ interaction, executionId }) => {
    
    if (!systemOptions.systemGuildIds.includes(interaction.guildId)) {
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        `**${embedOptions.icons.warning} Oops!**\nNo permission to execute this command.\n\nThe command \`${interaction.commandName}\` cannot be executed in this server.`
                    )
                    .setColor(embedOptions.colors.warning)
                    .setFooter({ text: `Powered by Cadence Music Bot` })
            ]
        });

        console.debug(
            `User tried to use command '${interaction.commandName}' but system command cannot be executed in the specified guild.`
        );
        return true;
    }

    return false;
};
