require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const multer = require('multer');

const fs = require('fs');
const dir = './uploads';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

app.use(cors());
app.use(express.json());

// Multer setup
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/')  // Adjust this path to where you want to store your uploaded files
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
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
  res.status(200).send('File uploaded successfully');
});

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.get('/test', (req, res) => {
  res.send('Test route');
});


app.listen(3000, () => console.log('Listening on port 3000'));
