const express = require("express");
const {
  signup,
  login,
  getMe,
  checkAvailability,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/check-availability", checkAvailability);
router.get("/me", verifyToken, getMe);

// Password reset with otp

router.post("/forgot-password", requestPasswordReset); // Request OTP
router.post("/reset-password", resetPassword); // Reset password using OTP

module.exports = router;
