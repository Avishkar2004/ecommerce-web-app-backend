const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const sendEmail = require("../utils/mailer");

exports.signup = (req, res) => {
  const { username, email, password } = req.body;

  // Check if the username or email is already in use
  const checkQuery = `SELECT * FROM users WHERE username = ? OR email = ?`;
  db.query(checkQuery, [username, email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length > 0) {
      // Check if username or email is already taken
      const existingUser = results[0];
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email is already registered" });
      }
    }

    // Hash the password and save the new user
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }

      const insertQuery = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
      db.query(
        insertQuery,
        [username, email, hashedPassword],
        async (err, result) => {
          if (err) {
            return res.status(400).json({ message: "Error during signup" });
          }

          // Generate JWT token
          const token = jwt.sign(
            { id: result.insertId, email: email },
            process.env.JWT_SECRET,
            { expiresIn: "10h" }
          );

          try {
            await sendEmail(
              email,
              "Signup Successful",
              "Welcome! You have successfully signed up."
            );
            // Return token and user information
            res.status(201).json({
              message: "User registered successfully",
              token,
              user: { username, email },
            });
          } catch (emailError) {
            res.status(500).json({
              message: "Signup successful, but failed to send email.",
            });
          }
        }
      );
    });
  });
};

exports.login = (req, res) => {
  const { identifier, password } = req.body;
  console.log(req.body);
  const query = `SELECT * FROM users WHERE email = ? OR username = ?`;
  db.query(query, [identifier, identifier], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: "Email or username not found" });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, async (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      try {
        await sendEmail(
          "Login Successful",
          user.email,
          user.username,
          "You have successfully logged in."
        );
        res.status(200).json({
          message: "Login successful",
          token,
          user: { username: user.username, email: user.email },
        });
      } catch (emailError) {
        res
          .status(500)
          .json({ message: "Login successful, but failed to send email." });
      }
    });
  });
};

exports.getMe = (req, res) => {
  const userId = req.user.id; // Should be set by JWT middleware

  const query = `SELECT id, username, email FROM users WHERE id = ?`;
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user: results[0] });
  });
};

exports.checkAvailability = (req, res) => {
  const { username, email } = req.body;

  const query = `SELECT * FROM users WHERE username = ? OR email = ?`;
  db.query(query, [username, email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length > 0) {
      const existingUser = results[0];
      if (existingUser.username === username) {
        return res
          .status(400)
          .json({ field: "username", message: "Username is already taken" });
      } else if (existingUser.email === email) {
        return res
          .status(400)
          .json({ field: "email", message: "Email is already registered" });
      }
    }

    res.status(200).json({ message: "Available" });
  });
};

//! Generate a 6-digit OTP

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.requestPasswordReset = (req, res) => {
  const { email } = req.body;
  const query = `SELECT * FROM users WHERE email = ?`;

  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = results[0];

    //Generate OTP and expiry time
    const otp = generateOTP();
    const expiryTime = Date.now() + 15 * 60 * 1000; //OTP Valid for 15 Minute

    //Store OTP and Expiry in the database
    const updateQuery = `UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?`;
    db.query(updateQuery, [otp, expiryTime, user.id], async (err) => {
      if (err) return res.status(500).json({ message: "Server error" });

      // Send OTP Vai email

      try {
        await sendEmail(email, user.username, otp, "reset");
        res.status(200).json({ message: "OTP sent successfully" });
      } catch (emailError) {
        console.error("Failed to send OTP email:", emailError);
        res.status(500).json({ message: "Failed to send OTP email" });
      }
    });
  });
};

// Reset Password - verify OTP and Update password

exports.resetPassword = (req, res) => {
  const { email, otp, newPassword } = req.body;
  const query = `SELECT * FROM users WHERE email = ?`;

  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0)
      return res.status(404).json({ message: "user not found" });

    const user = results[0];

    // Check if OTP is valid
    if (user.reset_token !== otp || user.reset_token_expiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    //Hash the new password

    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ message: "Server error" });

      //Update the user's password and clear the reset token
      const updateQuery = `UPDATE users SET password= ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?`;
      db.query(updateQuery, [hashedPassword, user.id], (err) => {
        if (err)
          return res.status(500).json({ message: "Failed to reset password" });

        res.status(200).json({ message: "Password reset successfully" });
      });
    });
  });
};
