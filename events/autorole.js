const fs = require('fs');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            // Read the saved role ID from the file
            const data = JSON.parse(fs.readFileSync('autorole.json', 'utf8'));
            const guildId = member.guild.id;  // Get the ID of the guild
            const roleId = data[guildId]?.roleId;  // Use the guild ID to get the corresponding role ID

            // If no role has been set (roleId is null or empty), return early
            if (!roleId) {
                console.log(`No auto-role is set for guild ${guildId}. Skipping role assignment.`);
                return;
            }

            // Wait for a brief moment to ensure the roles cache is ready
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check if roles cache is available
            if (!member.guild.roles || !member.guild.roles.cache) {
                console.error('Roles cache is not available, fetching roles from the API...');
                await member.guild.roles.fetch();  // Fetch roles from API
            }

            // Fetch the role to assign
            const role = await member.guild.roles.fetch(roleId);

            // Check if the bot has Administrator permissions
            if (member.guild.members.me.permissions.has('Administrator')) {
                // Additional check to confirm the bot's role is higher in the hierarchy
                const botRolePosition = member.guild.members.me.roles.highest.position;
                if (role && botRolePosition > role.position) {
                    // Assign the role if it exists and hierarchy allows it
                    await member.roles.add(role);
                } else {
                    console.log(`Role with ID ${roleId} is higher than the bot's role or does not exist in guild ${guildId}.`);
                }
            } else {
                console.log(`Bot does not have Administrator permissions in guild ${guildId}. Role assignment skipped.`);
            }
        } catch (error) {
            console.error('Error reading or assigning the auto-role:', error);
        }
    },
};
