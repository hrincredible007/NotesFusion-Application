const express = require('express');
const router = express.Router();
const Notes = require('../models/Note');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require("express-validator");


// ROUTER 1: GET all the notes using: GET "/api/notes/fetchallnotes" Auth required
router.get('/fetchallnotes', fetchuser, async (req, res) => {

    try {
        // Fetch all the notes of a particular user
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).send("Internal Server Error");
    }
})

// ROUTER 2: Add a enw note using: POST "/api/notes/addnote" Auth required
router.post('/addnote', fetchuser, [
    body("title").isLength({ min: 5 }).withMessage("Enter a valid title"),
    body("description").isLength({ min: 10 }).withMessage("Enter a valid description")],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            // If there are bad requests, return the bad request and the error in json.
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            //Destructuring Title, Description and Tag from the req.body
            const { title, description, tag } = req.body;
            // console.log(title, "\t", description);
            //Create a new Note and add the entry in it.
            const note = new Notes({
                user: req.user.id, title, description, tag
            });
            console.log('note added')
            //Save the new node 
            const savedNote = await note.save();

            res.json(savedNote);
        }
        catch (error) {
            console.error(error.message);
            return res.status(500).send("Internal Server Error");
        }

    });


// ROUTER 3: Update the existing note using: PUT "/api/notes/updatenote:id"  Auth required
router.put('/updatenote/:id',
    [body("title").isLength({ min: 5 }).withMessage("Enter a valid title"),
    body("description").isLength({ min: 10 }).withMessage("Enter a valid description")], fetchuser, async (req, res) => {
        try {

            const { title, description, tag } = req.body;

            // Create a new note and add it..
            const newNote = {};
            if (title) { newNote.title = title; }
            if (description) { newNote.description = description; }
            if (tag) { newNote.tag = tag; }

            // Find the note to be updated 
            let note = await Notes.findById(req.params.id);

            //If the note to be updated does not exists then return Note NOT FOUND
            if (!note) {
                res.status(401).send('Not Found');
            }

            //Checking If the user is updating his note only or not
            if (note.user.toString() !== req.user.id) {
                return res.status(401).send('Not Allowed');
            }

            // Update the existing note with the new note
            note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
            res.json({ note });
        }
        catch (error) {
            console.error(error.message);
            return res.status(500).send("Internal Server Error");
        }
    });

// ROUTER 4: Delete the existing note using: DELETE "/api/notes/deletenote:id"  Auth required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {
        // Find the note to be deleted.
        let note = await Notes.findById(req.params.id);

        // Check whether that particular note exists or not..
        if (!note) {
            return res.status(401).json({ error: "Note does not exists" });
        }

        //Checking If the user is deleting his note only..
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send('Not Allowed');
        }
        console.log('Done till here');
        // Delete the existing note 
        note = await Notes.findByIdAndDelete(req.params.id);

        res.json({success: "The Note has been deleted", Deleted_Note: note});

    } 
    catch (error) {
        console.error(error.message);
        return res.status(500).send("Internal Server Error");
    }
});

module.exports = router;