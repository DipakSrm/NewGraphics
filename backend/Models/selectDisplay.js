const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const selectDisplaySchema = new Schema({
  tournament_id: { type: Schema.Types.ObjectId }, // Reference to Tournament model
  WwcdAlert: { type: Boolean, default: false },
  Wwcd: { type: Boolean, default: false },
  mvp: { type: Boolean, default: false },
  topGrager: { type: Boolean, default: false },
  matchStanding1: { type: Boolean, default: false },
  matchStanding2: { type: Boolean, default: false },
  matchStanding3: { type: Boolean, default: false },
  overallStanding1: { type: Boolean, default: false },
  overallStanding2: { type: Boolean, default: false },
  overallStanding3: { type: Boolean, default: false },
  overallStanding4: { type: Boolean, default: false },
  overallFragger: { type: Boolean, default: false },
  winner: { type: Boolean, default: false },
  firstRunnerUp: { type: Boolean, default: false },
  secondRunnerUp: { type: Boolean, default: false },
  eventFragger: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

const SelectDisplay = mongoose.model('selectdisplay', selectDisplaySchema);

module.exports = SelectDisplay;
