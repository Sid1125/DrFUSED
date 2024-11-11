const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../../models/User');
const Party = require('../../models/Party'); // Import the Party model
const Pet = require('../../models/Pet'); // Import the Pet model if you have a Pet model

function generateRandomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase(); // Generate a random code
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('party')
        .setDescription('Manage your party.')
        .addStringOption(option => 
            option.setName('action')
                .setDescription('Action to perform (join/leave/create/info)')
                .setRequired(true)
                .addChoices(
                    { name: 'Join', value: 'join' },
                    { name: 'Leave', value: 'leave' },
                    { name: 'Create', value: 'create' },
                    { name: 'Info - Also input invite code to check the Party Info', value: 'info' } // Add info option
                ))
        .addStringOption(option => 
            option.setName('invite_code')
                .setDescription('Custom invite code (optional)')),
    category: 'game',
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id });
        if (!user || !user.startedJourney) return interaction.reply('You need to start your journey first!');

        const action = interaction.options.getString('action');
        const inviteCode = interaction.options.getString('invite_code');

        if (action === 'create') {
            // Validate the invite code
            let code = inviteCode ? inviteCode.toUpperCase() : generateRandomCode();
            const existingParty = await Party.findOne({ code });

            if (existingParty) {
                return interaction.reply('This invite code is already in use. Please choose a different one.');
            }

            // Create a new party
            const party = new Party({ code, members: [user.userId] });
            await party.save();
            user.partyCode = code; // Store the party code in user data
            await user.save();

            return interaction.reply(`You have created a party with the invite code: **${code}**`);

        } else if (action === 'info') {
            // Fetch the party using the invite code
            const party = inviteCode ? await Party.findOne({ code: inviteCode.toUpperCase() }) : null;

            if (!party) {
                return interaction.reply('Party not found. Please check the invite code or create a new party.');
            }

            // Fetch user data for members
            const memberDetails = await Promise.all(party.members.map(async (memberId) => {
                const member = await User.findOne({ userId: memberId });
                const pets = await Pet.find({ userId: memberId });

                return {
                    userId: member.userId,
                    level: member.level,
                    pets: pets.map(pet => ({
                        name: pet.name,
                        type: pet.type,
                        level: pet.level,
                    })),
                };
            }));

            // Construct the party info message
            const membersInfo = memberDetails.map(member => {
                const petInfo = member.pets.length > 0 
                    ? member.pets.map(pet => `${pet.name} (Level ${pet.level}, Type: ${pet.type})`).join(', ')
                    : 'No pets';
                return `**User:** <@${member.userId}> | **Level:** ${member.level} | **Pets:** ${petInfo}`;
            }).join('\n');

            return interaction.reply(`**Invite Code:** ${party.code}\n**Members:**\n${membersInfo}`);

        } else {
            // If the user is not creating a party, fetch the party using the invite code
            const party = inviteCode ? await Party.findOne({ code: inviteCode.toUpperCase() }) : null;

            if (action === 'join') {
                if (!party) {
                    return interaction.reply('Party not found. Please check the invite code or create a new party.');
                }

                if (party.members.includes(user.userId)) {
                    return interaction.reply('You are already in this party.');
                }
                
                // Check party capacity
                if (party.members.length >= 2) {
                    return interaction.reply('This party is full.');
                }

                // Add the user to the party
                party.members.push(user.userId);
                await party.save();
                user.partyCode = party.code; // Update user's party code
                await user.save();

                return interaction.reply(`You have joined the party with the invite code: **${party.code}**`);
            }

            if (action === 'leave') {
                if (!party) {
                    return interaction.reply('You are not in a party. Please create one or join an existing party.');
                }

                if (!party.members.includes(user.userId)) {
                    return interaction.reply('You are not in this party.');
                }

                // Remove the user from the party
                party.members = party.members.filter(member => member !== user.userId);
                await party.save();

                // If the party is empty, delete it
                if (party.members.length === 0) {
                    await Party.deleteOne({ code: party.code });
                    return interaction.reply('You have left the party, and it has been deleted as it was empty.');
                }

                user.partyCode = null; // Clear party code from user data
                await user.save();
                return interaction.reply('You have left the party!');
            }
        }
    },
};
