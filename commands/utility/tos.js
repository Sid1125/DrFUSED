const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tos')
        .setDescription('View the Terms of Service for Dr FUSED'),
    async execute(interaction) {
        const tosEmbed = new EmbedBuilder()
            .setTitle('Dr FUSED - Terms of Service')
            .setDescription(
                `By using Dr FUSED, you agree to abide by the following terms:\n\n` +
                `1. **Usage**: You may use the bot for moderation purposes.\n` +
                `2. **Restrictions**: You agree not to misuse the bot or its features.\n` +
                `3. **Data Collection**: Basic data such as User IDs and Warning Logs will be stored for moderation.\n` +
                `4. **Liability**: Dr FUSED and its creators are not liable for misuse or inappropriate behavior resulting from its usage.\n\n` +
                `For more information, visit the full [Terms of Service](https://sid1125.github.io/Dr FUSED/tos.html).`
            )
            .setColor(0x00AE86)
            .setFooter({ text: 'Dr FUSED © 2024' })
            .setTimestamp();

        await interaction.reply({ embeds: [tosEmbed], ephemeral: true });
    },
};
