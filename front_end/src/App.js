import SearchPage from './pages/SearchPage';  
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar></Navbar>


        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search" element={<SearchPage />} /> 
        </Routes>
      </div>
    </Router>
  );
}


export default App;



