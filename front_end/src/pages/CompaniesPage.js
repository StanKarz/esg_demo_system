import React, { useState } from 'react';

function CompaniesPage() {
  const [companies, setCompanies] = useState([]);

  function search(query) {
    return fetch(`http://localhost:3000/search?query=${query}`)
      .then(response => response.json());
  }

  function handleSearch(e) {
    e.preventDefault();

    search(e.target.elements.search.value)
      .then(setCompanies);
  }

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input name="search" type="text" placeholder="Search for companies..." />
        <button type="submit">Search</button>
      </form>

      {companies.map(company => (
        <div key={company.id}>
          <p>Results for... user's query</p>
          <h1>{company.company_name} ({company.ticker})</h1> 
          <p>Sector: {company.sector}</p>
          <p>Industry: {company.industry}</p>
          <p>Exchange: {company.exchange}</p>
          <p>Company location: {company.company_location}</p>
          <p>Company website: {company.company_website}</p>
          <p>Company introduction: {company.company_introduction}</p>
        </div>
      ))}
    </div>
  );
}

export default CompaniesPage;
