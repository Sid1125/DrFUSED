const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

const shopItems = [
    { id: 's1', name: 'Healing Potion', price: 10, type: 'Potion', effect: 'Restores 20 HP', effectiveness: 0.8 },
    { id: 's2', name: 'Mana Potion', price: 15, type: 'Potion', effect: 'Restores 15 MP', effectiveness: 0.7 },
    { id: 's3', name: 'Iron Sword', price: 50, type: 'Weapon', effect: 'Attack +5', effectiveness: 1.2 },
    { id: 's4', name: 'Steel Shield', price: 60, type: 'Armor', effect: 'Defense +5', effectiveness: 1.1 },
    { id: 's5', name: 'Health Elixir', price: 30, type: 'Potion', effect: 'Restores 50 HP', effectiveness: 0.9 },
    { id: 's6', name: 'Stamina Potion', price: 20, type: 'Potion', effect: 'Restores 10 Stamina', effectiveness: 0.6 },
    { id: 's7', name: 'Fireball Spell', price: 100, type: 'Spell', effect: 'Deals 30 Fire Damage', effectiveness: 1.5 },
    { id: 's8', name: 'Thunder Strike Spell', price: 120, type: 'Spell', effect: 'Deals 40 Lightning Damage', effectiveness: 1.6 },
    { id: 's9', name: 'Iron Armor', price: 80, type: 'Armor', effect: 'Defense +10', effectiveness: 1.3 },
    { id: 's10', name: 'Wooden Bow', price: 70, type: 'Weapon', effect: 'Attack +7', effectiveness: 1.4 },
    { id: 's11', name: 'Healing Herb', price: 5, type: 'Material', effect: 'Used for crafting potions', effectiveness: 0.5 },
    { id: 's12', name: 'Magic Dust', price: 25, type: 'Material', effect: 'Used for crafting spells', effectiveness: 0.6 },
    { id: 's13', name: 'Diamond', price: 200, type: 'Material', effect: 'High value crafting material', effectiveness: 0.8 },
    { id: 's14', name: 'Golden Apple', price: 40, type: 'Food', effect: 'Restores 25 HP and boosts stats temporarily', effectiveness: 0.9 },
    { id: 's15', name: 'Mystic Amulet', price: 150, type: 'Accessory', effect: 'Increases magic damage by 10%', effectiveness: 1.1 },
    { id: 's16', name: 'Elven Boots', price: 90, type: 'Armor', effect: 'Increases speed by 10%', effectiveness: 1.2 },
    { id: 's17', name: 'Vampire Fang', price: 35, type: 'Material', effect: 'Used for crafting potions', effectiveness: 0.5 },
    { id: 's18', name: 'Phoenix Feather', price: 300, type: 'Material', effect: 'Rare crafting material, used for powerful items', effectiveness: 0.9 },
    { id: 's19', name: 'Explosive Bomb', price: 75, type: 'Item', effect: 'Deals area damage to enemies', effectiveness: 1.4 },
    { id: 's20', name: 'Invisibility Cloak', price: 120, type: 'Armor', effect: 'Grants temporary invisibility', effectiveness: 1.5 },
];

const dailyItems = [
    { id: 'd1', name: 'Potion of Strength', price: 50, type: 'Potion', effect: 'Attack +5', effectiveness: 1.2 },
    { id: 'd2', name: 'Mystic Blade', price: 100, type: 'Weapon', effect: 'Attack +10', effectiveness: 1.5 },
    { id: 'd3', name: 'Shield of the Ancients', price: 120, type: 'Armor', effect: 'Defense +10', effectiveness: 1.3 },
];

function getDailyItem() {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const dailyItem = dailyItems[Math.floor(Math.random() * dailyItems.length)];
    return { ...dailyItem, date: today };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('View and buy items from the shop.'),
    category: 'game',
    shopItems, dailyItems,
    async execute(interaction) {
        await interaction.deferReply();
    
        const userId = interaction.user.id;
        try {
            // Check if the user has started their journey
            const user = await User.findOne({ userId });
            if (!user || !user.startedJourney) {
                return interaction.followUp('❌ You need to start your journey first! Use `/startjourney` to begin.');
            }
    
            // Check if the daily item was already purchased today
            const currentDate = new Date().toISOString().slice(0, 10);
            if (user.lastPurchaseDate === currentDate) {
                return interaction.followUp('❌ You can only buy the daily item once per day. Come back tomorrow!');
            }
    
            // Declare dailyItem before the if statement
            let dailyItem;
    
            // Get the daily item
            if (currentDate === user.dailyItem.date) {
                dailyItem = user.dailyItem; // Use user's stored daily item
            } else {
                dailyItem = getDailyItem(); // Get a new daily item
            }
    
            // List of shop items with IDs
            const shopList = shopItems.map(item => `**ID: ${item.id}** - ${item.name} - **${item.price}** coins`).join('\n');
    
            // Embed for the shop
            const shopEmbed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .setTitle('Shop Items')
                .setDescription(shopList)
                .addFields(
                    { name: 'Daily Special', value: `**ID: ${dailyItem.id}** - **${dailyItem.name}** for **${dailyItem.price}** coins!` },
                    { name: 'Instructions', value: 'Type `/buy <item_id>` to buy an item!' }
                );
    
            await interaction.followUp({ embeds: [shopEmbed] });
    
            // Update the user's last purchase date and store the current daily item in the user's data
            user.lastPurchaseDate = currentDate;
            user.dailyItem = dailyItem; // Store the current daily item in the user's data
            await user.save();
    
        } catch (error) {
            console.error(error);
            return interaction.followUp('❌ There was an error checking your journey status. Please try again later.');
        }
    }    
};    