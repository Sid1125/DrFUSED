const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of available commands or information about a specific command.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command you want help with')),

    async execute(interaction) {
        const { commands } = interaction.client;

        // Define categorizedCommands
        const categorizedCommands = {
            fun: [],
            moderation: [],
            utility: [],
            roleManagement: [],
            music: [],
        };

        // Categorize commands
        commands.forEach(command => {
            if (command.category) {
                categorizedCommands[command.category].push(command);
            }
        });

        const commandName = interaction.options.getString('command');

        if (!commandName) {
            let currentPage = 0;
            const categories = Object.keys(categorizedCommands);
            const totalPages = categories.length;

            // Create the initial embed
            const helpEmbed = new EmbedBuilder()
                .setColor('#5865F2')  // Discord's blurple color
                .setTitle('📜 Command List')
                .setDescription('Use the arrows to navigate through the command categories.')
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setFooter({ text: `Page ${currentPage + 1} of ${totalPages}` })
                .setTimestamp();  // Adds a timestamp at the bottom

            // Function to update the embed with the current category
            const updateEmbed = () => {
                const category = categories[currentPage];
                const commandList = categorizedCommands[category]
                    .map(command => `**/${command.data.name}**: ${command.data.description}`)
                    .join('\n') || 'No commands available.';

                helpEmbed.setTitle(`📋 Commands in ${category.charAt(0).toUpperCase() + category.slice(1)}`)
                    .setDescription(commandList);
            };

            updateEmbed();  // Update for the initial category
            const message = await interaction.reply({ embeds: [helpEmbed], fetchReply: true });

            // Add reactions for pagination
            await message.react('⬅️');
            await message.react('➡️');

            const filter = (reaction, user) => {
                return ['⬅️', '➡️'].includes(reaction.emoji.name) && !user.bot;
            };

            const collector = message.createReactionCollector({ filter, time: 60000 });

            collector.on('collect', (reaction, user) => {
                reaction.users.remove(user.id);  // Remove user's reaction
                if (reaction.emoji.name === '➡️') {
                    if (currentPage < totalPages - 1) {
                        currentPage++;
                    }
                } else if (reaction.emoji.name === '⬅️') {
                    if (currentPage > 0) {
                        currentPage--;
                    }
                }
                updateEmbed();  // Update the embed with the new category
                helpEmbed.setFooter({ text: `Page ${currentPage + 1} of ${totalPages}` });
                message.edit({ embeds: [helpEmbed] });
            });

            collector.on('end', () => {
                message.reactions.removeAll();  // Clear all reactions after the collector ends
            });
        } else {
            const command = commands.get(commandName.toLowerCase());

            if (!command) {
                return interaction.reply("❌ That's not a valid command!");
            }

            // Create the embed for a specific command
            const helpEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(`❓ Help: /${command.data.name}`)
                .setDescription(`**Description**: ${command.data.description}`)
                .setThumbnail(interaction.client.user.displayAvatarURL());

            if (command.data.aliases) {
                helpEmbed.addFields({ name: '🔀 Aliases', value: command.data.aliases.join(', ') });
            }
            if (command.data.example) {
                helpEmbed.addFields({ name: '💡 Example', value: `\`${command.data.example}\`` });
            }

            return interaction.reply({ embeds: [helpEmbed] });
        }
    },
};
