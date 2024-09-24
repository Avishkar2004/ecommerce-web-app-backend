const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const sendEmail = require("../utils/mailer");

exports.signup = (req, res) => {
  const { username, email, password } = req.body;
  // console.log("User data :", req.body.length , req.body);

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }

    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.query(query, [username, email, hashedPassword], async (err, result) => {
      if (err) {
        return res.status(400).json({ message: "Error during signup" });
      }

      try {
        await sendEmail(
          email,
          "Signup Successful",
          "Welcome! You have successfully signed up."
        );
        res.status(201).json({ message: "User registered successfully" });
      } catch (emailError) {
        res
          .status(500)
          .json({ message: "Signup successful, but failed to send email." });
      }
    });
  });
};
exports.login = (req, res) => {
  const { identifier, password } = req.body;
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
          user.email,
          user.username,
          "You have successfully logged in."
        );
        res.status(200).json({
          message: "Login successful",
          token,
          username: user.username,
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
  const userId = req.user.id;

  const query = `SELECT id , username, email FROM users WHERE id = ?
  `;

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
