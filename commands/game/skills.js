const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

// Skill tree with 3-letter IDs
const skillTree = {
    atk: {
        name: 'Attack',
        baseBuff: 0.1,
        descriptions: [
            'Basic attack damage.',
            'Increased attack damage.',
            'Significantly increased attack damage.',
            'Expert attack damage.',
            'Master attack damage.',
        ],
    },
    def: {
        name: 'Defense',
        baseBuff: 0.1,
        descriptions: [
            'Basic defense.',
            'Increased defense.',
            'Significantly increased defense.',
            'Expert defense.',
            'Master defense.',
        ],
    },
    mag: {
        name: 'Magic',
        baseBuff: 0.1,
        descriptions: [
            'Basic magic abilities.',
            'Increased magic power.',
            'Significantly increased magic power.',
            'Expert magic power.',
            'Master magic power.',
        ],
    },
};

const calculateItemBuffs = (user) => {
    let attackBuff = 0;
    let defenseBuff = 0;
    let magicBuff = 0;

    if (user.equippedWeapon && user.equippedWeapon.type === 'Weapon') {
        attackBuff += user.equippedWeapon.effectiveness;
    }

    if (user.equippedArmor && user.equippedArmor.type === 'Armor') {
        defenseBuff += user.equippedArmor.effectiveness;
    }

    return { attackBuff, defenseBuff, magicBuff };
};

const calculatePotionBuffs = (user) => {
    let attackBuff = 0;
    let defenseBuff = 0;
    let magicBuff = 0;

    const currentTime = Date.now();

    // Ensure activeEffects is an object and exists
    if (user.activeEffects && typeof user.activeEffects === 'object') {
        for (const [potionId, effect] of Object.entries(user.activeEffects)) {
            if (effect.expiresAt > currentTime) {
                if (effect.description.includes('Attack')) {
                    attackBuff += effect.effectiveness;
                }
                if (effect.description.includes('Defense')) {
                    defenseBuff += effect.effectiveness;
                }
                if (effect.description.includes('Magic')) {
                    magicBuff += effect.effectiveness;
                }
            }
        }
    }

    return { attackBuff, defenseBuff, magicBuff };
};


module.exports = {
    data: new SlashCommandBuilder()
        .setName('skills')
        .setDescription('View your skills.'),
    category: 'game',

    async execute(interaction) {
        await interaction.deferReply();
    
        const userId = interaction.user.id;
        try {
            const user = await User.findOne({ userId });
    
            if (!user || !user.startedJourney) {
                // Use followUp after deferReply
                return interaction.followUp('❌ You need to start your journey first! Use `/startjourney` to begin.');
            }
    
            const { attackBuff: itemAttackBuff, defenseBuff: itemDefenseBuff, magicBuff: itemMagicBuff } = calculateItemBuffs(user);
            const { attackBuff: potionAttackBuff, defenseBuff: potionDefenseBuff, magicBuff: potionMagicBuff } = calculatePotionBuffs(user);
    
            const totalAttackBuff = itemAttackBuff + potionAttackBuff;
            const totalDefenseBuff = itemDefenseBuff + potionDefenseBuff;
            const totalMagicBuff = itemMagicBuff + potionMagicBuff;
    
            const skillsEmbed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle('Your Skills')
                .setDescription(
                    `**Attack**: Level ${user.skills.atk || 1} (+${totalAttackBuff.toFixed(2)} buff from items/potions)\n` +
                    `**Defense**: Level ${user.skills.def || 1} (+${totalDefenseBuff.toFixed(2)} buff from items/potions)\n` +
                    `**Magic**: Level ${user.skills.mag || 1} (+${totalMagicBuff.toFixed(2)} buff from items/potions)\n`
                )
                .addFields(
                    { name: 'Skill Points', value: `You have ${user.skillPoints || 0} skill points.` },
                    { name: 'Upgrade', value: 'Type `/upgrade <skill>` to upgrade your skills.' }
                );
    
            // Use followUp after deferReply
            await interaction.followUp({ embeds: [skillsEmbed] });
    
        } catch (error) {
            console.error(error);
            // Use followUp after deferReply
            return interaction.followUp('❌ There was an error checking your skills. Please try again later.');
        }
    },    
};
