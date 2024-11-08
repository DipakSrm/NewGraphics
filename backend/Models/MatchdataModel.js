const mongoose = require("mongoose");
const { Schema } = mongoose;

const PlayerSchema = new Schema({
  _id: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: true,
    default: "",
  },
  status: {
    type: Boolean,
    default: false,
  },
  kills: {
    type: Number,
    default: 0,
  },
  latestKill:{
    type:Date,
    default: Date.now,
  }
});

const TeamSchema = new mongoose.Schema({
  _id: {
    type: String,
    require: true,
  },
  teamName: {
    type: String,
    require: true,
  },
  teamTag: {
    type: String,
    require: true,
  },
  teamLogo: {
    type: String,
    require: true,
  },
  totalkills: {
    type: Number,
    default: 0,
  },
  totalpoints: {
    type: Number,
    default: 0,
  },
  rankpoint: {
    type: Number,
    default: 0,
  },
  position: {
    type: Number,
    default: 0,
  },
  player_1: {
    type: PlayerSchema,
  },
  player_2: {
    type: PlayerSchema,
  },
  player_3: {
    type: PlayerSchema,
  },
  player_4: {
    type: PlayerSchema,
  },
});

const MatchdataModelSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: true,
  },
  value: [TeamSchema],
});

const MatchdataModel = mongoose.model("Matchdata", MatchdataModelSchema);

module.exports = MatchdataModel;
