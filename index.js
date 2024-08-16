const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const flatsRoutes = require("./routes/flatsRoutes");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use('/api/flats', flatsRoutes); // Use the flats routes


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
