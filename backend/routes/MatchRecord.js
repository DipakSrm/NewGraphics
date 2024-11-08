const express = require('express');
const router = express.Router();
const MatchRecord = require('../Models/MatchRecordSchema');
const Tournament = require('../Models/Tournamentmodel');
const Groupstage = require('../Models/GroupstageModel');
const Match = require('../Models/MatchModel');
const Matchdata = require('../Models/MatchdataModel');
const ScheduleData = require("../Models/ScheduleModel");
const MatchModel = require('../Models/MatchModel');
let deadTeamStack = [];

// Function to get the current dead team from the stack
function getCurrentDeadTeam() {
    return deadTeamStack.length > 0 ? deadTeamStack[deadTeamStack.length - 1] : null;
}

router.put('/:tournamentId/:groupId/:matchId', async (req, res) => {
    const { tournamentId, groupId, matchId } = req.params;

    try {
        let matchRecord = await MatchRecord.findOne({ tournamentId });

        if (!matchRecord) {
            matchRecord = new MatchRecord({
                tournamentId,
                groupId,
                matchId
            });

            await matchRecord.save();
        } else {
            matchRecord.groupId = groupId;
            matchRecord.matchId = matchId;

            await matchRecord.save();
        }

        res.status(200).json({ message: 'Match record updated successfully', matchRecord });
    } catch (error) {
        console.error('Error updating match record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.put('/updatematchteamplayers/:matchid/:teamname', async (req, res) => {
    const { matchid, teamname } = req.params;
    const { players } = req.body; 
  
    try {
      let match = await MatchdataModel.findOne({ matchId: matchid });
  
      if (!match) {
        return res.status(404).json({ message: 'Match data not found' });
      }
  
      let teamToUpdate = match.value.find(team => team.teamName === teamname);
  
      if (!teamToUpdate) {
        return res.status(404).json({ message: 'Team not found in match data' });
      }
  
      for (let i = 0; i < 4; i++) {
        teamToUpdate[`player_${i + 1}`] = players[i] ? {
          _id: players[i]._id,
          name: players[i].name,
          photo: players[i].photo
        } : { _id: "", name: "", photo: "" };
      }
  
      await match.save();
  
      res.status(200).json({ message: 'Team players updated successfully', data: match });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const firstBloodCache = {};

  // Helper function to get first blood information
  const getFirstBloodInfo = (matchData) => {
      let firstBloodInfo = null;
  
      for (const team of matchData.value) {
          for (const player of [team.player_1, team.player_2, team.player_3, team.player_4]) {
              // Check if the player has any kills
              if (player.kills && player.kills > 0) {
                  // If this is the first player with kills, record their information
                  if (!firstBloodInfo) {
                      firstBloodInfo = {
                          playerName: player.name,
                          playerPhoto: player.photo,
                          teamName: team.teamName,
                          teamLogo: team.teamLogo,
                        
                      };
                  }
                  // No need to continue once we have found the first player with kills
                  firstBloodCache[matchData.matchId] = firstBloodInfo;  // Corrected caching line
                  return firstBloodInfo;
              }
          }
      }
  
      // Return null if no kills were found
      return null;
  };
  // this is helper function to get the kill count of player for domination
// Helper function to get the next milestone information
// Helper function to get the next milestone information

// Predefined milestones
const milestones = [
  { kills: 5, name: "Domination" },
  { kills: 6, name: "Rampage" },
  { kills: 8, name: "Legendary" },
  { kills: 10, name: "Unstoppable" },
];

// Helper function to get the next milestone information
// Helper function to get the next milestone information
const getNextMilestone = (player, milestones) => {
  const currentKills = player.kills;

  // Iterate through milestones in reverse order to prioritize higher milestones
  for (let i = milestones.length - 1; i >= 0; i--) {
    const milestone = milestones[i];

    // If the player's kills match or exceed the milestone and they haven't yet reached it
    if (currentKills >= milestone.kills && player.milestone !== milestone.name) {
      return {
        milestoneName: milestone.name,
        kills: milestone.kills,
      };
    }
  }

  // Return null if no new milestone is reached
  return null;
};

// Router to get milestone information for a specific tournament
router.get("/kills/:tournamentId", async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const matchRecord = await MatchRecord.findOne({ tournamentId });

    if (!matchRecord) {
      return res.status(404).json({ error: "Match record not found" });
    }

    const { matchId } = matchRecord;
    const matchData = await Matchdata.findOne({ matchId });

    if (!matchData) {
      return res.status(404).json({ error: "Match data not found" });
    }

    const milestonePlayers = [];
    const teams = matchData.value;

    // Iterate through teams and players
    teams.forEach((team) => {
      const players = [
        team.player_1,
        team.player_2,
        team.player_3,
        team.player_4,
        team.player_5,
      ];

      players.forEach((player) => {
        if (!player || player.kills === 0) return;

        // First, check if player achieved a new milestone
        const nextMilestone = getNextMilestone(player, milestones);
        if (nextMilestone) {
          // Update the player's milestone and record the latest kill
          player.milestone = nextMilestone.milestoneName;
        }

        // Only add the player to the milestonePlayers list if they have a milestone
        if (player.milestone) {
          milestonePlayers.push({
            playerName: player.name,
            playerPhoto: player.photo,
            teamName: team.teamName,
            teamLogo: team.teamLogo,
            kills: player.kills,
            milestone: player.milestone,
            latestKill: player.latestKill,
          });
        }
      });
    });

    // If no players achieved a new milestone
    if (milestonePlayers.length === 0) {
      return res
        .status(404)
        .json({ error: "No players found with a new milestone" });
    }

    // Sort milestonePlayers by latestKill (latest first)
    milestonePlayers.sort((a, b) => {
      const timeA = new Date(a.latestKill).getTime();
      const timeB = new Date(b.latestKill).getTime();
      return timeB - timeA;
    });

    // Return the sorted players with their latest achievements
    return res.status(200).json({
      status: true,
      milestonePlayers,
    });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/firstblood/:tournamentId", async (req, res) => {
  const { tournamentId } = req.params;

  try {
    console.log(`Fetching match record for tournamentId: ${tournamentId}`);
    // Fetch match record to get matchId
    const matchRecord = await MatchRecord.findOne({ tournamentId });
    if (!matchRecord) {
      console.error(`Match record not found for tournamentId: ${tournamentId}`);
      return res.status(404).json({ error: "Match record not found" });
    }

    const { matchId } = matchRecord;
    console.log(`Found matchId: ${matchId} for tournamentId: ${tournamentId}`);

    // Check if we already have first blood info for this match
    if (firstBloodCache[matchId]) {
      console.log(`Returning cached first blood info for matchId: ${matchId}`);
      return res.status(200).json({
        status: true,
        firstBloodInfo: firstBloodCache[matchId],
      });
    }

    // Fetch match data for the matchId
    console.log(`Fetching match data for matchId: ${matchId}`);
    const matchData = await Matchdata.findOne({ matchId });
    if (!matchData) {
      console.error(`Match data not found for matchId: ${matchId}`);
      return res.status(404).json({ error: "Match data not found" });
    }

    // Determine the first blood player
    const firstBloodInfo = getFirstBloodInfo(matchData);

    if (!firstBloodInfo) {
      console.error("No kills found");
      return res.status(404).json({ error: "No kills found" });
    }

    // Cache the first blood information for this match
    firstBloodCache[matchId] = firstBloodInfo;
    console.log(`Caching first blood info for matchId: ${matchId}`);

    res.status(200).json({
      status: true,
      firstBloodInfo,
    });
  } catch (error) {
    console.error("Error fetching first blood:", error);
    console.error(error.stack); // This will provide the stack trace
    res.status(500).json({ error: "Internal Server Error" });
  }
});
  
router.get("/alive/:tournamentId", async (req, res) => {
  const { tournamentId } = req.params;

  try {
    console.log(`Fetching match record for tournamentId: ${tournamentId}`);
    const matchRecord = await MatchRecord.findOne({ tournamentId });
    if (!matchRecord) {
      console.error(`Match record not found for tournamentId: ${tournamentId}`);
      return res.status(404).json({ error: "Match record not found" });
    }

    const { groupId, matchId } = matchRecord;
    console.log(`Match record found: groupId: ${groupId}, matchId: ${matchId}`);

    console.log(`Fetching tournament with ID: ${tournamentId}`);
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      console.error(`Tournament not found with ID: ${tournamentId}`);
      return res.status(404).json({ error: "Tournament not found" });
    }

    console.log(`Fetching match data for matchId: ${matchId}`);
    const matchdata = await Matchdata.findOne({ matchId });
    if (!matchdata) {
      console.error(`Match data not found for matchId: ${matchId}`);
      return res.status(404).json({ error: "Match data not found" });
    }

    const overallTeamStats = {};
    console.log(`Fetching matches for groupId: ${groupId}`);
    const matches = await Match.find({ group_id: groupId });

    for (const match of matches) {
      if (match._id.toString() !== matchId.toString()) {
        console.log(`Fetching match data for matchId: ${match._id}`);
        const matchData = await Matchdata.findOne({ matchId: match._id });
        if (matchData) {
          matchData.value.forEach((team) => {
            if (!overallTeamStats[team._id]) {
              overallTeamStats[team._id] = {
                teamName: team.teamName,
                teamTag: team.teamTag,
                teamLogo: team.teamLogo,
                totalkills: 0,
                totalpoints: 0,
                rankpoint: 0,
              };
            }
            overallTeamStats[team._id].totalkills += team.totalkills;
            overallTeamStats[team._id].totalpoints += team.totalpoints;
            overallTeamStats[team._id].rankpoint += team.rankpoint;
          });
        }
      }
    }

    const teamStatuses = matchdata.value.map((team) => {
      const overallpoints = overallTeamStats[team._id]
        ? overallTeamStats[team._id].totalpoints
        : 0;
      const alivePlayerCount = [
        team.player_1,
        team.player_2,
        team.player_3,
        team.player_4,
      ].filter((player) => player.status).length;

      return {
        teamName: team.teamName,
        teamTag: team.teamTag,
        totalkills: team.totalkills,
        teamLogo: team.teamLogo,
        overallpoints,
        alivePlayerCount,
      };
    });

    teamStatuses.sort((a, b) => b.overallpoints - a.overallpoints);

    deadTeamStack = deadTeamStack.filter((deadTeam) => {
      const team = matchdata.value.find(
        (t) => t.teamName === deadTeam.teamName
      );
      if (!team) return false;
      const aliveCount = [
        team.player_1,
        team.player_2,
        team.player_3,
        team.player_4,
      ].filter((player) => player.status).length;
      return aliveCount === 4;
    });

    matchdata.value.forEach((team) => {
      const aliveCount = [
        team.player_1,
        team.player_2,
        team.player_3,
        team.player_4,
      ].filter((player) => player.status).length;
      if (aliveCount === 4) {
        const teamAlreadyInStack = deadTeamStack.some(
          (deadTeam) => deadTeam.teamName === team.teamName
        );
        if (!teamAlreadyInStack) {
          deadTeamStack.push({
            teamName: team.teamName,
            totalkills: team.totalkills,
            teamLogo: team.teamLogo,
          });
        }
      }
    });

    const currentDeadTeam = getCurrentDeadTeam();

    res.status(200).json({
      status: true,
      groupId,
      matchId,
      tournament,
      teams: teamStatuses,
      currentDeadTeam,
      deadTeams: deadTeamStack,
    });
  } catch (error) {
    console.error("Error fetching alive status:", error);
    console.error(error.stack); // This will provide the stack trace
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get('/erangel/:tournamentId', async (req, res) => {
    const { tournamentId } = req.params;
    const mapName = 'ERANGEL';

    try {
        // Find the match record by tournament ID to get the group ID
        const matchRecord = await MatchRecord.findOne({ tournamentId });
        if (!matchRecord) {
            return res.status(404).json({ error: 'Match record not found' });
        }

        const { groupId } = matchRecord;

        // Find the group stage associated with the group ID
        const groupstage = await Groupstage.findOne({ _id: groupId });
        if (!groupstage) {
            return res.status(404).json({ error: 'Group stage not found' });
        }

        // Find all matches with the specified group ID and map name
        const matches = await Match.find({ group_id: groupId, map: mapName });
        if (matches.length === 0) {
            return res.status(404).json({ error: 'No matches found for ERANGEL on the specified group' });
        }

        const overallTeamStats = {};

        // Loop through the matches to accumulate team stats
        for (const match of matches) {
            const matchData = await Matchdata.findOne({ matchId: match._id });
            if (matchData) {
                matchData.value.forEach(team => {
                    if (!overallTeamStats[team._id]) {
                        overallTeamStats[team._id] = {
                            teamName: team.teamName,
                            teamTag: team.teamTag,
                            teamLogo: team.teamLogo,
                            totalkills: 0,
                            totalpoints: 0,
                            rankpoint: 0,
                            position1Count: 0
                        };
                    }

                    overallTeamStats[team._id].totalkills += team.totalkills;
                    overallTeamStats[team._id].totalpoints += team.totalpoints;
                    overallTeamStats[team._id].rankpoint += team.rankpoint;

                    if (team.position === 1) {
                        overallTeamStats[team._id].position1Count += 1;
                    }
                });
            }
        }

        // Sort overall teams
        const overallSortedTeams = Object.values(overallTeamStats).sort((a, b) => {
            if (b.totalpoints !== a.totalpoints) return b.totalpoints - a.totalpoints;
            if (b.rankpoint !== a.rankpoint) return b.rankpoint - a.rankpoint;
            return b.totalkills - a.totalkills;
        }).slice(0, 4); // Get top 4 teams

        res.status(200).json({
            tournamentId,
            groupId,
            topTeams: overallSortedTeams
        });
    } catch (error) {
        console.error('Error fetching matches for ERANGEL:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.get('/:tournamentId', async (req, res) => {
    const { tournamentId } = req.params;
    console.log(tournamentId);
    try {
      const matchRecord = await MatchRecord.findOne({ tournamentId });

      if (!matchRecord) {
        return res.status(404).json({ error: "Match record not found" });
      }

      const { groupId, matchId } = matchRecord;

      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }

      const groupstage = await Groupstage.findOne({
        tournament_id: tournamentId,
        _id: groupId,
      });
      if (!groupstage) {
        return res.status(404).json({ error: "Group stage not found" });
      }

      const match = await Match.findOne({ _id: matchId, group_id: groupId });
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

          const matchdata = await Matchdata.findOne({ matchId });
        if (!matchdata) {
            return res.status(404).json({ error: "Match data not found" });
        }

        const sortedTeams = [...matchdata.value].sort((a, b) => {
            if (b.totalpoints !== a.totalpoints)
                return b.totalpoints - a.totalpoints;
            if (b.rankpoint !== a.rankpoint) return b.rankpoint - a.rankpoint;
            return b.totalkills - a.totalkills;
        });



      const players = [];
      matchdata.value.forEach((team) => {
        players.push(
          ...[team.player_1, team.player_2, team.player_3, team.player_4]
        );
      });
const handleKDlogic = async (playerId) => {
  let statusCount = 0; // Track how many times the player's status is true (alive)
  let totalKills = 0; // Track the total kills of the player
  let totalDeaths = 0; // Track the total deaths of the player (status false)

  try {
    // Step 1: Find all matches for a specific group
    const matches = await Match.find({ group_id: groupId });

    // Step 2: Loop through each match
    for (const match of matches) {
      // Step 3: Retrieve the match data for the current match
      const matchData = await Matchdata.findOne({ matchId: match._id });

      if (matchData) {
        const teams = matchData.value; // Retrieve the teams array

        // Step 4: Loop through each team
        for (const team of teams) {
          // Iterate through each player within the team structure (player_1, player_2, player_3, player_4)
          [team.player_1, team.player_2, team.player_3, team.player_4].forEach(
            (player) => {
              // Check if the player's ID matches
              if (player._id === playerId) {
                // Increment statusCount if the player is alive
                if (player.status === true) {
                  statusCount++;
                } else {
                  // Increment totalDeaths if the player's status is false (not alive)
                  totalDeaths++;
                }

                // Aggregate the player's kills
                totalKills += player.kills;
              }
            }
          );
        }
      }
    }

    // Step 5: Return both the statusCount, totalKills, and totalDeaths
    return { statusCount, totalKills, totalDeaths };
  } catch (error) {
    console.error("Error in handleKDlogic:", error);
    return { statusCount: 0, totalKills: 0, totalDeaths: 0 }; // Return default values if there's an error
  }
};

      const topPlayers = await Promise.all(
        players
          .sort((a, b) => b.kills - a.kills)
          .slice(0, 4)
          .map(async (player) => {
            // Make the map function asynchronous
            const team = matchdata.value.find((team) =>
              [
                team.player_1._id,
                team.player_2._id,
                team.player_3._id,
                team.player_4._id,
              ].includes(player._id)
            );

            const totalTeamKills =
              team.player_1.kills +
              team.player_2.kills +
              team.player_3.kills +
              team.player_4.kills;

       const contribution =
         totalTeamKills > 0
           ? Math.round((player.kills / totalTeamKills) * 100 * 100) / 100 // Rounds to 2 decimal places
           : 0;


            // Logic to get KD
            const deathsAndKill = await handleKDlogic(player._id); // Await the async function
            const { statusCount, totalKills, totalDeaths } = deathsAndKill;

            // Example: Calculating KD ratio
            let KD;
            if (statusCount === 0) {
              KD = totalKills; // No deaths and no kills
             // Implies no deaths
            } else {
              KD = (totalKills / totalDeaths).toFixed(2); // Calculate the KD ratio
            }

            return {
              _id: player._id,
              name: player.name,
              kills: player.kills,
              photo: player.photo,
              teamName: team.teamName,
              teamLogo: team.teamLogo,
              contribution: contribution,
              kd: KD,
              totalkills: totalKills,
              rank:team.position
            };
          })
      );

      // Now `topPlayers` contains the resolved array of player stats

      const position1Team = matchdata.value.find((team) => team.position === 1);

      const overallTeamStats = {};
      const overallPlayerStats = {};
      const matchCounts = {};

      const matches = await Match.find({ group_id: groupId }).sort({
        match_no: -1,
      });
      for (const match of matches) {
        const matchData = await Matchdata.findOne({ matchId: match._id });
        if (matchData) {
          matchData.value.forEach((team) => {
            if (!overallTeamStats[team._id]) {
              overallTeamStats[team._id] = {
                teamName: team.teamName,
                teamTag: team.teamTag,
                teamLogo: team.teamLogo,
                totalkills: 0,
                totalpoints: 0,
                rankpoint: 0,
                position1Count: 0,
              };
            }

            overallTeamStats[team._id].totalkills += team.totalkills;
            overallTeamStats[team._id].totalpoints += team.totalpoints;
            overallTeamStats[team._id].rankpoint += team.rankpoint;

            if (team.position === 1) {
              overallTeamStats[team._id].position1Count += 1;
            }

            [
              team.player_1,
              team.player_2,
              team.player_3,
              team.player_4,
            ].forEach((player) => {
              if (!overallPlayerStats[player._id]) {
                overallPlayerStats[player._id] = {
                  name: player.name,
                  photo: player.photo,
                  kills: 0,
                  matches: 0,
                  teamId: team._id,
                  teamName: team.teamName,
                  teamLogo: team.teamLogo,
                };
              }

              overallPlayerStats[player._id].kills += player.kills;
              overallPlayerStats[player._id].matches += 1;

              if (!matchCounts[team._id]) {
                matchCounts[team._id] = 0;
              }
              matchCounts[team._id] += 1;
            });
          });
        }
      }

      const overallSortedTeams = Object.values(overallTeamStats).sort(
        (a, b) => {
          if (b.totalpoints !== a.totalpoints)
            return b.totalpoints - a.totalpoints;
          if (b.rankpoint !== a.rankpoint) return b.rankpoint - a.rankpoint;
          return b.totalkills - a.totalkills;
        }
      );

      const overallSortedPlayers = Object.values(overallPlayerStats)
        .map((player) => ({
          ...player,
          kd: (player.kills / player.matches).toFixed(2),
          contribution:
            overallTeamStats[player.teamId].totalkills > 0
              ? (
                  (player.kills / overallTeamStats[player.teamId].totalkills) *
                  100
                ).toFixed(1) + "%"
              : "0.00%",
        }))
        .sort((a, b) => b.kills - a.kills)
        .slice(0, 4);

    const schedule = await Promise.all(
      matches
        .map(async (match) => {
          const matchData = await Matchdata.findOne({ matchId: match._id });
          if (matchData) {
            const position1Team = matchData.value.find(
              (team) => team.position === 1
            );
            return {
              matchId: match._id,
              matchInfo: {
                matchName: match.match_no,
                matchTime: match.time,
                matchLocation: match.map,
              },
              position1Team: position1Team
                ? {
                    teamName: position1Team.teamName,
                    teamTag: position1Team.teamTag,
                    teamLogo: position1Team.teamLogo,
                  }
                : null,
            };
          }
          return null;
        })
        .filter((match) => match !== null)
    );

      res.status(200).json({
        tournament,
        groupstage,
        match,
        matchdata: matchdata.value,
    sortedTeams,
        position1Team,
        topPlayers,
        overallData: {
          teams: overallSortedTeams,
          players: overallSortedPlayers,
        },
        schedule,
      });
    } catch (error) {
        console.error('Error fetching match record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
//this is to find the filtered schedule
router.put("/:tournamentId/:groupId", async (req, res) => {
  const { tournamentId, groupId } = req.params;
  const { match_ids_schedule } = req.body; // Assuming this is an array passed in the request body

  try {
    // Step 1: Check if the document exists
    let schedule = await ScheduleData.findOne({
      tournament_id: tournamentId,
      group_id: groupId,
    });

    // Step 2: If not found, create a new document with an initial payload
    if (!schedule) {
      schedule = new ScheduleData({
        tournament_id: tournamentId,
        group_id: groupId,
        filtered_Schdule: match_ids_schedule, // Set initial payload here
      });
      await schedule.save();
      return res.status(201).send("Filtered schedule created successfully");
    }

    // Step 3: If found, update the existing document
    schedule.filtered_Schdule = match_ids_schedule;
    await schedule.save();

    return res.status(200).send("Filtered schedule updated successfully");
  } catch (error) {
    console.error("Error updating or creating filtered schedule:", error);
    return res.status(500).send("Internal Server Error");
  }
});

//used to show the filtered schedule
router.get("/:tournamentId/:groupId", async (req, res) => {
  const { tournamentId, groupId } = req.params;

  console.log("This is tournamentId and groupId:", tournamentId, groupId);

  try {
    // Find the schedule document that matches the tournamentId and groupId
    const schedule = await ScheduleData.findOne({
      tournament_id: tournamentId,
      group_id: groupId,
    });

    // Check if the schedule exists
    if (!schedule) {
      console.log("Your data is not found");
      return res.status(404).send("Schedule not found");
    } else {
      console.log("Schedule found");
    }

    // Retrieve the filtered_Schdule array
    const { filtered_Schdule } = schedule;

    // Retrieve match ID
    const matchRecord = await MatchRecord.findOne({
      tournamentId: tournamentId,
    });

    if (!matchRecord) {
      return res.status(404).json({ error: "Match record not found" });
    }

    const { matchId } = matchRecord;
    const {match_no}=MatchModel.findOne({_id:matchId})

    // Return the filtered_Schdule array and matchId in the response
    return res.status(200).json({
      filtered_Schdule,
      matchId,
    });
  } catch (error) {
    console.error("Error fetching filtered schedule:", error);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;




