const express = require("express");
const {
  signup,
  login,
  getMe,
  checkAvailability,
} = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/check-availability", checkAvailability);
router.get("/me", verifyToken, getMe);

module.exports = router;
