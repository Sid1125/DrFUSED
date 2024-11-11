// commands/utility/poll.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll with multiple options for users to vote on.')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Poll question')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option1')
                .setDescription('First option')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option2')
                .setDescription('Second option')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration of the poll (number of units) (required)') // Updated description
                .setRequired(true)
                .setMinValue(1))
        .addStringOption(option =>
            option.setName('unit')
                .setDescription('Unit for the duration (s: seconds, m: minutes, h: hours, d: days)')
                .setRequired(true)
                .addChoices(
                    { name: 'Seconds', value: 's' },
                    { name: 'Minutes', value: 'm' },
                    { name: 'Hours', value: 'h' },
                    { name: 'Days', value: 'd' }
                ))
        .addRoleOption(option =>
            option.setName('notifyrole')
                .setDescription('Role to ping when the poll ends'))
        .addStringOption(option =>
            option.setName('option3')
                .setDescription('Third option'))
        .addStringOption(option =>
            option.setName('option4')
                .setDescription('Fourth option'))
        .addStringOption(option =>
            option.setName('option5')
                .setDescription('Fifth option'))
        .addStringOption(option =>
            option.setName('option6')
                .setDescription('Sixth option'))
        .addStringOption(option =>
            option.setName('option7')
                .setDescription('Seventh option'))
        .addStringOption(option =>
            option.setName('option8')
                .setDescription('Eighth option'))
        .addStringOption(option =>
            option.setName('option9')
                .setDescription('Ninth option'))
        .addStringOption(option =>
            option.setName('option10')
                .setDescription('Tenth option')),
    category: 'utility',

    async execute(interaction) {
        const question = interaction.options.getString('question');
        const duration = interaction.options.getInteger('duration');
        const unit = interaction.options.getString('unit');
        const notifyRole = interaction.options.getRole('notifyrole');

        // Convert duration to seconds based on the chosen unit
        let totalSeconds;
        switch (unit) {
            case 's':
                totalSeconds = duration; // Seconds
                break;
            case 'm':
                totalSeconds = duration * 60; // Minutes to seconds
                break;
            case 'h':
                totalSeconds = duration * 3600; // Hours to seconds
                break;
            case 'd':
                totalSeconds = duration * 86400; // Days to seconds
                break;
            default:
                return interaction.reply({ content: 'Invalid unit selected.', ephemeral: true });
        }

        // Gather options from the interaction
        const options = [];
        for (let i = 1; i <= 10; i++) {
            const option = interaction.options.getString(`option${i}`);
            if (option) options.push(option);
        }

        // Validate that we have at least two options
        if (options.length < 2) {
            return interaction.reply({
                content: 'Please provide at least two options for the poll.',
                ephemeral: true
            });
        }

        // Create an embed for the poll
        const embed = new EmbedBuilder()
            .setTitle('📊 Poll')
            .setDescription(`**${question}**\n*(This poll will end in ${totalSeconds} seconds)*`)
            .setColor(0x00AE86)
            .setFooter({ text: 'React below to vote!' });

        // Add options to the embed with corresponding emoji
        const emojiList = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        options.forEach((option, index) => {
            embed.addFields({ name: `${emojiList[index]} ${option}`, value: '\u200B', inline: false });
        });

        try {
            // Send the embed as a reply
            const pollMessage = await interaction.reply({
                embeds: [embed],
                fetchReply: true
            });

            // Add reactions for each option
            for (let i = 0; i < options.length; i++) {
                await pollMessage.react(emojiList[i]);
            }

            // Set a timeout for the poll duration
            setTimeout(async () => {
                const message = await interaction.channel.messages.fetch(pollMessage.id); // Fetch the original message
                const reactions = message.reactions.cache;

                // Count votes for each option
                const results = options.map((_, index) => reactions.get(emojiList[index])?.count - 1 || 0); // Subtract 1 to exclude the bot's reaction

                // Create a result embed
                const resultEmbed = new EmbedBuilder()
                    .setTitle('📊 Poll Results')
                    .setDescription(`**${question}**`)
                    .setColor(0x00AE86);

                options.forEach((option, index) => {
                    resultEmbed.addFields({ name: `${emojiList[index]} ${option}`, value: `${results[index]} votes`, inline: false });
                });

                // Send the results in the channel
                await interaction.channel.send({ embeds: [resultEmbed] });

                // Notify the role if provided
                if (notifyRole) {
                    await interaction.channel.send(`${notifyRole}, the poll has ended!`);
                }
            }, totalSeconds * 1000); // Convert seconds to milliseconds

        } catch (error) {
            console.error('Error creating poll or adding reactions:', error);

            // Only reply if the interaction has not been acknowledged yet
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'An error occurred while creating the poll. Please try again.',
                    ephemeral: true
                });
            }
        }
    },
};
