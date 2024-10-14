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

            const role = member.guild.roles.cache.get(roleId);
            
            // If the role exists, assign it to the new member
            if (role) {
                await member.roles.add(role);
                console.log(`Auto-assigned ${role.name} to ${member.user.tag} in guild ${guildId}.`);
            } else {
                console.log(`Role with ID ${roleId} not found in guild ${guildId}.`);
            }
        } catch (error) {
            console.error('Error reading or assigning the auto-role:', error);
        }
    },
};
