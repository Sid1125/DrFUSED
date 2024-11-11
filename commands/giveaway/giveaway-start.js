const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Giveaway = require('../../models/Giveaway');
const ArchivedGiveaway = require('../../models/ArchivedGiveaway');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Start a giveaway!')
        .addStringOption(option =>
            option.setName('prize')
                .setDescription('The prize for the giveaway')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration of the giveaway (number of units)')
                .setRequired(true)
                .setMinValue(1))
        .addStringOption(option =>
            option.setName('unit')
                .setDescription('Unit for the duration')
                .setRequired(true)
                .addChoices(
                    { name: 'Seconds', value: 's' },
                    { name: 'Minutes', value: 'm' },
                    { name: 'Hours', value: 'h' },
                    { name: 'Days', value: 'd' }
                )),
    category: 'giveaway',

    async execute(interaction) {
        const prize = interaction.options.getString('prize');
        const duration = interaction.options.getInteger('duration');
        const unit = interaction.options.getString('unit');

        let totalSeconds;
        switch (unit) {
            case 's': totalSeconds = duration; break;
            case 'm': totalSeconds = duration * 60; break;
            case 'h': totalSeconds = duration * 3600; break;
            case 'd': totalSeconds = duration * 86400; break;
            default:
                return interaction.reply({ content: 'Invalid unit selected.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎉 Giveaway! 🎉')
            .setDescription(`Prize: **${prize}**\nReact with 🎉 to enter!\nDuration: **${duration} ${unit}**`)
            .setColor(0x00AE86)
            .setFooter({ text: 'Ends soon!' });

        try {
            const giveawayMessage = await interaction.reply({
                embeds: [embed],
                fetchReply: true
            });
            await giveawayMessage.react('🎉');

            const endTime = Date.now() + totalSeconds * 1000;
            const giveawayData = {
                messageId: giveawayMessage.id,
                channelId: interaction.channel.id,
                prize: prize,
                duration: totalSeconds,
                guildId: interaction.guild.id,
                endTime: endTime,
            };

            // Try saving in Giveaway schema first
            let giveaway;
            try {
                giveaway = new Giveaway(giveawayData);
                await giveaway.save();
            } catch (error) {
                if (error instanceof mongoose.Error.VersionError) {
                    console.warn('VersionError on initial save - retrying...');
                    giveaway = new Giveaway(giveawayData);
                    await giveaway.save();
                } else {
                    throw error;
                }
            }

            // Save in ArchivedGiveaway schema
            const archivedGiveaway = new ArchivedGiveaway(giveawayData);
            await archivedGiveaway.save();

            // Set a timeout to end the giveaway
            setTimeout(async () => {
                const updatedGiveaway = await Giveaway.findById(giveaway._id);
                if (updatedGiveaway) {
                    const message = await interaction.channel.messages.fetch(giveawayMessage.id);
                    const reactions = message.reactions.cache.get('🎉');
                    const participants = reactions ? reactions.users.cache.filter(user => !user.bot).map(user => user.id) : [];
                    
                    if (participants.length === 0) {
                        await interaction.channel.send(`No participants for the giveaway of **${prize}**.`);
                    } else {
                        const winnerId = participants[Math.floor(Math.random() * participants.length)];
                        const winner = await interaction.guild.members.fetch(winnerId);
                        await interaction.channel.send(`🎉 Congratulations ${winner}, you won **${prize}**! 🎉`);
                    }

                    await Giveaway.deleteOne({ _id: giveaway._id });
                    setTimeout(async () => {
                        await ArchivedGiveaway.deleteOne({ _id: giveaway._id });
                        console.log(`Giveaway ${giveaway._id} deleted after 2 days.`);
                    }, 172800000);
                }
            }, totalSeconds * 1000);

        } catch (error) {
            console.error('Error starting giveaway:', error);
            if (!interaction.replied) {
                await interaction.reply({
                    content: 'An error occurred while starting the giveaway. Please try again.',
                    ephemeral: true
                });
            }
        }
    },
};
