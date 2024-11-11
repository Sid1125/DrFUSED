const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const { shopItems, dailyItems } = require('./shop'); // Adjust the path as necessary

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Buy an item from the shop.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID of the item to buy')
                .setRequired(true)),
    category: 'game',
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const itemId = interaction.options.getString('id');

        try {
            const user = await User.findOne({ userId });

            if (!user || !user.startedJourney) {
                return interaction.followUp('❌ You need to start your journey first! Use `/startjourney` to begin.');
            }

            // Find the item in the shop by ID
            const item = shopItems.find(item => item.id === itemId);
            const dailyItem = dailyItems.find(item => item.id === itemId);

            const buyEmbed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

            if (item) {
                if (user.coins >= item.price) {
                    user.coins -= item.price;
                    user.inventory.push({ id: item.id, name: item.name, effectiveness: item.effectiveness });
                    await user.save();

                    buyEmbed.setTitle('Purchase Successful!')
                            .setDescription(`🛒 You bought a **${item.name}** for **${item.price}** coins!`);
                } else {
                    buyEmbed.setTitle('Purchase Failed!')
                            .setDescription(`❌ You do not have enough coins to buy **${item.name}**. You need **${item.price - user.coins}** more coins.`);
                }
            } else if (dailyItem) {
                if (user.coins >= dailyItem.price) {
                    user.coins -= dailyItem.price;
                    user.inventory.push({ id: dailyItem.id, name: dailyItem.name, effectiveness: dailyItem.effectiveness });
                    await user.save();

                    buyEmbed.setTitle('Purchase Successful!')
                            .setDescription(`🛒 You bought the **${dailyItem.name}** for **${dailyItem.price}** coins!`);
                } else {
                    buyEmbed.setTitle('Purchase Failed!')
                            .setDescription(`❌ You do not have enough coins to buy **${dailyItem.name}**. You need **${dailyItem.price - user.coins}** more coins.`);
                }
            } else {
                buyEmbed.setTitle('Purchase Failed!')
                        .setDescription(`❌ Item with ID **${itemId}** is not available in the shop.`);
            }

            await interaction.followUp({ embeds: [buyEmbed] });
        } catch (error) {
            console.error(error);
            return interaction.followUp('❌ There was an error processing your purchase. Please try again later.');
        }
    },
};
