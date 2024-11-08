const express = require("express");
const router = express.Router();
const TeamModel = require("../Models/TeamModel");

// Create a new team
router.post("/createteam", async (req, res) => {
  try {
    const existingTeam = await TeamModel.findOne({ teamName: req.body.teamName });
    if (existingTeam) {
      return res.status(400).json({ error: "Team name must be unique" });
    }

    const team = new TeamModel(req.body);
    await team.save();
    res.status(201).json(team);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get("/fetchteamplayer/:id", async (req, res) => {
  try {
    const team = await TeamModel.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const players = [
      team.player_1,
      team.player_2,
      team.player_3,
      team.player_4,
      team.player_5,
      team.player_6,
      team.player_7,
    ];

    res.status(200).json(players);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Fetch all teams
router.get("/fetchallteams", async (req, res) => {
  try {
    const teams = await TeamModel.find();
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Fetch all team names
router.get("/fetchallteamsname", async (req, res) => {
  try {
    const teams = await TeamModel.find({}, "teamName");
    res.json(teams.map(team => team.teamName));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a team
router.delete("/deleteteam/:id", async (req, res) => {
  try {
    await TeamModel.findByIdAndDelete(req.params.id);
    res.json("Team has been deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Update a team
router.put("/updateteam/:id", async (req, res) => {
  try {
    const teamId = req.params.id;
    const updatedTeamData = req.body;

    // Find the existing team
    const team = await TeamModel.findById(teamId);

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Check if the team name is unique
    if (updatedTeamData.teamName) {
      const existingTeam = await TeamModel.findOne({ teamName: updatedTeamData.teamName });
      if (existingTeam && existingTeam._id.toString() !== teamId) {
        return res.status(400).json({ error: "Team name must be unique" });
      }
    }

    // Update team fields
    team.teamName = updatedTeamData.teamName || team.teamName;
    team.teamTag = updatedTeamData.teamTag || team.teamTag;
    team.teamLogo = updatedTeamData.teamLogo || team.teamLogo;

    // Update players while preserving _id
    for (let i = 1; i <= 7; i++) {
      const playerField = `player_${i}`;
      if (updatedTeamData[playerField]) {
        team[playerField].name = updatedTeamData[playerField].name || team[playerField].name;
        team[playerField].photo = updatedTeamData[playerField].photo || team[playerField].photo;
        team[playerField].status = updatedTeamData[playerField].status !== undefined ? updatedTeamData[playerField].status : team[playerField].status;
      }
    }

    // Save the updated team
    const updatedTeam = await team.save();
    res.json(updatedTeam);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


// Toggle player status
router.put("/toggleplayerstatus/:playerId", async (req, res) => {
  try {
    const playerId = req.params.playerId;

    const team = await TeamModel.findOne({
      $or: [
        { "player_1._id": playerId },
        { "player_2._id": playerId },
        { "player_3._id": playerId },
        { "player_4._id": playerId },
        { "player_5._id": playerId },
        { "player_6._id": playerId },
        { "player_7._id": playerId },
      ],
    });

    if (!team) {
      return res.status(404).json({ error: "Player not found" });
    }

    const players = ['player_1', 'player_2', 'player_3', 'player_4', 'player_5', 'player_6', 'player_7'];
    let player;
    for (const p of players) {
      if (team[p]._id.toString() === playerId) {
        player = team[p];
        break;
      }
    }

    if (!player) {
      return res.status(404).json({ error: "Player not found in the team" });
    }

    player.status = !player.status;

    await team.save();
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
