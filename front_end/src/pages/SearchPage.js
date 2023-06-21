import React, { useState} from 'react';
import { Container, Card, Button, Alert, Form } from 'react-bootstrap';
import { FaTimesCircle } from "react-icons/fa";
import Select from "react-select";
import { components } from "react-select";
import { GiCancel } from "react-icons/gi";
import '../styles/search.css';


function SearchPage() {
  const [companies, setCompanies] = useState([]);
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState(''); // New state
  const [sector, setSector] = useState(''); // New state
  const [location, setLocation] = useState(''); // New state
  const [isHovering, setIsHovering] = useState(false);
  const [noResults, setNoResults] = useState(false);

  function search(query) {
    return fetch(`http://localhost:3000/search?query=${query}&industry=${industry}&sector=${sector}&location=${location}`)
      .then(response => response.json());
  }

  function handleSearch(e) {
    e.preventDefault();
    search(query)
      .then(companies => {
        if (companies.length === 0) {
          setNoResults(true);
        } else {
          setNoResults(false);
        }
        setCompanies(companies);
      });
  }

  function handleClear() {
    setQuery('');
    setCompanies([]);
    setNoResults(false);
  }

const industryOptions = [
    { value: 'Industrial Goods', label: 'Industrial Goods' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    // Add all your options here
  ];

const CustomValueContainer = ({ children, ...props }) => (
  <components.ValueContainer {...props}>
    {props.hasValue ? `Selected: ${props.getValue().map(option => option.label).join(", ")}` : null}
  </components.ValueContainer>
);

return (
  <div className='m-4'>
    <form onSubmit={handleSearch}>
      <div style={{ display: 'flex', flexDirection: 'center', gap: '10px' }}>
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

        <div style={{ display: 'flex', gap: '10px' }}>
          
        <Select 
              isMulti 
              name="industries"
              options={industryOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={setIndustry} // This function will need to be modified to handle an array of objects
              components={{ ValueContainer: CustomValueContainer }}
            />
       
         
        </div>
      </div>
    </form>

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
