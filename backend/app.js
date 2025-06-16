require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("./config/passport");

const dashboardRoute = require("./routes/dashboardRoute");
const authRoute = require("./routes/authRoute");
const roleRoute = require("./routes/roleRoute");
const uploadRoute = require("./routes/uploadRoute"); 

const stadiumRoute = require("./routes/stadiumRoute");
const academyRoute = require("./routes/academyRoute");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "public")));

// Mount all routes
app.use("/api/dashboard", dashboardRoute);
app.use("/api/auth", authRoute);
app.use("/api/roles", roleRoute);
app.use("/api/upload", uploadRoute);

app.use("/api/stadiums", stadiumRoute);
app.use("/api/academies", academyRoute);

module.exports = app;
