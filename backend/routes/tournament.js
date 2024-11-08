const express = require('express');
const router = express.Router();
const Tournament = require('../Models/Tournamentmodel');
const SelectDisplay = require('../Models/selectDisplay'); // Adjusted import for SelectDisplay model

// Create tournament
router.post('/createtournament', async (req, res) => {
    try {
        const { name, url, day, primaryColor, secondaryColor, textcolor1, textcolor2 } = req.body;
        const newTournament = new Tournament({
            name,
            url,
            day,
            primaryColor,
            secondaryColor,
            textcolor1,
            textcolor2
        });

        const savedTournament = await newTournament.save();

        // Create corresponding SelectDisplay document
        const newSelectDisplay = new SelectDisplay({ tournament_id: savedTournament._id });
        await newSelectDisplay.save();

        res.status(201).json({ tournament: savedTournament, selectDisplay: newSelectDisplay });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Update tournament
router.put('/updatetournament/:id', async (req, res) => {
    try {
        const { name, url, url2, day, primaryColor, secondaryColor, textcolor1, textcolor2 } = req.body;
        const tournamentId = req.params.id;

        const updatedTournament = await Tournament.findByIdAndUpdate(
            tournamentId,
            { $set: { name, url, url2, day, primaryColor, secondaryColor, textcolor1, textcolor2 } },
            { new: true }
        );

        // Find or create SelectDisplay document
        let selectDisplay = await SelectDisplay.findOne({ tournament_id: tournamentId });
        if (!selectDisplay) {
            selectDisplay = new SelectDisplay({ tournament_id: tournamentId });
        }

        // Update selectDisplay fields as needed
        // Example: selectDisplay.WwcdAlert = true;

        await selectDisplay.save();

        res.json({ tournament: updatedTournament, selectDisplay });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Fetch all tournaments
router.get('/fetchalltournaments', async (req, res) => {
    try {
        const tournaments = await Tournament.find();
        res.json(tournaments);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Delete tournament and associated SelectDisplay document
router.delete('/deletetournament/:id', async (req, res) => {
    try {
        const tournamentId = req.params.id;

        // Delete tournament
        await Tournament.deleteOne({ _id: tournamentId });

        // Delete associated SelectDisplay document
        await SelectDisplay.deleteOne({ tournament_id: tournamentId });

        res.json({ message: 'Tournament and associated SelectDisplay deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
