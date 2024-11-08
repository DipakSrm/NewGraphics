const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const connectToMongo = require("./db");
const mongoose = require("mongoose");
const TeamModel = require("./Models/TeamModel");
const MatchdataModel = require("./Models/MatchdataModel");
const app = express();
const server = http.createServer(app);
require('dotenv').config();
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT;

app.use(cors());
app.use(express.json());
connectToMongo();

app.use("/api/tournaments", require("./routes/tournament"));
app.use("/api/teams", require("./routes/teams"));
app.use("/api/groupstages", require("./routes/groupstage"));
app.use("/api/matches", require("./routes/matchs"));
app.use("/api/selectedteams", require("./routes/seletedteams"));
app.use("/api/matchdata", require("./routes/matchdata"));
app.use("/api/matchrecord", require("./routes/MatchRecord"));
app.use("/api/selectdisplay", require("./routes/selectDisplay"));

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('selectMatch', (matchId) => {
    io.emit('updateMatch', matchId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Set up watch for changes in TeamModel
const db = mongoose.connection;

db.once('open', () => {
  console.log('Connected to MongoDB now');

  const teamChangeStream = TeamModel.watch();

  teamChangeStream.on('change', async (change) => {
    if (change.operationType === 'update' || change.operationType === 'replace') {
      const updatedTeam = await TeamModel.findById(change.documentKey._id);
      await updateMatchDataWithTeamChanges(updatedTeam);
    }
  });
});

async function updateMatchDataWithTeamChanges(updatedTeam) {
  try {
    const matches = await MatchdataModel.find({ 'value._id': updatedTeam._id });

    for (let match of matches) {
      match.value.forEach(team => {
        if (team._id.toString() === updatedTeam._id.toString()) {
          // Update team details
          team.teamName = updatedTeam.teamName;
          team.teamTag = updatedTeam.teamTag;
          team.teamLogo = updatedTeam.teamLogo;

          // Update player details selectively
          for (let i = 1; i <= 7; i++) {
            const playerField = `player_${i}`;
            if (updatedTeam[playerField]) {
              if (updatedTeam[playerField].name) {
                team[playerField].name = updatedTeam[playerField].name;
              }
              if (updatedTeam[playerField].photo) {
                team[playerField].photo = updatedTeam[playerField].photo;
              }
            }
          }
        }
      });
      await match.save();
    }
  } catch (err) {
    console.error('Error updating match data with team changes:', err);
  }
}
