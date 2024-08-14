const express = require("express");
const { signup, login, getMe } = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", verifyToken, getMe);  // Protected route to get user details

module.exports = router;
