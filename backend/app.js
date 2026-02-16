console.log("Backend server is running...");

const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use("/",(req, res, next) => {
  res.send("Middleware executed!");

});

// Connect to MongoDB
mongoose.connect("mongodb+srv://Adminchathura:ChathuraSampath518@liver.hnxmg.mongodb.net/")
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    app.listen(3000, () => console.log("Server is running on port 3000"));
})
.catch((err) => console.error("Could not connect to MongoDB:", err));

