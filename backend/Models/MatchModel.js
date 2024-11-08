const mongoose = require("mongoose");
const { Schema } = mongoose;

const MatchModel = new Schema({
  group_id: {
    type:String,
  },
  match_no:{
    type:Number,
    require:true,
  },
  time:{
    type: String,
    require:true,
  },
  map:{
   type: String,
   require:true,
  }
});

module.exports = mongoose.model("matches", MatchModel);