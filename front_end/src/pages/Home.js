import React from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "calc(100vh - 60px)", // Assuming navbar height is 60px.
    textAlign: "center",
    backgroundColor: "#F7F7F7",
    color: "#333",
    padding: "20px",
  },
  heading: {
    fontSize: "3em",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  paragraph: {
    fontSize: "1.5em",
    marginBottom: "40px",
  },
  button: {
    border: "none",
    borderRadius: "5px",
    padding: "15px 30px",
    fontSize: "1.5em",
    color: "#FFF",
    cursor: "pointer",
    marginBottom: "20px",
    backgroundColor: "#333",
    boxShadow: "0 4px 6px rgba(0, 0, 0, .1)",
    transition: "background-color 0.3s",
  },
  buttonHover: {
    backgroundColor: "#444",
  },
};

const Home = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleHover = (event) => {
    event.target.style.backgroundColor = styles.buttonHover.backgroundColor;
  };

  const handleMouseOut = (event) => {
    event.target.style.backgroundColor = styles.button.backgroundColor;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome!</h1>
      <p style={styles.paragraph}>
        Choose the type of visualisation you would like to generate
      </p>
      <button
        style={styles.button}
        onMouseOver={handleHover}
        onMouseOut={handleMouseOut}
        onClick={() => handleNavigation("/single")}
      >
        Single Report Visualisation
      </button>
      <button
        style={styles.button}
        onMouseOver={handleHover}
        onMouseOut={handleMouseOut}
        onClick={() => handleNavigation("/multi")}
      >
        Multi-report Comparison
      </button>
    </div>
  );
};

export default Home;
