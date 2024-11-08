const mongoose = require("mongoose");
const { Schema } = mongoose;

const SelectedTeam = new Schema({
  matchId: { type: String },
  team: { type: [String] },
});

module.exports = mongoose.model("SelectedTeam", SelectedTeam);