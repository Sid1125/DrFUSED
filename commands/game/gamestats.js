const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User'); // Importing the User model

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamestats')
        .setDescription('View your character\'s stats and current status.'),
    category: 'game',
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const user = await User.findOne({ userId });

        if (!user) {
            return interaction.followUp({ content: '❌ You need to start your journey first! Use `/startjourney` to begin.' });
        }

        // Get the daily item for display purposes
        const dailyItem = user.dailyItem ? user.dailyItem.name : 'None';
        const dailyItemPrice = user.dailyItem ? user.dailyItem.price : 0;

        // Extract inventory items for display
        const inventoryCount = {};
        user.inventory.forEach(item => {
            inventoryCount[item.name] = (inventoryCount[item.name] || 0) + 1; // Count the occurrences of each item
        });

        const inventoryDisplay = Object.entries(inventoryCount).length > 0 
            ? Object.entries(inventoryCount).map(([itemName, count]) => `${itemName} (x${count})`).join(', ')
            : 'Empty';

        const statsEmbed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle(`${interaction.user.username}'s Stats`)
            .addFields(
                { name: 'Level', value: `${user.level || 1}`, inline: true },
                { name: 'XP', value: `${user.xp || 0}`, inline: true },
                { name: 'Coins', value: `${user.coins || 0}`, inline: true },
                { name: 'Prestige', value: `${user.prestige || 0}`, inline: true },
                { name: 'Element', value: `${user.element || 'None'}`, inline: true },
                { name: 'Health', value: `${user.health || 100}`, inline: true },
                { name: 'Inventory', value: inventoryDisplay }, // Updated inventory display
                { name: 'Daily Item', value: `**${dailyItem}** - **${dailyItemPrice}** coins (Available Today!)`, inline: true }
            );

        interaction.followUp({ embeds: [statsEmbed] });
    },
};
