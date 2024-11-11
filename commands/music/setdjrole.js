const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const { queues } = require('./play');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setdjrole')
        .setDescription('Assigns a DJ role to control music commands.')
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('The role to assign as DJ.')
                .setRequired(true)),
    category: 'music',
    async execute(interaction) {
        const role = interaction.options.getRole('role');
        // Store the DJ role ID in your database or in memory
        interaction.guild.djRole = role.id;
        return interaction.reply(`Set ${role.name} as DJ role.`);
    }
}
