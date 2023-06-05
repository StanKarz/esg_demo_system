// import React, { useState } from 'react';
// import { Container, Card, Button } from 'react-bootstrap';
// import { FaTimesCircle } from "react-icons/fa";

// function SearchPage() {
//   const [companies, setCompanies] = useState([]);
//   const [query, setQuery] = useState('');
//   const [isHovering, setIsHovering] = useState(false);

//   function search(query) {
//     return fetch(`http://localhost:3000/search?query=${query}`)
//       .then(response => response.json());
//   }

//   function handleSearch(e) {
//     e.preventDefault();
//     search(query)
//       .then(setCompanies);  // Update the `companies` state.
//   }

//   function handleClear() {
//     setQuery('');
//     setCompanies([]);
//   }

//   return (
//     <div className='m-4'>
//       <form onSubmit={handleSearch}>
//         <div style={{display: 'flex', justifyContent: 'space-between', width: '20%'}}>
//           <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', position: 'relative'}}>
//             <input 
//               name="search" 
//               type="text" 
//               placeholder="Search for companies..." 
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               style={{width: '100%', paddingRight: '30px'}}
//             />
//             <FaTimesCircle 
//               style={{cursor: 'pointer', position: 'absolute', top: '50%', right: '5px', transform: 'translateY(-50%)', color: isHovering ? 'black' : 'grey'}}
//               onMouseEnter={() => setIsHovering(true)}
//               onMouseLeave={() => setIsHovering(false)}
//               onClick={handleClear}
//             />
//           </div>
//           <button 
//             type="submit" 
//             style={{backgroundColor: '#4C8BF5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer'}}
//             onMouseEnter={(e) => e.target.style.backgroundColor = '#3C7CE5'}
//             onMouseLeave={(e) => e.target.style.backgroundColor = '#4C8BF5'}
//           >
//             Search
//           </button>
//         </div>
//       </form>

//       {/* Render the company data. */}
//       {companies.map(company => (
//         <Card key={company.id} className='mt-4'>
//           <Card.Body>
//             <Card.Title>{company.company_name}</Card.Title>
//             <Card.Text>{company.company_introduction}</Card.Text>
//             <p><strong>Sector:</strong> {company.sector}</p>
//             <p><strong>Industry:</strong> {company.industry}</p>
//             <p><strong>Exchange:</strong> {company.exchange}</p>
//             <p><strong>Location:</strong> {company.company_location}</p>
//             {company.company_website && (
//               <Button variant="primary" href={company.company_website} target="_blank">Visit Website</Button>
//             )}
//           </Card.Body>
//         </Card>
//       ))}
//     </div>
//   );
// }

// export default SearchPage;

import React, { useState } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { FaTimesCircle } from "react-icons/fa";

function SearchPage() {
  const [companies, setCompanies] = useState([]);
  const [query, setQuery] = useState('');
  const [isHovering, setIsHovering] = useState(false);

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
      <form onSubmit={handleSearch}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'relative', marginRight: '10px', width: '25%' }}>
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
          <div>
            <button 
              type="submit" 
              style={{ backgroundColor: '#4C8BF5', color: 'white', border: 'none', padding: '5px 20px', borderRadius: '4px', cursor: 'pointer' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#3C7CE5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4C8BF5'}
            >
              Search
            </button>
          </div>
        </div>
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
              <Button variant="primary" href={company.company_website} target="_blank">Visit company website</Button>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default SearchPage;
