import React, { useState } from 'react';

function SearchPage() {
  const [companies, setCompanies] = useState([]);

  function search(query) {
    return fetch(`http://localhost:3000/search?query=${query}`)
      .then(response => response.json());
  }

  function handleSearch(e) {
    e.preventDefault();

    search(e.target.elements.search.value)
      .then(setCompanies);  // Update the `companies` state.
  }

  return (
    <div>
      {/* Render a search form. */}
      <form onSubmit={handleSearch}>
        <input name="search" type="text" placeholder="Search for companies..." />
        <button type="submit">Search</button>
      </form>

      {/* Render the company data. */}
      {companies.map(company => (
        <div key={company.id}>
          <h2>{company.company_name}</h2>
          <p>{company.company_introduction}</p>
          {/* Render other company details as needed. */}
        </div>
      ))}
    </div>
  );
}

export default SearchPage;
