const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trade')
        .setDescription('Trade items with another user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to trade with')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('item')
                .setDescription('Item to trade')
                .setRequired(true)),
    category: 'game',
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const targetUser = interaction.options.getUser('user');
        const itemToTrade = interaction.options.getString('item').toLowerCase();
        
        try {
            // Check if the user has started their journey
            const user = await User.findOne({ userId });

            if (!user || !user.startedJourney) {
                return interaction.reply('❌ You need to start your journey first! Use `/startjourney` to begin.');
            }

            const target = await User.findOne({ userId: targetUser.id });

            if (!target) {
                return interaction.followUp({ content: 'The target user needs to be registered in the game.' });
            }

            const tradeEmbed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

            // Ask the target user if they want to trade for coins or another item
            const askEmbed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setDescription(`💬 ${interaction.user.username} wants to trade **${itemToTrade}**. Do you want to trade for coins or another item? Reply with "coins" or "item".`);

            await target.send({ embeds: [askEmbed] });

            const filter = m => m.author.id === targetUser.id;
            const collector = target.dmChannel.createMessageCollector({ filter, max: 1, time: 30000 }); // Collect one response or timeout after 30 seconds

            collector.on('collect', async (msg) => {
                const choice = msg.content.toLowerCase();

                if (choice === 'coins') {
                    // Ask how many coins they want to trade
                    await target.send('How many coins do you want to trade? Please enter a number.');
                    
                    const coinFilter = m => m.author.id === targetUser.id;
                    const coinCollector = target.dmChannel.createMessageCollector({ coinFilter, max: 1, time: 30000 });

                    coinCollector.on('collect', async (coinMsg) => {
                        const coinsToTrade = parseInt(coinMsg.content, 10);
                        
                        if (isNaN(coinsToTrade) || coinsToTrade <= 0) {
                            return target.send('❌ Please enter a valid number of coins.');
                        }

                        if (target.coins < coinsToTrade) {
                            return target.send('❌ You do not have enough coins for this trade.');
                        }

                        // Proceed with trade
                        user.inventory.push(itemToTrade);
                        target.inventory = target.inventory.filter(item => item !== itemToTrade);
                        target.coins -= coinsToTrade;
                        user.coins = (user.coins || 0) + coinsToTrade;

                        await user.save();
                        await target.save();

                        tradeEmbed.setTitle('Trade Successful!')
                                  .setDescription(`🤝 You traded **${itemToTrade}** for **${coinsToTrade}** coins with **${targetUser.username}**!`);
                        interaction.followUp({ embeds: [tradeEmbed] });
                    });

                    coinCollector.on('end', collected => {
                        if (collected.size === 0) {
                            target.send('⏰ You did not respond in time, the trade has been canceled.');
                        }
                    });
                } else if (choice === 'item') {
                    // Ask which item they want to trade
                    await target.send('Which item do you want to trade? Please enter the item name from your inventory.');
                    
                    const itemFilter = m => m.author.id === targetUser.id;
                    const itemCollector = target.dmChannel.createMessageCollector({ itemFilter, max: 1, time: 30000 });

                    itemCollector.on('collect', async (itemMsg) => {
                        const itemToReceive = itemMsg.content.toLowerCase();

                        if (!target.inventory.includes(itemToReceive)) {
                            return target.send('❌ You do not have this item in your inventory.');
                        }

                        // Proceed with trade
                        user.inventory.push(itemToTrade);
                        target.inventory.push(itemToReceive);
                        target.inventory = target.inventory.filter(item => item !== itemToTrade);

                        await user.save();
                        await target.save();

                        tradeEmbed.setTitle('Trade Successful!')
                                  .setDescription(`🤝 You traded **${itemToTrade}** for **${itemToReceive}** with **${targetUser.username}**!`);
                        interaction.followUp({ embeds: [tradeEmbed] });
                    });

                    itemCollector.on('end', collected => {
                        if (collected.size === 0) {
                            target.send('⏰ You did not respond in time, the trade has been canceled.');
                        }
                    });
                } else {
                    await target.send('❌ Please reply with either "coins" or "item".');
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    target.send('⏰ You did not respond in time, the trade has been canceled.');
                }
            });
        } catch (error) {
            console.error(error);
            return interaction.reply('❌ There was an error processing the trade. Please try again later.');
        }
    },
};
