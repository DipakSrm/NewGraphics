
const mongoose = require("mongoose");
const { Schema } = mongoose;
const PlayerSchema = new Schema({
  name: {
    type: String,
  },
  photo: {
    type: String,
    default:"",
  },
  status:{
    type: Boolean,
    default: false
  }
});

const TeamModel = new Schema({
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
  player_5: {
    type: PlayerSchema,
  },
  player_6: {
    type: PlayerSchema,
  },
  player_7: {
    type: PlayerSchema,
  },
});

module.exports = mongoose.model("teamname", TeamModel);