const mongoose = require('mongoose');

// Define the party schema
const partySchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true, // Ensure each party code is unique
    },
    members: {
        type: [String], // Array of user IDs for party members
        required: true,
        default: [], // Default to an empty array
    },
});

// Method to add a member to the party
partySchema.methods.addMember = async function (userId) {
    // Add the userId to the members array if they are not already a member
    if (!this.members.includes(userId)) {
        this.members.push(userId);
        await this.save();
    }
};

// Method to remove a member from the party
partySchema.methods.removeMember = async function (userId) {
    // Remove the userId from the members array
    this.members = this.members.filter(member => member !== userId);
    await this.save();

    // If there are no more members, delete the party
    if (this.members.length === 0) {
        await this.deleteOne(); // Delete the party document
    }
};

// Create and export the Party model
module.exports = mongoose.model('Party', partySchema);
