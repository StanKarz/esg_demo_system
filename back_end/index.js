require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());


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

app.listen(3000, () => console.log('Listening on port 3000'));
