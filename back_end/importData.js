require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const readline = require("readline");

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

async function importData() {
  const fileStream = fs.createReadStream("data.jsonl");

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const company = JSON.parse(line);

    // Get the URL of the latest report
    if (company.reports && company.reports.length > 0) {
      company.url = company.reports[0].url;
    }

    delete company.reports;

    await Company.create(company);
  }

  console.log("Data import complete");
  mongoose.connection.close();
}

importData().catch(console.error);
