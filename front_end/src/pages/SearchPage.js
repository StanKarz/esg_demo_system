import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Accordion, Form } from 'react-bootstrap';
import { FaTimesCircle } from "react-icons/fa";
import { GiCancel } from "react-icons/gi";
import '../styles/search.css';

function SearchPage() {
  const [companies, setCompanies] = useState([]);
  const [query, setQuery] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [selectedExchanges, setSelectedExchanges] = useState([]);


  useEffect(() => {
    search();
    }, [selectedSectors, selectedExchanges]);

    function search() {
      const sectors = selectedSectors.join(",");
      const exchanges = selectedExchanges.join(",");
      // Don't make a request if no sectors and no exchanges are selected
      if (!sectors && !exchanges && !query) {
          return;
      }
      return fetch(`http://localhost:3000/search?query=${query}&sectors=${sectors}&exchanges=${exchanges}`)
          .then(response => response.json())
          .then(companies => {
              if (companies.length === 0) {
                  setNoResults(true);
              } else {
                  setNoResults(false);
              }
              setCompanies(companies);
          });
  }
  
  // Handle the form submission
function handleFormSubmit(e) {
  e.preventDefault();
  search();
}

  function handleSectorChange(e) {
    const value = e.target.value;
    setSelectedSectors(prevState => {
        if (prevState.includes(value)) {
            return prevState.filter(sector => sector !== value);
        } else {
            return [...prevState, value];
        }
    });
}

function handleExchangeChange(e) {
        const value = e.target.value;
        setSelectedExchanges(prevState => {
            if (prevState.includes(value)) {
                return prevState.filter(exchange => exchange !== value);
            } else {
                return [...prevState, value];
            }
        });
    }

  function handleClear() {
    setQuery('');
    setCompanies([]);
    setNoResults(false);
  }

  return (
    <div className='m-4'>
      <form onSubmit={handleFormSubmit}>
        <div className="filter-section" style={{ display: 'flex', flexDirection: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', marginRight: '10px', flex: 1 }}>
              <input 
                name="search" 
                type="text" 
                placeholder="Search for companies..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: '100%', paddingRight: '30px', borderRadius: '4px' }}
              />
              <FaTimesCircle 
                style={{ cursor: 'pointer', position: 'absolute', top: '50%', right: '5px', transform: 'translateY(-50%)', color: isHovering ? 'black' : 'grey' }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={handleClear}
              />
            </div>
            <button 
              type="submit" 
              style={{ backgroundColor: '#4C8BF5', color: 'white', border: 'none', padding: '5px 20px', borderRadius: '4px', cursor: 'pointer' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#3C7CE5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4C8BF5'}
            >Search
            </button>
          </div>
        </div>
      </form>
      {/* Filters Section */}
      <Accordion defaultActiveKey="" className="mt-3">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Filters</Accordion.Header>
                    <Accordion.Body>
                        <Form.Group controlId="sectors">
                          <span className='filter-label'>Sectors</span>
                          <div className="filter-options">
                            {["Technology", "Healthcare", "Services", "Financial", "Utilities", "Consumer Goods", "Real Estate", "Energy"].map(sector => (
                            <div className='filter-option' key={sector}>
                               <Form.Check
                                    type="checkbox"
                                    label={sector}
                                    value={sector}
                                    onChange={handleSectorChange}
                                />
                              </div>
                            ))}
                          </div>
                        </Form.Group>
                        <Form.Group controlId="exchanges">
                          <span className='filter-label'>Exchanges</span>
                          <div className="filter-options">
                            {/* <Form.Label>Exchanges</Form.Label> */}
                            {["NYSE", "NASDAQ", "OTC", "TSX-V", "ASX", "LSE", "AMEX", "TSX"].map(exchange => (
                              <div className='filter-option' key={exchange}>
                                <Form.Check
                                    type="checkbox"
                                    label={exchange}
                                    value={exchange}
                                    onChange={handleExchangeChange}
                                />
                                </div>
                            ))}
                            </div>
                        </Form.Group>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

      {noResults && 
        <Alert variant="danger" className="margin-top">
          <GiCancel /> No companies found related to "{query}". Please try again with a different query.
        </Alert>}

      {/* Render the company data. */}
      {companies.map(company => (
        <Card key={company.id} className='mt-4'>
          <Card.Body>
            <Card.Title>{company.company_name} ({company.ticker})</Card.Title>
            <Card.Text>{company.company_introduction}</Card.Text>
            <p><strong>Sector:</strong> {company.sector}</p>
            <p><strong>Industry:</strong> {company.industry}</p>
            <p><strong>Exchange:</strong> {company.exchange}</p>
            <p><strong>Location:</strong> {company.company_location}</p>

            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"></link>
            <p><strong>All ESG reports:</strong>
              <a href={company.source_url} target="_blank" rel="noopener noreferrer" class="esg-link" title="Click to view all ESG reports">
                  <i class="fas fa-external-link-alt"></i> View Reports
              </a>
          </p>
          <p><strong>Most recent ESG report:</strong>
              <a href={company.url} target="_blank" rel="noopener noreferrer" class="esg-link" title="Click to view the most recent ESG report">
                  <i class="fas fa-file-alt"></i> View Recent Report
              </a>
          </p>
            {company.company_website && (
              <Button variant="primary" href={company.company_website} target="_blank">Visit company website</Button>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default SearchPage;