const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of available commands or information about a specific command.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command you want help with')),
    category: 'utility',

    async execute(interaction) {
        const { commands } = interaction.client;

        // Define categorizedCommands, including the game category
        const categorizedCommands = {
            fun: [],
            moderation: [],
            utility: [],
            roleManagement: [],
            music: [],
            game: [],
            chatbot: [],
            giveaway: [],
        };

        // Categorize commands
        commands.forEach(command => {
            if (command.category && categorizedCommands[command.category]) {
                categorizedCommands[command.category].push(command);
            } else {
                console.warn(`Command ${command.data.name} is missing a valid category or category does not exist.`);
            }
        });

        const commandName = interaction.options.getString('command');

        if (!commandName) {
            const categories = Object.keys(categorizedCommands);

            // Create the initial embed
            const helpEmbed = new EmbedBuilder()
                .setColor('#5865F2')  // Discord's blurple color
                .setTitle('📜 Command List')
                .setDescription('Select a category to view its commands:')
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setTimestamp();  // Adds a timestamp at the bottom

            // Function to update the embed with the current category
            const updateEmbed = (category) => {
                const commandList = categorizedCommands[category]
                    .map(command => {
                        // Prepare the command and subcommand display
                        let commandDisplay = `**/${command.data.name}**: ${command.data.description}`;
                        
                        // Check if the command has subcommands
                        if (command.data.options && command.data.options.length > 0) {
                            const subcommandsDisplay = command.data.options
                                .filter(option => option.type === 1) // Subcommand type
                                .map(subcommand => `  - **/${command.data.name} ${subcommand.name}**: ${subcommand.description}`)
                                .join('\n');
                            commandDisplay += `\n${subcommandsDisplay}`; // Append subcommands to command
                            return commandDisplay;}
                        
                        
                    })
                    .join('\n') || 'No commands available.';

                helpEmbed.setTitle(`📋 Commands in ${category.charAt(0).toUpperCase() + category.slice(1)}`)
                    .setDescription(commandList);
            };

            // Set the initial category to the first one
            const initialCategory = categories[0];
            updateEmbed(initialCategory);  // Update for the initial category

            // Create a select menu for categories
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('categorySelect')
                .setPlaceholder('Select a category')
                .addOptions(
                    categories.slice(0, 25).map(category => ({ // Limit to 25 options for safety
                        label: category.charAt(0).toUpperCase() + category.slice(1),
                        value: category,
                    }))
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const message = await interaction.reply({ embeds: [helpEmbed], components: [row], fetchReply: true });

            // Create a message component collector for select interactions
            const collector = message.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async i => {
                // Check if the select menu is used
                if (i.customId === 'categorySelect') {
                    updateEmbed(i.values[0]);  // Update the embed for the selected category
                    await i.update({ embeds: [helpEmbed] });  // Update the message with the new embed
                }
            });

            collector.on('end', () => {
                message.edit({ components: [] });  // Remove the select menu after the collector ends
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
            if (command.data.options && command.data.options.length > 0) {
                const subcommandsList = command.data.options
                    .filter(option => option.type === 1) // type 1 indicates a subcommand
                    .map(subcommand => `**/${command.data.name} ${subcommand.name}**: ${subcommand.description}`)
                    .join('\n') || 'No subcommands available.';

                helpEmbed.addFields({ name: '📜 Subcommands', value: subcommandsList });
            }

            return interaction.reply({ embeds: [helpEmbed] });
        }
    },
};
