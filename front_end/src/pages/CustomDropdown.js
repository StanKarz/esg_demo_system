import React, { useState } from 'react';

const CustomDropdown = ({ options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    const newSelectedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((opt) => opt !== option)
      : [...selectedOptions, option];

    setSelectedOptions(newSelectedOptions);
    onChange(newSelectedOptions);
  };

  return (
    <div>
      <button onClick={toggleDropdown} style={{ width: '150px' }}>
        Industries
      </button>
      {isOpen && (
        <div
          style={{
            border: '1px solid #ccc',
            width: '150px',
            position: 'absolute',
          }}
        >
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleOptionClick(option)}
              style={{
                padding: '10px',
                backgroundColor: selectedOptions.includes(option)
                  ? 'lightblue'
                  : 'white',
                cursor: 'pointer',
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
