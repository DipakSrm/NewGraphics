const express = require('express');
const router = express.Router();
const SelectDisplay = require('../Models/selectDisplay');

// GET information by tournament_id
router.get('/:tournament_id', async (req, res) => {
    const tournamentId = req.params.tournament_id;

    try {
        // Find SelectDisplay document by tournament_id
        const selectDisplay = await SelectDisplay.findOne({ tournament_id: tournamentId });

        if (!selectDisplay) {
            return res.status(404).json({ error: 'SelectDisplay not found for this tournament' });
        }

        // Optionally, you can select specific fields to return or return the entire document
        res.json(selectDisplay);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});



module.exports = router;

router.put('/:tournament_id', async (req, res) => {
    const tournamentId = req.params.tournament_id;
    const {
      WwcdAlert,
      Wwcd,
      mvp,
      topGrager,
      matchStanding1,
      matchStanding2,
      matchStanding3,
      overallStanding1,
      overallStanding2,
      overallStanding3,
      overallStanding4,
      overallFragger,
      winner,
      firstRunnerUp,
      secondRunnerUp,
      eventFragger,
    } = req.body;

    try {
        let selectDisplay = await SelectDisplay.findOne({ tournament_id: tournamentId });

        if (!selectDisplay) {
            return res.status(404).json({ error: 'SelectDisplay not found for this tournament' });
        }

        // Update selectDisplay fields based on the request body
        selectDisplay.WwcdAlert = WwcdAlert || false;
        selectDisplay.Wwcd = Wwcd || false;
        selectDisplay.mvp = mvp || false;
        selectDisplay.topGrager = topGrager || false;
        selectDisplay.matchStanding1 = matchStanding1 || false;
        selectDisplay.matchStanding2 = matchStanding2 || false;
        selectDisplay.matchStanding3 = matchStanding3 || false;
        selectDisplay.overallStanding1 = overallStanding1 || false;
        selectDisplay.overallStanding2 = overallStanding2 || false;
          selectDisplay.overallStanding3 = overallStanding3 || false;
            selectDisplay.overallStanding4 = overallStanding4 || false;
        selectDisplay.overallFragger = overallFragger || false;

        // Set winner, firstRunnerUp, secondRunnerUp, eventFragger based on request body
        selectDisplay.winner = winner || false;
        selectDisplay.firstRunnerUp = firstRunnerUp || false;
        selectDisplay.secondRunnerUp = secondRunnerUp || false;
        selectDisplay.eventFragger = eventFragger || false;

        await selectDisplay.save();

        res.json(selectDisplay);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});





module.exports = router;