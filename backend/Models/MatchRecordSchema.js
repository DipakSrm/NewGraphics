const mongoose = require('mongoose');

const MatchRecordSchema = new mongoose.Schema({
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true
});

const MatchRecord = mongoose.model('MatchRecord', MatchRecordSchema);

module.exports = MatchRecord;
