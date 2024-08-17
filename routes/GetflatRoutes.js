const express = require("express");
const router = express.Router();
const flatController = require("../controllers/flatController");

// Route to get all flats
router.get("/flats", flatController.getAllFlats);

module.exports = router;
