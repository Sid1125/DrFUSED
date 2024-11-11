const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../../models/User');
const { shopItems, dailyItems } = require('./shop');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('potion')
        .setDescription('Use a potion to restore health or activate effects for 10 minutes.')
        .addStringOption(option => option
            .setName('potion_id')
            .setDescription('ID of the potion to use')
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName('amount')
            .setDescription('Number of potions to use')
            .setRequired(false)
        ),
    category: 'game',
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id });
        if (!user.startedJourney) return interaction.reply('You need to start your journey first!');

        const potionId = interaction.options.getString('potion_id');
        const amountToUse = interaction.options.getInteger('amount') || 1;
        const potionInventory = user.inventory.filter(i => i.id === potionId);

        if (!potionInventory.length) return interaction.reply("You don't own a potion with that ID!");

        if (potionInventory.length < amountToUse) {
            return interaction.reply(`You only have ${potionInventory.length} potions. You cannot use ${amountToUse}.`);
        }

        const currentTime = Date.now();
        if (user.lastHeal && currentTime - user.lastHeal < 30000) {
            return interaction.reply('You can heal again in 30 seconds.');
        }

        const shopItem = shopItems.find(item => item.id === potionId) || dailyItems.find(item => item.id === potionId);
        if (!shopItem) return interaction.reply("Potion not found in shop!");

        const effectiveness = shopItem.effectiveness || 1;
        let message = '';

        if (shopItem.name === 'Healing Potion') {
            const baseHealingAmount = parseInt(shopItem.effect.split(' ')[1]);
            const actualHealingAmount = Math.floor(baseHealingAmount * effectiveness * amountToUse);
            const maxHealth = user.maxHealth; // Use the virtual maxHealth value

            // Check if the user's health is already at maxHealth
            if (user.health >= maxHealth) {
                return interaction.reply(`You are already at full health (${maxHealth}). No need to use a Healing Potion.`);
            }

            // Ensure the user's health does not exceed maxHealth
            user.health = Math.min(user.health + actualHealingAmount, maxHealth);

            message = `You have healed for ${actualHealingAmount} health using **${amountToUse} ${shopItem.name}(s)**. Your current health is now ${user.health}/${maxHealth}.`;
        } else {
            const effect = shopItem.effect;
            user.activeEffects[potionId] = {
                description: effect,
                effectiveness: effectiveness * amountToUse,
                expiresAt: currentTime + 10 * 60 * 1000
            };
            message = `You have activated **${amountToUse} ${shopItem.name}(s)**: ${effect} for 10 minutes.`;
        }

        let potionsToRemove = amountToUse;
        user.inventory = user.inventory.filter(item => {
            if (item.id === potionId && potionsToRemove > 0) {
                potionsToRemove--;
                return false;
            }
            return true;
        });

        user.lastHeal = currentTime;
        await user.save();

        interaction.reply(message);
    },
};
