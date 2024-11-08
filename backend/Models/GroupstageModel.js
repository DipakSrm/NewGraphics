const mongoose = require("mongoose");
const { Schema } = mongoose;


const GroupstageModel = new Schema({
  tournament_id: {
    type:String,
  },
  title:{
    type:String,
    require:true,
  },
  total_matches:{
    type: Number,
    require:true,
  }
});



module.exports = mongoose.model("groupstage", GroupstageModel);