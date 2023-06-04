import React, { useState } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { FaTimesCircle } from "react-icons/fa";

function SearchPage() {
  const [companies, setCompanies] = useState([]);
  const [query, setQuery] = useState('');

  function search(query) {
    return fetch(`http://localhost:3000/search?query=${query}`)
      .then(response => response.json());
  }

  function handleSearch(e) {
    e.preventDefault();
    search(query)
      .then(setCompanies);  // Update the `companies` state.
  }

  function handleClear() {
    setQuery('');
    setCompanies([]);
  }

  return (
    <div className='m-4'>
      <form onSubmit={handleSearch} className="position-relative">
        <input 
          name="search" 
          type="text" 
          placeholder="Search for companies..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-5"
        />

        {query && (
          <FaTimesCircle 
            style={{cursor: 'pointer', position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)'}}
            onClick={handleClear}
          />
        )}

        <button type="submit">Search</button>
      </form>

      {/* Render the company data. */}
      {companies.map(company => (
        <Card key={company.id} className='mt-4'>
        <Card.Body>
          <Card.Title>{company.company_name}</Card.Title>
          <Card.Text>{company.company_introduction}</Card.Text>
          <p><strong>Sector:</strong> {company.sector}</p>
          <p><strong>Industry:</strong> {company.industry}</p>
          <p><strong>Exchange:</strong> {company.exchange}</p>
          <p><strong>Location:</strong> {company.company_location}</p>
          {company.company_website && (
            <Button variant="primary" href={company.company_website} target="_blank">Visit Website</Button>
          )}
        </Card.Body>
      </Card>
    ))}
  </div>
);
}

export default SearchPage;
