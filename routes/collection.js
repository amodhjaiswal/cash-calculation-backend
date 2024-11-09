const express = require("express");
const router = express.Router();
const Collection = require("../models/Collection");

// Add new collection entry
router.post("/", async (req, res) => {
  const { name, amount } = req.body;
  try {
    const newEntry = new Collection({ name, amount });
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all collection entries
router.get("/", async (req, res) => {
  try {
    const entries = await Collection.find();
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
