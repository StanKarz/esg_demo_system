require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const multer = require('multer');
const childProcess = require('child_process');
const path = require('path');
const fs = require('fs');
const dir = './uploads';

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

// Multer setup
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/')  // Adjust this path to where you want to store your uploaded files
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage })

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
  const { query } = req.query;
  const companies = await Company.find({
    company_name: new RegExp(query, 'i'),
  });

  res.json(companies);
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
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

app.listen(3000, () => console.log('Listening on port 3000'));
