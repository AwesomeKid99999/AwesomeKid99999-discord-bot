const { SlashCommandBuilder } = require('discord.js');

function toTitleCase(str) {
  return (str || '').replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function summarizeOptions(options = [], commandName = '') {
  // Produces a concise, human-readable summary of a command's options tree
  const lines = [];

  const walk = (opts, prefix = '') => {
    for (const opt of opts || []) {
      // Discord API types: 1=subcommand, 2=subcommand group, >=3 parameter types
      if (opt.type === 1) {
        // subcommand
        const usage = `${prefix}${opt.fullPath || opt.path}`;
        lines.push(`• \`${usage}\` — ${opt.description || 'No description'}`);
        // show param options if any
        const params = (opt.options || []).filter(o => o.type >= 3);
        if (params.length) {
          const paramsList = params.map(p => `${p.required ? `<${p.name}>` : `[${p.name}]`}`).join(' ');
          lines.push(`  ↳ Params: \`${paramsList}\``);
        }
      } else if (opt.type === 2) {
        // subcommand group
        const header = `${prefix}${opt.path}`;
        lines.push(`• \`${header}\` — ${opt.description || 'No description'}`);
        // propagate path down to children
        (opt.options || []).forEach(o => {
          o.path = `${opt.path} ${o.name}`;
          o.fullPath = `${opt.path} ${o.name}`;
        });
        walk(opt.options, prefix);
      }
    }
  };

  // Seed path for root-level items with command name prefix
  const prefix = commandName ? `/${commandName} ` : '/';
  const seeded = (options || []).map(o => ({ ...o, path: o.name, fullPath: o.name }));
  walk(seeded, prefix);
  return lines;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDMPermission(false)
    .setDescription('Show a quick help menu or details for a specific command.')
    .addStringOption(option => option
      .setName('command')
      .setDescription('Get detailed help for a specific command (name only, e.g., application)')
      .setMaxLength(50))
    .addBooleanOption(option => option
      .setName('ephemeral')
      .setDescription('Only you can see this response (defaults to no)')
    ),
  category: 'info',
  async execute(interaction) {
    const targetName = interaction.options.getString('command')?.toLowerCase();
    const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;
    const commandsUrl = process.env.COMMANDS_GUIDE_URL || (process.env.GITHUB_REPOSITORY ? `${process.env.GITHUB_REPOSITORY}/blob/main/docs/COMMANDS.md` : 'Not configured');

    const collection = interaction.client.commands;
    if (!collection) {
      return interaction.reply({ content: 'Command registry not available right now. Please try again in a moment.', ephemeral: true });
    }

    if (!targetName) {
      // Simple text help listing all commands grouped by category, plain text only
      const inviteUrl = process.env.BOT_INVITE_URL || (process.env.DISCORD_CLIENT_ID ? `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&scope=bot%20applications.commands` : 'Not configured');
      const supportUrl = process.env.SUPPORT_SERVER_URL || process.env.SUPPORT_INVITE || 'Not configured';

      const byCategory = new Map();
      for (const [name, cmd] of collection) {
        const cat = cmd.category || 'other';
        if (!byCategory.has(cat)) byCategory.set(cat, []);
        byCategory.get(cat).push(name);
      }

      const categoryLines = Array.from(byCategory.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([cat, names]) => `${toTitleCase(cat)} (${names.length}): ${names.sort().map(n => `\`/${n}\``).join(', ')}`);

      const lines = [
        'Help — Command Overview',
  'Use `/help command:<name>` for detailed usage of a specific command.',
        '',
        ...categoryLines,
        '',
        'Resources:',
        `Commands Guide: ${commandsUrl}`,
        `Invite: ${inviteUrl}`,
        `Support Server: ${supportUrl}`,
      ];

      // Discord message length limit ~2000 chars; split if needed
      const MAX = 1900; // leave some headroom
      let buffer = '';
      for (const line of lines) {
        if ((buffer + line + '\n').length > MAX) {
          await interaction[buffer === '' ? 'reply' : 'followUp']({ content: buffer.trim() || '\u200b', ephemeral });
          buffer = '';
        }
        buffer += line + '\n';
      }
      if (buffer.length) {
        await interaction[interaction.replied || interaction.deferred ? 'followUp' : 'reply']({ content: buffer.trim(), ephemeral });
      }
      return;
    }

    // Detailed help for a specific command
    const cmd = collection.get(targetName);
    if (!cmd) {
      // Suggest similar names
      const names = Array.from(collection.keys());
      const suggestions = names
        .filter(n => n.includes(targetName) || targetName.includes(n) || n.startsWith(targetName))
        .slice(0, 10)
        .map(n => `\`/${n}\``)
        .join(' • ');
      return interaction.reply({
        content: suggestions
          ? `I couldn't find \`/${targetName}\`. Did you mean: ${suggestions}?`
          : `I couldn't find \`/${targetName}\`. Try running \`/help\` without a command to browse categories.`,
        ephemeral: true,
      });
    }

    // Build an embed from the command's builder JSON
    let json;
    try {
      json = cmd.data?.toJSON?.();
    } catch {}

    const category = toTitleCase(cmd.category || 'other');
    const title = `/${json?.name || targetName}`;
    const description = json?.description || 'No description provided.';

    const inviteUrl = process.env.BOT_INVITE_URL || (process.env.DISCORD_CLIENT_ID ? `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&scope=bot%20applications.commands` : 'Not configured');
    const supportUrl = process.env.SUPPORT_SERVER_URL || process.env.SUPPORT_INVITE || 'Not configured';

    const linesDetail = [
      `Help — \`${title}\``,
      description,
      `Category: ${category}`,
    ];

    const options = json?.options || [];
    const optLines = options.length ? summarizeOptions(options, json?.name || targetName) : [];
    if (optLines.length) {
      linesDetail.push('', 'Usage:', ...optLines);
    }
    linesDetail.push('', 'Resources:', `Commands: ${commandsUrl}`, `Invite: ${inviteUrl}`, `Support Server: ${supportUrl}`);

    const content = linesDetail.join('\n').slice(0, 1995); // safety slice
    await interaction.reply({ content, ephemeral });
  },
};
