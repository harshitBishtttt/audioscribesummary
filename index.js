const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

const textExtractionRoutes = require("./controller/summaryController");
app.use("/api/v1/summary/", textExtractionRoutes);

// Use Azure's assigned port or fallback to 5000 locally
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
