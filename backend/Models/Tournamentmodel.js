  const mongoose = require('mongoose');
  const { Schema } = mongoose;
  const GroupstageModel = require('./GroupstageModel');

  const TournamentModel = new Schema({
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    url2: {
      type: String,
    },
    day: {
      type: String,
      required: true,
    },
    primaryColor: {
      type: String,
      required: true,
    },
    secondaryColor: {
      type: String,
      required: true,
    },
    textcolor1: {
      type: String,
      required: true,
    },
    textcolor2: {
      type: String,
      required: true,
    },
  });

  // Middleware to delete all associated group stages when a tournament is deleted
  TournamentModel.pre('deleteOne', { document: false, query: true }, async function(next) {
    const tournamentId = this.getFilter()['_id'];
    await GroupstageModel.deleteMany({ tournament_id: tournamentId });
    next();
  });

  module.exports = mongoose.model('tournament', TournamentModel);
