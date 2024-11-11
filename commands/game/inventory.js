const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const { shopItems, dailyItems } = require('./shop'); // Ensure you have access to shop items

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Check your inventory.'),
    category: 'game',

    async execute(interaction) {
        const userId = interaction.user.id;
        const user = await User.findOne({ userId });

        if (!user || !user.startedJourney) {
            return interaction.reply('❌ You need to start your journey first! Use `/startjourney` to begin.');
        }

        const inventoryItems = user.inventory || [];
        const inventoryEmbed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle(`${interaction.user.username}'s Inventory`);

        // Show equipped items
        inventoryEmbed.addFields({
            name: 'Equipped Weapon',
            value: user.equippedWeapon ? user.equippedWeapon.name : 'None',
            inline: true,
        });
        inventoryEmbed.addFields({
            name: 'Equipped Armor',
            value: user.equippedArmor ? user.equippedArmor.name : 'None',
            inline: true,
        });

        if (inventoryItems.length === 0) {
            inventoryEmbed.setDescription('Your inventory is empty.');
        } else {
            // Group items by name and count occurrences
            const itemCount = {};

            inventoryItems.forEach(item => {
                if (itemCount[item.name]) {
                    itemCount[item.name].count += 1; // Increment count for existing item
                } else {
                    itemCount[item.name] = { count: 1, id: item.id }; // Initialize new item entry
                }
            });

            // Add fields for each item in the embed
            for (const [name, { count, id }] of Object.entries(itemCount)) {
                const shopItem = shopItems.find(shopItem => shopItem.id === id);
                const dailyItem = dailyItems.find(dailyItem => dailyItem.id === id);
                let effectiveness = 0;
                let itemType = 'Unknown';

                if (shopItem) {
                    effectiveness = shopItem.effectiveness * (1 + (user.prestige * 0.1)); // Adjust effectiveness calculation
                    itemType = shopItem.type; // Retrieve item type from shopItems
                } else if (dailyItem) {
                    effectiveness = dailyItem.effectiveness * (1 + (user.prestige * 0.1)); // Adjust effectiveness calculation
                    itemType = dailyItem.type; // Retrieve item type from dailyItems
                }

                inventoryEmbed.addFields({
                    name: `${name} x ${count}`, // Show item name with count
                    value: `ID: ${id}\nType: ${itemType}\nEffectiveness: ${effectiveness.toFixed(2)}`,
                    inline: true,
                });
            }
        }

        await interaction.reply({ embeds: [inventoryEmbed] });
    },
};
