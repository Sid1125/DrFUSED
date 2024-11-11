const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('View important information about Dr FUSED')
        .addSubcommand(subcommand =>
            subcommand
                .setName('privacy')
                .setDescription('View the Privacy Policy for Dr FUSED')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('tos')
                .setDescription('View the Terms of Service for Dr FUSED')
        ),
    category: 'utility',
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        let embed;

        if (subcommand === 'privacy') {
            embed = new EmbedBuilder()
                .setTitle('Dr FUSED - Privacy Policy')
                .setDescription(
                    `We value your privacy and ensure your data is protected. Key points:\n\n` +
                    `1. **Data Collected**: We collect User IDs and Server IDs for moderation.\n` +
                    `2. **Data Usage**: Data is used solely for moderation features like warnings and kicks.\n` +
                    `3. **Retention**: Warnings are reset after 10 days, and kicked users' data is deleted.\n` +
                    `4. **Your Rights**: You can request your data be deleted at any time.\n\n` +
                    `Read the full [Privacy Policy](https://sid1125.github.io/DrFUSED/privacy.html).`
                )
                .setColor(0x00AE86)
                .setFooter({ text: 'Dr FUSED © 2024' })
                .setTimestamp();
        } else if (subcommand === 'tos') {
            embed = new EmbedBuilder()
                .setTitle('Dr FUSED - Terms of Service')
                .setDescription(
                    `By using Dr FUSED, you agree to abide by the following terms:\n\n` +
                    `1. **Usage**: You may use the bot for moderation purposes.\n` +
                    `2. **Restrictions**: You agree not to misuse the bot or its features.\n` +
                    `3. **Data Collection**: Basic data such as User IDs and Warning Logs will be stored for moderation.\n` +
                    `4. **Liability**: Dr FUSED and its creators are not liable for misuse or inappropriate behavior resulting from its usage.\n\n` +
                    `For more information, visit the full [Terms of Service](https://sid1125.github.io/DrFUSED/tos.html).`
                )
                .setColor(0x00AE86)
                .setFooter({ text: 'Dr FUSED © 2024' })
                .setTimestamp();
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
