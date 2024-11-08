const express = require("express");
const router = express.Router();
const MatchdataModel = require("../Models/MatchdataModel");
const SelectedTeam = require("../Models/selectedteam"); // Import SelectedTeam model
const TeamModel = require("../Models/TeamModel"); // Import TeamModel

// PUT endpoint to create or update match data
router.put("/creatematchdata/:matchid", async (req, res) => {
  const matchId = req.params.matchid;
  const matchData = req.body; // Assuming req.body contains the match data

  try {
    // Retrieve selected team based on matchId from SelectedTeam collection
    const selectedTeam = await SelectedTeam.findOne({ matchId });

    if (!selectedTeam) {
      return res
        .status(404)
        .json({ message: "Selected team not found for matchId" });
    }

    // Initialize an array to store team data for MatchdataModel
    let teamsData = [];

    // Loop through each team name in selectedTeam.team
    for (let teamName of selectedTeam.team) {
      // Find the corresponding team in TeamModel
      const team = await TeamModel.findOne({ teamName });

      if (team) {
        // Collect first 4 players in an array
        const players = [];
        for (let i = 1; i <= 7; i++) {
          const playerKey = `player_${i}`;
          if (team[playerKey]) {
            players.push({
              _id: team[playerKey]._id,
              name: team[playerKey].name,
              photo: team[playerKey].photo,
            });

            // Limit to 4 players per team
            if (players.length >= 4) {
              break;
            }
          }
        }

        // Create an object with team information from TeamModel, including selected players
        const teamData = {
          _id: team._id,
          teamName: team.teamName,
          teamTag: team.teamTag,
          teamLogo: team.teamLogo,
          player_1:
            players.length > 0
              ? {
                  _id: players[0]._id,
                  name: players[0].name,
                  photo: players[0].photo,
                }
              : { _id: "", name: "", photo: "" },
          player_2:
            players.length > 1
              ? {
                  _id: players[1]._id,
                  name: players[1].name,
                  photo: players[1].photo,
                }
              : { _id: "", name: "", photo: "" },
          player_3:
            players.length > 2
              ? {
                  _id: players[2]._id,
                  name: players[2].name,
                  photo: players[2].photo,
                }
              : { _id: "", name: "", photo: "" },
          player_4:
            players.length > 3
              ? {
                  _id: players[3]._id,
                  name: players[3].name,
                  photo: players[3].photo,
                }
              : { _id: "", name: "", photo: "" },
        };

        // Push teamData to teamsData array
        teamsData.push(teamData);
      } else {
        console.log(`Team not found in TeamModel for teamName: ${teamName}`);
        // Handle if team is not found (skip, log, or throw error as per your requirement)
      }
    }

    // Update or create MatchdataModel with the teamsData
    let match = await MatchdataModel.findOne({ matchId });

    if (match) {
      // If match data exists, update it
      match.value = teamsData;
      await match.save();
      res
        .status(200)
        .json({ message: "Match data updated successfully", data: match });
    } else {
      // If match data doesn't exist, create new entry
      const newMatchData = new MatchdataModel({
        matchId,
        value: teamsData,
      });
      await newMatchData.save();
      res
        .status(201)
        .json({
          message: "Match data created successfully",
          data: newMatchData.value,
        });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:matchid", async (req, res) => {
  const matchId = req.params.matchid;

  try {
    // Find match data based on matchId
    const match = await MatchdataModel.findOne({ matchId });

    if (!match) {
      return res
        .status(404)
        .json({ message: "Match data not found for matchId" });
    }

    // Return match data
    res.status(200).json(match.value);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.put("/updatematchteamplayers/:matchid/:teamname", async (req, res) => {
  const { matchid, teamname } = req.params;
  const { players } = req.body;

  try {
    let match = await MatchdataModel.findOne({ matchId: matchid });

    if (!match) {
      return res.status(404).json({ message: "Match data not found" });
    }

    let teamToUpdate = match.value.find((team) => team.teamName === teamname);

    if (!teamToUpdate) {
      return res.status(404).json({ message: "Team not found in match data" });
    }

    for (let i = 0; i < 4; i++) {
      teamToUpdate[`player_${i + 1}`] = players[i]
        ? {
            _id: players[i]._id,
            name: players[i].name,
            photo: players[i].photo,
          }
        : { _id: "", name: "", photo: "" };
    }

    await match.save();

    res
      .status(200)
      .json({ message: "Team players updated successfully", data: match });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/updatematchplayer/:matchid/:playerid", async (req, res) => {
  const matchId = req.params.matchid;
  const playerId = req.params.playerid;
  const { kills, status, latestKill } = req.body;

  try {
    // Find the match data based on matchId
    const match = await MatchdataModel.findOne({ matchId });

    if (!match) {
      return res
        .status(404)
        .json({ message: "Match data not found for matchId" });
    }

    // Find and update the specific player within the match data
    let playerFound = false;
    match.value.forEach((team) => {
      ["player_1", "player_2", "player_3", "player_4", "player_5"].forEach(
        (playerKey) => {
          if (team[playerKey] && team[playerKey]._id === playerId) {
            team[playerKey].kills =
              kills !== undefined ? kills : team[playerKey].kills;
            team[playerKey].status =
              status !== undefined ? status : team[playerKey].status;
            playerFound = true;
              team[playerKey].latestKill =
                latestKill !== undefined ? latestKill : team[playerKey].latestKill;
              
          }
        }
      );
    });

    if (!playerFound) {
      return res
        .status(404)
        .json({ message: "Player not found in the match data" });
    }

    // Save the updated match data
    await match.save();

    res
      .status(200)
      .json({ message: "Player data updated successfully", data: match });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/updateteamstatus/:matchid/:teamid", async (req, res) => {
  const matchId = req.params.matchid;
  const teamId = req.params.teamid;
  const { value } = req.body;

  try {
    const match = await MatchdataModel.findOne({ matchId });

    if (!match) {
      return res
        .status(404)
        .json({ message: "Match data not found for matchId" });
    }

    const team = match.value.find((team) => team._id === teamId);

    if (!team) {
      return res
        .status(404)
        .json({ message: "Team not found in the match data" });
    }

    team.player_1.status = value;
    team.player_2.status = value;
    team.player_3.status = value;
    team.player_4.status = value;

    await match.save();

    res
      .status(200)
      .json({
        message: "Team player statuses updated successfully",
        data: match,
      });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/updateteamposition/:matchid/:teamid", async (req, res) => {
  const matchId = req.params.matchid;
  const teamId = req.params.teamid;
  const { position } = req.body;

  try {
    // Find the match data based on matchId
    const match = await MatchdataModel.findOne({ matchId });

    if (!match) {
      return res
        .status(404)
        .json({ message: "Match data not found for matchId" });
    }

    // Find the specific team within the match data
    let teamFound = false;
    match.value.forEach((team) => {
      if (team._id.toString() === teamId) {
        // Ensure the IDs match
        team.position = position !== undefined ? position : team.position;

        // Update rank point based on position
        const pos = parseInt(position, 10); // Convert position to integer
        switch (pos) {
          case 1:
            team.rankpoint = 10;
            break;
          case 2:
            team.rankpoint = 6;
            break;
          case 3:
            team.rankpoint = 5;
            break;
          case 4:
            team.rankpoint = 4;
            break;
          case 5:
            team.rankpoint = 3;
            break;
          case 6:
            team.rankpoint = 2;
            break;
          case 7:
          case 8:
            team.rankpoint = 1;
            break;
          default:
            team.rankpoint = 0;
            break;
        }

        teamFound = true;
      }
    });

    if (!teamFound) {
      return res
        .status(404)
        .json({ message: "Team not found in the match data" });
    }

    // Save the updated match data
    await match.save();

    res
      .status(200)
      .json({
        message: "Team position and rank point updated successfully",
        data: match,
      });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/updateteamstats/:matchid/:teamid", async (req, res) => {
  const matchId = req.params.matchid;
  const teamId = req.params.teamid;
  const { totalkills, totalpoints } = req.body;

  try {
    // Find the match data based on matchId
    const match = await MatchdataModel.findOne({ matchId });

    if (!match) {
      return res
        .status(404)
        .json({ message: "Match data not found for matchId" });
    }

    // Find the specific team within the match data
    let teamFound = false;
    match.value.forEach((team) => {
      if (team._id.toString() === teamId) {
        // Ensure the IDs match
        team.totalkills =
          totalkills !== undefined ? totalkills : team.totalkills;
        team.totalpoints =
          totalpoints !== undefined ? totalpoints : team.totalpoints;
        teamFound = true;
      }
    });

    if (!teamFound) {
      return res
        .status(404)
        .json({ message: "Team not found in the match data" });
    }

    // Save the updated match data
    await match.save();

    res
      .status(200)
      .json({
        message: "Team total kills and total points updated successfully",
        data: match,
      });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
