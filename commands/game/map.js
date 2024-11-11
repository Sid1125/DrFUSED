const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

// Define regions and their sub-regions along with unique monsters (taken from your explore command)
const regions = {
    'Mystic Forest': {
        subRegions: [
            'Enchanted Glade',
            'Whispering Thicket',
            'Dark Hollow',
            'Moonlit Grove',
            'Faerie Glens',
        ],
        monsters: [
            { name: 'Forest Spirit', health: 40 },
            { name: 'Woodland Sprite', health: 25 },
            { name: 'Treant', health: 70 },
            { name: 'Elder Wolf', health: 50 },
            { name: 'Giant Spider', health: 60 },
        ],
    },
    'Crystal Caves': {
        subRegions: [
            'Glimmering Tunnel',
            'Echoing Chamber',
            'Stalactite Cavern',
            'Shimmering Hall',
            'Diamond Depths',
        ],
        monsters: [
            { name: 'Crystal Golem', health: 90 },
            { name: 'Cave Bat', health: 20 },
            { name: 'Rock Elemental', health: 80 },
            { name: 'Lurking Shadow', health: 60 },
            { name: 'Gem Enchanter', health: 70 },
        ],
    },
    'Desert of Illusions': {
        subRegions: [
            'Mirage Oasis',
            'Sandstorm Valley',
            'Hidden Tomb',
            'Whispering Dunes',
            'Lost City Ruins',
        ],
        monsters: [
            { name: 'Sand Serpent', health: 50 },
            { name: 'Phantom Guardian', health: 70 },
            { name: 'Desert Scorpion', health: 40 },
            { name: 'Cursed Mummy', health: 60 },
            { name: 'Illusionist', health: 55 },
        ],
    },
    'Frozen Tundra': {
        subRegions: [
            'Glacier Falls',
            'Frostbitten Cliffs',
            'Snowdrift Plains',
            'Icy Caverns',
            'Northern Lights Valley',
        ],
        monsters: [
            { name: 'Ice Troll', health: 80 },
            { name: 'Frost Elemental', health: 75 },
            { name: 'Snow Leopard', health: 50 },
            { name: 'Wraith of Winter', health: 90 },
            { name: 'Snow Golem', health: 60 },
        ],
    },
    'Volcanic Wasteland': {
        subRegions: [
            'Lava Pits',
            'Ashen Plains',
            'Ember Ridge',
            'Scorched Hollow',
            'Magma Chamber',
        ],
        monsters: [
            { name: 'Fire Elemental', health: 100 },
            { name: 'Magma Beast', health: 90 },
            { name: 'Lava Drake', health: 120 },
            { name: 'Ashen Zombie', health: 70 },
            { name: 'Ember Sprite', health: 40 },
        ],
    },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('map')
        .setDescription('View the map of the game world, including regions, sub-regions, and monsters.'),
    category: 'game',
    async execute(interaction) {
        const user = await User.findOne({ userId: interaction.user.id });
        if (!user || !user.startedJourney) return interaction.reply('You need to start your journey first!');

        const mapEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("🌍 Game World Map")
            .setDescription("You have unlocked the following regions:\n\nUse **/explore** to discover more!")
            .setFooter({ text: 'Happy exploring!' });

        // Iterate over each unlocked region
        user.unlockedRegions.forEach(region => {
            const regionDetails = regions[region];
            if (regionDetails) {
                const subRegionsList = regionDetails.subRegions.join(', ');
                const monstersList = regionDetails.monsters.map(monster => `🐉 ${monster.name}`).join(', '); // Adding a dragon emoji for monsters

                mapEmbed.addFields(
                    { name: `📍 ${region}`, value: `**Sub-regions:**\n${subRegionsList}\n\n**Monsters:**\n${monstersList}`, inline: false }
                );
            } else {
                mapEmbed.addFields({ name: `📍 ${region}`, value: 'Region details not available.', inline: false });
            }
        });

        if (mapEmbed.data.fields.length === 0) {
            return interaction.reply('You have not unlocked any regions yet! Start exploring to unlock them!');
        }

        await interaction.reply({ embeds: [mapEmbed] });
    },
};
