require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const multer = require("multer");
const childProcess = require("child_process");
const path = require("path");
const fs = require("fs");
const dir = "./uploads";
const { spawn } = require("child_process");
const PythonShell = require("python-shell").PythonShell;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// Serve tree.html
app.use("/tree", express.static(path.join(__dirname, "tree_vis")));
// Serve processed data
app.use(
  "/processed_data",
  express.static(path.join(__dirname, "processed_data"))
);
app.use("/uploads", express.static("uploads"));
app.use("/topics-data", express.static(path.join(__dirname, "topics_data")));

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const companySchema = new mongoose.Schema({
  company_name: String,
  industry: String,
  company_introduction: String,
  sector: String,
  ticker: String,
  source_url: String,
  url: String,
  exchange: String,
  company_location: String,
  company_website: String,
});

const Company = mongoose.model("Company", companySchema);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB successfully!");
});

app.get("/search", async (req, res) => {
  const { query, sectors, exchanges } = req.query;

  console.log(
    `Query parameters received: sectors=${sectors}, exchanges=${exchanges}`
  );

  let searchParams = {
    ...(query && { company_name: new RegExp(query, "i") }),
  };

  if (sectors) {
    const sectorsRegex = sectors
      .split(",")
      .map((sector) => new RegExp(`^${sector}$`, "i")); // Case insensitive match
    searchParams.sector = { $in: sectorsRegex };
  }

  if (exchanges) {
    const exchangesRegex = exchanges
      .split(",")
      .map((exchange) => new RegExp(`^${exchange}$`, "i")); // Case insensitive match
    searchParams.exchange = { $in: exchangesRegex };
  }

  console.log(searchParams);

  const companies = await Company.find(searchParams);

  res.json(companies);
});

// Report structure visualisation
app.post("/upload-tree", upload.single("file"), (req, res) => {
  console.log("IN THE ENDPOINT: ", req.file); // Log uploaded file metadata to console
  const originalFileName = path.parse(req.file.originalname).name;
  const outputFile = `${originalFileName}_output.json`;

  // Log the paths
  console.log("Input file path:", req.file.path);
  console.log("Output file path:", outputFile);
  // Spawn the Python child process to process the uploaded file
  let pyProcess = childProcess.spawn("python", [
    "tree_vis/pdf_to_tree.py",
    req.file.path,
    outputFile,
  ]);

  console.log("Python process spawned"); // Debugging line

  let pythonOutput = "";

  pyProcess.stdout.on("data", (data) => {
    pythonOutput += data.toString();
  });

  pyProcess.stderr.on("data", (data) => {
    console.error(`Python script error: ${data}`);
  });

  pyProcess.on("exit", (code) => {
    if (code !== 0) {
      console.log(`Python script exited with code ${code}`);
      res.status(500).send("There was an error processing your file");
    } else {
      res.status(200).send({
        message: "File uploaded and processed successfully",
        filename: outputFile,
      });
    }
    fs.unlinkSync(req.file.path);
  });
});

// Serve processed data
app.get("/get-data/:filename", (req, res) => {
  const filename = req.params.filename;
  console.log(filename);
  res.sendFile(path.resolve(__dirname, `../processed_data/${filename}`));
});

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Word cloud
app.post("/upload-wordcloud", upload.single("pdf"), (req, res) => {
  res.json({ path: req.file.path });
});

app.get("/word-cloud/:filepath/:category", (req, res) => {
  let filepath;
  try {
    filepath = Buffer.from(req.params.filepath, "base64").toString("utf8");
  } catch (e) {
    filepath = req.params.filepath;
  }
  const { category } = req.params;
  const allowedCategories = ["environmental", "social", "governance", "all"];
  if (!allowedCategories.includes(category)) {
    return res.status(400).json({ error: "Invalid category." });
  }
  const fullpath = path.join(__dirname, "uploads", filepath);
  const python = spawn(
    "python",
    ["word_freq/word_cloud.py", fullpath, category],
    {
      stdio: ["pipe", "pipe", "pipe"],
    }
  );
  let result = "";

  python.stdout.setEncoding("utf8");
  python.stdout.on("data", (data) => {
    result += data.toString();
  });

  python.stderr.setEncoding("utf8");
  python.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  python.on("close", (code) => {
    if (code !== 0) {
      console.log(`python script exited with code ${code}`);
    }
    try {
      res.json(JSON.parse(result));
    } catch (e) {
      res.json({ error: "Failed to parse response" });
    }
  });
});

// Sentiment Analysis
app.post("/upload-sentiment", upload.single("pdf"), (req, res) => {
  const python = spawn(
    "python",
    ["sentiment_analysis/sentiment.py", req.file.path],
    {
      stdio: ["pipe", "pipe", "pipe"],
    }
  );

  let result = "";
  python.stdout.setEncoding("utf8");
  python.stdout.on("data", (data) => {
    result += data.toString();
  });

  python.stderr.setEncoding("utf8");
  python.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  python.on("close", (code) => {
    if (code !== 0) {
      console.log(`python script exited with code ${code}`);
      res.json({ error: "Failed to process file" });
    } else {
      // console.log(result); // Add this line
      try {
        const sentimentData = JSON.parse(result);
        // Include the file path in the response
        sentimentData.path = req.file.filename; // assuming `filename` property exists on `file`
        // Save sentiment data to a JSON file
        fs.writeFileSync(
          `./sentiment_data/${req.file.filename}.json`,
          JSON.stringify(sentimentData)
        );
        res.json(sentimentData);
      } catch (e) {
        console.error(e);
        res.json({ error: "Failed to parse response" });
      }
    }
    fs.unlinkSync(req.file.path);
  });
});

app.get("/sentiment-data/:filename", (req, res) => {
  try {
    const data = fs.readFileSync(
      `./sentiment_data/${req.params.filename}.json`,
      "utf-8"
    );
    res.json(JSON.parse(data));
  } catch (error) {
    console.error(`Failed to read file: ${error}`);
    res.json({ error: "Failed to get sentiment data" });
  }
});

// Topic modelling
app.post("/upload-lda", upload.single("file"), (req, res) => {
  const pyProcess = spawn("python", [
    "topics/topic_modelling.py",
    req.file.path,
  ]);

  pyProcess.stdout.on("data", (data) => {});

  pyProcess.stderr.on("data", (data) => {
    console.error(`Python script error: ${data}`);
  });

  pyProcess.on("exit", (code) => {
    if (code !== 0) {
      console.log(`Python script exited with code ${code}`);
      res.status(500).send("There was an error processing your file");
    } else {
      let fileName = req.file.originalname.replace(".pdf", "");
      res.status(200).send({
        message: "File uploaded and processed successfully",
        filename: fileName,
      });
    }
    fs.unlinkSync(req.file.path);
  });
});

app.use("/visualisations", express.static("visualisations"));

const server = app.listen(3000, () => console.log("Listening on port 3000"));
server.timeout = 500000; // This is the timeout in milliseconds
