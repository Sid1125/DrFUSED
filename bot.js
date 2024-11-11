const { Client, GatewayIntentBits, Partials, ActivityType, Collection, Events, EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require('fs');
const { clientId } = require('./config.json');
const { REST, Routes } = require('discord.js');
const User = require('./models/User');
const Chat = require('./models/Chat'); // Import Chat model
const mongoose = require('mongoose');
const { getGoogleGenerativeResponse } = require('./utils/chatgpt');
const loadAutoMod = require('./loadAutoMod');
mongoose.connect('uri')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction
    ]
});

const path = require('node:path');
module.exports = client;

client.commands = new Collection();
const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    await loadAutoMod(client);
    client.user.setPresence({
        activities: [{ name: `/help in ${client.guilds.cache.size} servers`, type: ActivityType.Listening }],
        status: 'online',
    });
    
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    
    if (interaction.customId === 'feedbackModal') {
        // Retrieve the data from the form
        const feedback = interaction.fields.getTextInputValue('feedbackInput');
        const username = interaction.fields.getTextInputValue('usernameInput') || 'Anonymous';

        // Create the feedback embed
        const feedbackEmbed = new EmbedBuilder()
            .setTitle('New Feedback Received')
            .addFields(
                { name: 'Username', value: username },
                { name: 'Feedback', value: feedback },
            )
            .setColor(0x00AE86)
            .setTimestamp();

        try {
            // Replace 'YOUR_USER_ID' with the developer's actual Discord ID
            const developerUser = await client.users.fetch('699257426712592385');
            await developerUser.send({ embeds: [feedbackEmbed] });
            await interaction.reply({ content: 'Thank you for your feedback! It has been sent to the developer.', ephemeral: true });
        } catch (error) {
            console.error('Could not send DM:', error);
            await interaction.reply({ content: 'There was an error sending your feedback. Please try again later.', ephemeral: true });
        }
    }
});

// Message listener for the chatbot functionality
client.on('messageCreate', async message => {
    if (message.author.bot) return; // Ignore bot messages

    // Check if there's a chatbot channel set for this guild
    const chatSettings = await Chat.findOne({ guildId: message.guild.id });
    
    if (chatSettings && chatSettings.channelId === message.channel.id) {
        const response = await getGoogleGenerativeResponse(message.content);
        message.reply(response);
    }
});

const rest = new REST({ version: '10' }).setToken('TOKEN'); // Replace with your bot token
(async () => {
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(`./commands/${folder}/${file}`);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.name) {
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        console.log(`Loaded event: ${event.name}`); // Log the loaded event
    } else {
        console.error(`Event file ${file} is missing a name property.`);
    }
}

const warningsFilePath = './commands/moderation/warnings.json';

// Function to reset warnings
function resetWarnings() {
    if (fs.existsSync(warningsFilePath)) {
        const warningsData = JSON.parse(fs.readFileSync(warningsFilePath));
        const now = Date.now();

        for (const guildId in warningsData) {
            for (const userId in warningsData[guildId]) {
                const userWarnings = warningsData[guildId][userId];
                
                // Check if the last warning was more than 10 days ago
                const lastWarningTime = userWarnings.lastWarningTime;
                if (now - lastWarningTime > 10 * 24 * 60 * 60 * 1000) { // 10 days in milliseconds
                    delete warningsData[guildId][userId];
                }
            }
        }

        fs.writeFileSync(warningsFilePath, JSON.stringify(warningsData, null, 2));
    }
}

// Set interval to check for expired warnings every day
setInterval(resetWarnings, 24 * 60 * 60 * 1000); // 1 day

client.login('TOKEN'); // Replace with your bot token
