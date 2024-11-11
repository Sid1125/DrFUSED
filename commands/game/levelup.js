const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('levelup')
        .setDescription('Level up your character!'),
    category: 'game',
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        try {
            const user = await User.findOne({ userId });

            if (!user || !user.startedJourney) {
                return interaction.reply('❌ You need to start your journey first! Use `/startjourney` to begin.');
            }

            const experienceNeeded = user.level * 100; // Example leveling system
            if (user.experience >= experienceNeeded) {
                user.level++;
                user.experience -= experienceNeeded;

                // Add 1 skill point on level up
                user.skillPoints = (user.skillPoints || 0) + 1;

                await user.save();

                const levelupEmbed = new EmbedBuilder()
                    .setColor(0x00AE86)
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setTitle('Level Up!')
                    .setDescription(`🎉 Congratulations! You leveled up to level **${user.level}** and earned **1 Skill Point**!`);

                interaction.followUp({ embeds: [levelupEmbed] });
            } else {
                const levelupEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setTitle('Level Up Failed!')
                    .setDescription(`❌ You need **${experienceNeeded - user.experience}** more experience to level up.`);

                interaction.followUp({ embeds: [levelupEmbed] });
            }
        } catch (error) {
            console.error(error);
            return interaction.reply('❌ There was an error checking your journey status. Please try again later.');
        }
    },
};
