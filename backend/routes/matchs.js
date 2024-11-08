const express = require('express');
const router = express.Router();
const MatchModel = require("../Models/MatchModel");

// Create a new match
router.post('/creatematch', async (req, res) => {
    try {
        const match = new MatchModel(req.body);
        await match.save();
        res.status(201).json(match);
    } catch (error) {
        console.error('Error creating match:', error);
        res.status(500).json({ error: 'Failed to create match' });
    }
});

// Fetch all matches by group_id
router.get("/fetchallmatches/:id", async (req, res) => {
  try {
    const matches = await MatchModel.find({ group_id: req.params.id }).sort({
      match_no: -1,
    });
    res.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});


// Update match by ID
router.put('/updatematch/:id', async (req, res) => {
    try {
        const matchId = req.params.id;
        const updatedMatch = await MatchModel.findByIdAndUpdate(
            matchId,
            req.body,
            { new: true } // To return the updated match
        );
        if (!updatedMatch) {
            return res.status(404).json({ error: 'Match not found' });
        }
        res.json(updatedMatch);
    } catch (error) {
        console.error('Error updating match:', error);
        res.status(500).json({ error: 'Failed to update match' });
    }
});

// Delete match by ID
router.delete('/deletematch/:id', async (req, res) => {
    try {
        const deletedMatch = await MatchModel.findByIdAndDelete(req.params.id);
        if (!deletedMatch) {
            return res.status(404).json({ error: 'Match not found' });
        }
        res.json({ message: 'Match has been deleted' });
    } catch (error) {
        console.error('Error deleting match:', error);
        res.status(500).json({ error: 'Failed to delete match' });
    }
});

module.exports = router;
