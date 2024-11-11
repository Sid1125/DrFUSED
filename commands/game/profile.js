const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription("Display the player's profile."),
    category: 'game',
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id });
        if (!user) return interaction.reply("You don't have a profile yet!");

        const achievements = user.completedQuests.length ? user.completedQuests.join(', ') : 'None';
        const inventory = user.inventory.length ? user.inventory.map(i => i.name).join(', ') : 'Empty';
        const equippedWeapon = user.equippedWeapon ? user.equippedWeapon.name : 'None'; // Assuming equippedWeapon is an object
        const equippedArmor = user.equippedArmor ? user.equippedArmor.name : 'None'; // Assuming equippedArmor is an object

        const profileEmbed = {
            color: 0x0099ff,
            title: `${interaction.user.username}'s Profile`,
            fields: [
                { name: 'Level', value: user.level.toString(), inline: true },
                { name: 'Experience', value: user.experience.toString(), inline: true },
                { name: 'Coins', value: user.coins.toString(), inline: true },
                { name: 'Prestige Level', value: user.prestigeLevel ? user.prestigeLevel.toString() : '0', inline: true },
                { name: 'Equipped Weapon', value: equippedWeapon, inline: true },
                { name: 'Equipped Armor', value: equippedArmor, inline: true },
                { name: 'Achievements', value: achievements, inline: false },
                { name: 'Current Quest', value: user.currentQuest || 'None', inline: false },
                { name: 'Inventory', value: inventory, inline: false },
            ],
        };

        await interaction.reply({ embeds: [profileEmbed] });
    },
};
