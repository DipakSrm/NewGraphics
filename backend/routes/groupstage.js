const express = require('express');
const router = express.Router();
const GroupstageModel =require("../Models/GroupstageModel");

router.post('/creategroupstage',(req,res)=>{
  const groupstage = GroupstageModel(req.body)
  groupstage.save()
  res.send(groupstage)
  }
)
router.get('/fetchallgroups/:id',async (req,res)=>{
  const group = await GroupstageModel.find({tournament_id:req.params.id})
  res.json(group)
  }
  )
  router.delete('/deletegroupstage/:id',async (req,res)=>{

    let addgroup = await GroupstageModel.findByIdAndDelete(req.params.id)
    res.json("Team has beeen deleted")
}
  )
  router.put('/updategroupstage/:id', async (req, res) => {
    const { title, total_matches } = req.body;
    try {
        const updatedGroupStage = await GroupstageModel.findByIdAndUpdate(
            req.params.id,
            { title, total_matches },
            { new: true } // To return the updated document
        );
        if (!updatedGroupStage) {
            return res.status(404).json({ error: 'Group stage not found' });
        }
        res.json(updatedGroupStage); // 200 OK with updated group stage
    } catch (error) {
        console.error('Error updating group stage:', error);
        res.status(500).json({ error: 'Failed to update group stage' });
    }
});
module.exports =router