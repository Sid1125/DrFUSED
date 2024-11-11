const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

// Craftable items and their requirements
const craftableItems = {
    'healing potion': {
        ingredients: ['Healing Herb'],
        coins: 5,
        message: '🍹 You crafted a **Healing Potion!**',
        type: 'Potion'
    },
    'mana potion': {
        ingredients: ['Healing Herb'],
        coins: 10,
        message: '🧪 You crafted a **Mana Potion!**',
        type: 'Potion'
    },
    'health elixir': {
        ingredients: ['Healing Herb'],
        coins: 15,
        message: '💧 You crafted a **Health Elixir!**',
        type: 'Potion'
    },
    'iron sword': {
        ingredients: ['Iron', 'Wood'],
        coins: 50,
        message: '⚔️ You crafted an **Iron Sword!**',
        type: 'Weapon'
    },
    'steel shield': {
        ingredients: ['Iron', 'Wood'],
        coins: 60,
        message: '🛡️ You crafted a **Steel Shield!**',
        type: 'Armor'
    },
    'golden apple': {
        ingredients: ['Golden Apple'],
        coins: 40,
        message: '🍏 You crafted a **Golden Apple!**',
        type: 'Food'
    },
    'explosive bomb': {
        ingredients: ['Magic Dust', 'Iron'],
        coins: 75,
        message: '💣 You crafted an **Explosive Bomb!**',
        type: 'Item'
    },
    'mystic amulet': {
        ingredients: ['Diamond', 'Magic Dust'],
        coins: 150,
        message: '🔮 You crafted a **Mystic Amulet!**',
        type: 'Accessory'
    },
    'elven boots': {
        ingredients: ['Leather', 'Magic Dust'],
        coins: 90,
        message: '👢 You crafted **Elven Boots!**',
        type: 'Armor'
    },
    'potion of strength': {
        ingredients: ['Vampire Fang', 'Healing Herb'],
        coins: 50,
        message: '⚡ You crafted a **Potion of Strength!**',
        type: 'Potion'
    },
    'mystic blade': {
        ingredients: ['Diamond', 'Iron'],
        coins: 100,
        message: '🗡️ You crafted a **Mystic Blade!**',
        type: 'Weapon'
    },
    'shield of the ancients': {
        ingredients: ['Diamond', 'Wood'],
        coins: 120,
        message: '🛡️ You crafted the **Shield of the Ancients!**',
        type: 'Armor'
    },
    // Add more items here as needed
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('craft')
        .setDescription('Craft an item from your resources.')
        .addStringOption(option =>
            option.setName('item')
                .setDescription('The item to craft')
                .setRequired(true)),
    category: 'game',

    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const itemToCraft = interaction.options.getString('item').toLowerCase();

        let user = await User.findOne({ userId });
        if (!user) {
            user = new User({ userId });
            await user.save();
        }

        if (!user.startedJourney) {
            return interaction.reply('❌ You need to start your journey first! Use /startjourney to begin.');
        }

        const craftEmbed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

        const itemRecipe = craftableItems[itemToCraft];

        if (itemRecipe) {
            // Check if user has the required ingredients and coins
            const hasIngredients = itemRecipe.ingredients.every(ingredient =>
                user.inventory.some(i => i.name === ingredient)
            );

            if (hasIngredients && user.coins >= itemRecipe.coins) {
                // Craft the item
                user.inventory.push({ name: itemToCraft, type: itemRecipe.type });
                user.coins -= itemRecipe.coins;

                // Remove used ingredients from inventory
                itemRecipe.ingredients.forEach(ingredient => {
                    user.inventory = user.inventory.filter(i => i.name !== ingredient);
                });

                // Check if crafting the item fulfills any quest
                if (user.dailyQuest && itemToCraft === user.dailyQuestItem) { // Assuming dailyQuestItem is the quest item to craft
                    user.dailyQuest = null; // Reset daily quest after completion
                    user.dailyQuestReward = null; // Reset the reward as well
                    craftEmbed.addFields({ name: 'Quest Completed!', value: `You completed the quest to craft a **${itemToCraft.charAt(0).toUpperCase() + itemToCraft.slice(1)}**!` });
                }

                await user.save();
                craftEmbed.setTitle('Crafting Successful!')
                          .setDescription(itemRecipe.message);
            } else {
                craftEmbed.setTitle('Crafting Failed!')
                          .setDescription(`❌ You don't have the required resources to craft a **${itemToCraft.charAt(0).toUpperCase() + itemToCraft.slice(1)}**.`);
            }
        } else {
            craftEmbed.setTitle('Crafting Failed!')
                      .setDescription(`❌ Unknown item! Please provide a valid item to craft.`);
        }

        interaction.followUp({ embeds: [craftEmbed] });
    }
};
