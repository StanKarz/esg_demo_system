require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const multer = require('multer');
const childProcess = require('child_process');
const path = require('path');
const fs = require('fs');
const dir = './uploads';
const { spawn } = require('child_process');
const PythonShell = require('python-shell').PythonShell;

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

app.use(cors());
app.use(express.json());
// Serve tree.html
app.use('/tree', express.static(path.join(__dirname, 'tree_vis')));
// Serve processed data
app.use('/processed_data', express.static(path.join(__dirname, 'processed_data')));
app.use('/uploads', express.static('uploads'));
// app.use('/topics-data', express.static('topics_data'));
app.use('/topics-data', express.static(path.join(__dirname, 'topics_data')));

// Multer setup
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/')  // Adjust this path to where you want to store your uploaded files
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const companySchema = new mongoose.Schema({
  id: String,
  company_name: String,
  industry: String,
  company_introduction: String,
  sector: String,
  ticker: String,
  // ... add other fields as necessary
});

const Company = mongoose.model('Company', companySchema);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB successfully!');
});

app.get('/search', async (req, res) => {
  const { query, industry, sector, location } = req.query;
  const searchParams = {
    ...(query && { company_name: new RegExp(query, 'i') }),
    ...(industry && { industry: new RegExp(industry, 'i') }),
    ...(sector && { sector: new RegExp(sector, 'i') }),
    ...(location && { company_location: new RegExp(location, 'i') }),
  };

  const companies = await Company.find(searchParams)

  res.json(companies);
});

// File upload endpoint
app.post('/upload-tree', upload.single('file'), (req, res) => {
  console.log(req.file);  // Log uploaded file metadata to console
  const originalFileName = path.parse(req.file.originalname).name;
  const outputFile = `${originalFileName}_output.json`;
  // Now spawn the Python child process to process the uploaded file
  let pyProcess = childProcess.spawn('python', ['tree_vis/data_processing.py', req.file.path, outputFile]);

  let pythonOutput = '';

  pyProcess.stdout.on('data', (data) => {
    console.log(`Python script output: ${data}`);
    pythonOutput += data.toString();
  });

  pyProcess.stderr.on('data', (data) => {
    console.error(`Python script error: ${data}`);
  });

  pyProcess.on('exit', (code) => {
    if (code !== 0) {
      console.log(`Python script exited with code ${code}`);
      res.status(500).send('There was an error processing your file');
    } else {
      res.status(200).send({message: 'File uploaded and processed successfully', filename: outputFile});
    }
  });
});

// Serve processed data
app.get('/get-data/:filename', (req, res) => {
  const filename = req.params.filename;
  console.log(filename);
    res.sendFile(path.resolve(__dirname, `processed_data/${filename}`));
});

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Word cloud
app.post('/upload-wordcloud', upload.single('pdf'), (req, res) => {
  res.json({ path: req.file.path });
});

app.get('/word-cloud/:filepath/:category', (req, res) => {
  let filepath;
  try {
    filepath = Buffer.from(req.params.filepath, 'base64').toString('utf8');
  } catch (e) {
    filepath = req.params.filepath;
  }
  const { category } = req.params;
  const fullpath = path.join(__dirname, 'uploads', filepath);
  const python = spawn('python', ['word_freq/word_cloud.py', fullpath, category], {
    stdio: ['pipe', 'pipe', 'pipe']
});
  let result = '';

  python.stdout.setEncoding('utf8');
  python.stdout.on('data', (data) => {
      result += data.toString();
  });

  python.stderr.setEncoding('utf8');
  python.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
  });

  python.on('close', (code) => {
      if (code !== 0) {
          console.log(`python script exited with code ${code}`);
      }
      try {
          res.json(JSON.parse(result));
      } catch (e) {
          res.json({ error: 'Failed to parse response' });
      }
  });
});

// Sentiment Analysis
app.post('/upload-sentiment', upload.single('pdf'), (req, res) => {
  const python = spawn('python', ['sentiment_analysis/sentiment.py', req.file.path], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let result = '';
  python.stdout.setEncoding('utf8');
  python.stdout.on('data', (data) => {
      result += data.toString();
  });

  python.stderr.setEncoding('utf8');
  python.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
  });

  python.on('close', (code) => {
      if (code !== 0) {
          console.log(`python script exited with code ${code}`);
          res.json({error: 'Failed to process file'});
      } else {
        console.log(result);  // Add this line 
      try {
          const sentimentData = JSON.parse(result);
          // Include the file path in the response
          sentimentData.path = req.file.filename; // assuming `filename` property exists on `file`
          // Save sentiment data to a JSON file
          fs.writeFileSync(`./sentiment_data/${req.file.filename}.json`, JSON.stringify(sentimentData));
          res.json(sentimentData);
      } catch (e) {
        console.error(e);
          res.json({ error: 'Failed to parse response' });
      }
    }
  });
});

app.get('/sentiment-data/:filename', (req, res) => {
  try {
    const data = fs.readFileSync(`./sentiment_data/${req.params.filename}.json`, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error(`Failed to read file: ${error}`);
    res.json({ error: 'Failed to get sentiment data' });
  }
});

// Topic modelling
app.post('/upload-lda', upload.single('file'), (req, res) => {
  const pyProcess = spawn('python', ['topics/topic_modelling.py', req.file.path]);

  pyProcess.stdout.on('data', (data) => {
    console.log(`Python script output: ${data}`);
  });

  pyProcess.stderr.on('data', (data) => {
    console.error(`Python script error: ${data}`);
  });

  pyProcess.on('exit', (code) => {
    if (code !== 0) {
      console.log(`Python script exited with code ${code}`);
      res.status(500).send('There was an error processing your file');
    } else {
      let fileName = req.file.originalname.replace('.pdf', '');
      res.status(200).send({message: 'File uploaded and processed successfully', filename: fileName});
    }
  });
});

app.use('/visualisations', express.static('visualisations'));

app.listen(3000, () => console.log('Listening on port 3000'));
