const express = require("express");
const app = express();

// Import your controller
const textExtractionRoutes = require("./controller/summaryController");

// Use the routes
app.use("/api/v1/summary/", textExtractionRoutes);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
