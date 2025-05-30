const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

// const dashboardRoute = require("./routes/dashboardRoute");
const authRoute = require("./routes/authRoute");

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("dev")); // HTTP request logger

// Static files
app.use(express.static(path.join(__dirname, "public")));

// app.use("/api/dashboard", dashboardRoute);
app.use("/api/auth", authRoute);

module.exports = app;
