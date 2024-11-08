const mongoose = require("mongoose");
const ScheduleDataSchema = new mongoose.Schema({
  tournament_id: {
    type: String,
  },
  group_id: {
    type: String,
  },
  filtered_Schdule: {
    type: [String],
  },
});
const ScheduleData=mongoose.model("ScheduleData",ScheduleDataSchema);
module.exports=ScheduleData