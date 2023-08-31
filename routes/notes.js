const express = require('express');
const router = express.Router();
const Notes = require('../models/Note');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require("express-validator");


// ROUTER 1: GET all the notes using: GET "/api/notes/fetchallnotes" Auth required
router.get('/fetchallnotes', fetchuser, async(req, res) => {
    
    try{
        // Fetch all the notes of a particular user
        const notes = await Notes.find({user: req.user.id});
        res.json(notes);
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).send("Internal Server Error");
      }
})

// ROUTER 2: Add a enw note using: POST "/api/notes/addnote" Auth required
router.post('/addnote', fetchuser, [
    body("title").isLength({min: 5}).withMessage("Enter a valid title"),
    body("description").isLength({min: 10}).withMessage("Enter a valid description")],
    async(req, res) => {
        try {
            const errors = validationResult(req);

            // If there are bad requests, return the bad request and the error in json.
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            //Destructuring Title, Description and Tag from the req.body
            const  {title, description, tag} = req.body;
            // console.log(title, "\t", description);
            //Create a new Note and add the entry in it.
            const note = new Notes({
                user: req.user.id, title, description, tag
            });

            //Save the new node 
            const savedNote = await note.save();

            res.json(savedNote);
        } 
        catch (error) {
            console.error(error.message);
            return res.status(500).send("Internal Server Error");
          }
         
})
module.exports = router;