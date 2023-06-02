require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const readline = require('readline');

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

async function importData() {
    const fileStream = fs.createReadStream('data.jsonl');
  
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
  
    for await (const line of rl) {
      const company = JSON.parse(line);
      await Company.create(company);
    }
  
    console.log('Data import complete');
    mongoose.connection.close();
  }
  
  importData().catch(console.error);
  

//   company_name, industry, company_introduction, sector, ticker, exchange, company_location, company_website, 