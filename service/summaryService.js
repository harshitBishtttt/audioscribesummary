const Tesseract = require("tesseract.js");
const pdf = require("pdf-poppler");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");

async function convertPdfToImages(pdfPath, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  await pdf.convert(pdfPath, {
    format: "png",
    out_dir: outputDir,
    out_prefix: "page",
    page: null,
  });

  return fs
    .readdirSync(outputDir)
    .filter((f) => f.endsWith(".png"))
    .sort((a, b) => parseInt(a.split("-")[1]) - parseInt(b.split("-")[1]));
}

async function extractTextFromImages(imageFiles, outputDir) {
  const result = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const imgPath = path.join(outputDir, imageFiles[i]);
    const { data } = await Tesseract.recognize(imgPath, "eng");
    result.push({ pgNo: i + 1, text: data.text.trim() });
  }

  return result;
}

function cleanup(pdfPath, outputDir) {
  if (pdfPath && fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
  if (fs.existsSync(outputDir)) rimraf.sync(outputDir);
}

const axios = require("axios");
require("dotenv").config();

async function getStructuredSummary(jsonData) {

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  const messages = [
    {
      role: "system",
      content: "You are a medical document summarizer. Always return a valid JSON object with headings as keys and bullet points as arrays of strings. Do not include any extra text outside the JSON."
    },
    {
      role: "user",
      content: `Here is the OCR JSON:\n${JSON.stringify(jsonData)}`
    }
  ];

  try {
    const response = await axios.post(
      endpoint,
      {
        messages,
        temperature: 0.2,
        max_tokens: 2000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );

    const content = response.data.choices[0].message.content;

    // Try to parse JSON safely
    try {
      return JSON.parse(content);
    } catch (parseErr) {
      console.error("Failed to parse AI response as JSON:", parseErr);
      return { error: "Invalid JSON returned from AI", raw: content };
    }
  } catch (error) {
    console.error("Azure OpenAI error:", error.response?.data || error.message);
    throw new Error("Failed to get summary from Azure OpenAI");
  }
}

module.exports = {
  getStructuredSummary,
  convertPdfToImages,
  extractTextFromImages,
  cleanup,
};



module.exports = {
  getStructuredSummary,
  convertPdfToImages,
  extractTextFromImages,
  cleanup,
};
