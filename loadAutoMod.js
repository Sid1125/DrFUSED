async function loadAutoMod(client) {
    try {
        // Dynamically import automod module
        const autoModEvent = await import('./commands/moderation/autoMod.js'); // Correct path to automod.js
        
        // Check if the imported module has the execute function
        if (typeof autoModEvent.execute !== 'function') {
            throw new Error('autoModEvent does not have an execute function');
        }

        console.log("AutoMod module loaded successfully.");

        // Set up the messageCreate event for AutoMod
        client.on('messageCreate', async (message) => {
            await autoModEvent.execute(message);
        });

        console.log("AutoMod initialized on messageCreate event.");

    } catch (error) {
        console.error("Failed to load AutoMod module:", error);
    }
}

module.exports = loadAutoMod;
