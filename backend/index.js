const express = require("express");
const { translate } = require("@vitalets/google-translate-api");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const winston = require("winston");

const app = express();
app.use(cors());
app.use(express.json());

const PERSPECTIVE_API_KEY = "AIzaSyBuBfKnfIhr9kD1lE1h2YbtvoEYy3ihwfk";

// Configure winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "server.log" }),
  ],
});

const MAX_FILES = 10;
const OBJECTS_DIR = path.join(__dirname, "objects"); // Change to backend storage
const RECORDS_FILE = path.join(__dirname, "file_records.json");

// Ensure the objects directory exists
if (!fs.existsSync(OBJECTS_DIR)) {
  fs.mkdirSync(OBJECTS_DIR);
}

// Ensure the records file exists and contains valid JSON
if (
  !fs.existsSync(RECORDS_FILE) ||
  fs.readFileSync(RECORDS_FILE, "utf8").trim() === ""
) {
  fs.writeFileSync(RECORDS_FILE, JSON.stringify([]));
}

// Serve static files from the objects directory
app.use(
  "/objects",
  (req, res, next) => {
    console.log(`Serving file: ${req.url}`);
    next();
  },
  express.static(OBJECTS_DIR)
);

// Function to get next available file name
function getNextFileName() {
  let fileNames = fs.readdirSync(OBJECTS_DIR);
  let nextNumber = 1;

  while (fileNames.includes(`sample2-${nextNumber}.obj`)) {
    nextNumber++;
  }

  return `sample2-${nextNumber}`;
}

// Asynchronous retry function for deleting files
async function retryUnlink(filePath, retries = 5, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      fs.unlinkSync(filePath);
      return;
    } catch (err) {
      if (err.code === "EBUSY" && attempt < retries) {
        console.log(`Resource busy, retrying unlink in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
}

// Function to clean up old files and reset records if necessary
async function cleanUpOldFiles() {
  let fileNames = fs
    .readdirSync(OBJECTS_DIR)
    .filter((file) => file.endsWith(".obj"));

  if (fileNames.length >= MAX_FILES) {
    // Remove all files in the objects directory
    for (const file of fileNames) {
      let baseName = file.split(".")[0];
      await retryUnlink(path.join(OBJECTS_DIR, `${baseName}.obj`));
      await retryUnlink(path.join(OBJECTS_DIR, `${baseName}.mtl`));
    }

    // Reset the records file
    fs.writeFileSync(RECORDS_FILE, JSON.stringify([], null, 2));
  }
}

// Function to save records
function saveRecords(record) {
  let records = [];

  try {
    records = JSON.parse(fs.readFileSync(RECORDS_FILE, "utf8"));
  } catch (err) {
    console.error(
      "Error parsing records file, initializing new records array."
    );
    records = [];
  }

  records.push(record);

  fs.writeFileSync(RECORDS_FILE, JSON.stringify(records, null, 2));
}

// Asynchronous retry function for renaming files
async function retryRename(oldPath, newPath, retries = 5, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      fs.renameSync(oldPath, newPath);
      return;
    } catch (err) {
      if (err.code === "EBUSY" && attempt < retries) {
        console.log(`Resource busy, retrying rename in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
}

// Middleware function for translation and toxicity check
const checkToxicity = async (req, res, next) => {
  const { text } = req.body;
  logger.info("Received request", { text });

  let translatedText = text;

  // Check if the text is in Hebrew and translate to English if needed
  try {
    const translation = await translate(text, { to: "en" });
    const detectedLanguage = translation.raw.src;
    logger.info("Language detected", { language: detectedLanguage });

    if (detectedLanguage === "iw" || detectedLanguage === "he") {
      translatedText = translation.text;
      logger.info("Text translated", { translatedText });
    }
  } catch (error) {
    logger.error("Error translating text", { error: error.message });
    return res
      .status(500)
      .json({ error: "Error translating text", details: error.message });
  }

  // Send the (possibly translated) text to Perspective API
  try {
    const response = await axios.post(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`,
      {
        comment: { text: translatedText },
        languages: ["en"],
        requestedAttributes: { TOXICITY: {} },
      }
    );

    const toxicity = response.data.attributeScores.TOXICITY.summaryScore.value;
    logger.info("Toxicity score received", { toxicity });

    if (toxicity > 0.7) {
      return res.status(400).json({ error: "Text is too toxic", toxicity });
    }

    next();
  } catch (error) {
    logger.error("Error analyzing text", { error: error.message });
    res
      .status(500)
      .json({ error: "Error analyzing text", details: error.message });
  }
};

// Route to process text
app.post("/process-text", checkToxicity, async (req, res) => {
  try {
    const inputText = req.body.text;
    console.log("Received text:", inputText);

    const response = await axios.post("http://127.0.0.1:5000/process-text", {
      text: inputText,
    });

    if (response.status === 200) {
      const parameters = response.data.parameters;

      const grasshopperResponse = await axios.post(
        "http://localhost:1917/grasshopper",
        parameters
      );

      console.log("Sent parameters to Grasshopper API");

      await cleanUpOldFiles();

      // Wait until the files are created
      const interval = setInterval(async () => {
        console.log(
          "Checking for existence of sample2.obj and sample2.mtl in:",
          OBJECTS_DIR
        );

        if (
          fs.existsSync(path.join(OBJECTS_DIR, "sample2.obj")) &&
          fs.existsSync(path.join(OBJECTS_DIR, "sample2.mtl"))
        ) {
          console.log("Files found, proceeding with renaming");

          clearInterval(interval);

          const newBaseName = getNextFileName();
          const newObjPath = path.join(OBJECTS_DIR, `${newBaseName}.obj`);
          const newMtlPath = path.join(OBJECTS_DIR, `${newBaseName}.mtl`);

          try {
            await retryRename(
              path.join(OBJECTS_DIR, "sample2.obj"),
              newObjPath
            );
            await retryRename(
              path.join(OBJECTS_DIR, "sample2.mtl"),
              newMtlPath
            );
          } catch (err) {
            console.error("Failed to rename files:", err);
            return res.status(500).json({ error: "Failed to rename files" });
          }

          // Extract object number to generate username
          const objectNumber = parseInt(newBaseName.split("-")[1]);
          const username = `אנונימי #${objectNumber}`;

          // Add created at timestamp
          const createdAt = new Date().toISOString();

          const record = {
            fileName: newBaseName,
            feelings: response.data.feelings,
            objPath: `/objects/${newBaseName}.obj`,
            mtlPath: `/objects/${newBaseName}.mtl`,
            text: inputText,
            username,
            coords: response.data.coordinates,
            createdAt,
          };

          saveRecords(record);

          console.log("Files renamed and records saved");

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(record));
            }
          });

          return res.json({
            fileName: newBaseName,
            objPath: record.objPath,
            mtlPath: record.mtlPath,
            feelings: response.data.feelings,
          });
        }
      }, 1000);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to get record by file name
app.get("/record/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  if (fs.existsSync(RECORDS_FILE)) {
    const records = JSON.parse(fs.readFileSync(RECORDS_FILE, "utf8"));
    const record = records.find((rec) => rec.fileName === fileName);
    if (record) {
      return res.json(record);
    }
  }
  res.status(404).json({ error: "Record not found" });
});

app.get("/records", (req, res) => {
  if (fs.existsSync(RECORDS_FILE)) {
    const records = JSON.parse(fs.readFileSync(RECORDS_FILE, "utf8"));
    if (records) {
      return res.json(records);
    }
  }
  res.status(404).json({ error: "Records not found" });
});

// Create WebSocket server
const server = app.listen(3001, () => {
  console.log(`Node.js server is running on http://localhost:3001`);
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  // Send all existing records to the newly connected client
  if (fs.existsSync(RECORDS_FILE)) {
    const records = JSON.parse(fs.readFileSync(RECORDS_FILE, "utf8"));
    ws.send(JSON.stringify(records));
  }
});
