const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const {
  convertPdfToImages,
  extractTextFromImages,
  cleanup,
  getStructuredSummary
} = require("../service/summaryService");

const upload = multer({ dest: "uploads/" });

router.get("/health-check", (req, res) => {
  res.send("Server is running 🚀");
});

router.post("/extract", upload.single("file"), async (req, res) => {
  const pdfPath = req.file?.path;
  const outputDir = path.join(__dirname, "../converted_pages");

  try {
    if (!pdfPath) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageFiles = await convertPdfToImages(pdfPath, outputDir);
    const extractedText = await extractTextFromImages(imageFiles, outputDir);
    const result = await getStructuredSummary(extractedText);
    res.json(result);
  } catch (err) {
    console.error("OCR Error:", err);
    res.status(500).json({ error: "OCR Failed", details: err.message });
  } finally {
    cleanup(pdfPath, outputDir);
  }
});

module.exports = router;
