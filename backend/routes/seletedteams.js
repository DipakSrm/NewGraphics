const express = require('express');
const router = express.Router();
const SelectedTeam = require("../Models/selectedteam");

router.put("/:matchId", async (req, res) => {
    const { matchId } = req.params;
    const { team } = req.body;
  
    try {
      const updatedTeam = await SelectedTeam.findOneAndUpdate(
        { matchId },
        { matchId, team },
        { new: true, upsert: true } // Create the document if it doesn't exist
      );
  
      res.status(200).json(updatedTeam);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while updating the team.' });
    }
  });

  module.exports =router
  