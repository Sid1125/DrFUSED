const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../../models/User');
const Pet = require('../../models/Pet');
const { shopItems, dailyItems } = require('./shop'); // Ensure you have access to shop items

module.exports = {
    data: new SlashCommandBuilder()
        .setName('equip')
        .setDescription('Equip a weapon, armor, or pet.')
        .addStringOption(option => 
            option.setName('item')
                .setDescription('Item ID to equip (Weapon, Armor, or Pet ID)')
                .setRequired(true)),
    category: 'game',

    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id });
        if (!user.startedJourney) return interaction.reply('You need to start your journey first!');

        const itemId = interaction.options.getString('item');
        const item = user.inventory.find(i => i.id === itemId); // Check for the item by ID

        if (!item) return interaction.reply("You don't own that item!");

        // Find the item in shopItems and dailyItems
        const shopItem = shopItems.find(i => i.id === itemId);
        const dailyItem = dailyItems.find(i => i.id === itemId);
        const itemType = shopItem ? shopItem.type : dailyItem ? dailyItem.type : null; // Get the type of the item

        // Check if the item is a weapon or armor
        if (itemType === 'Weapon') {
            user.equippedWeapon = item;
            user.attack += shopItem.effectiveness || 0; // Assuming you have an attack stat in the User model
            await user.save();
            return interaction.reply(`You have equipped **${item.name}** as your weapon.`);
        } else if (itemType === 'Armor') {
            user.equippedArmor = item;
            user.defense += shopItem.effectiveness || 0; // Assuming you have a defense stat in the User model
            await user.save();
            return interaction.reply(`You have equipped **${item.name}** as your armor.`);
        } else {
            // If the item is not a weapon or armor, check if it's a pet
            const pet = await Pet.findOne({ userId: user.userId, _id: itemId });
            if (pet) {
                user.equippedPet = pet; // Equip the pet
                await user.save();
                return interaction.reply(`You have equipped **${pet.name}** as your pet!`);
            } else {
                return interaction.reply("This item cannot be equipped!");
            }
        }
    }
};
