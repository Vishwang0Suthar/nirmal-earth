import React, { useState, useEffect } from "react";
import axios from "axios";

const LocationSearch = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim() === "") {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `https://apis.mappls.com/advancedmaps/v1/10a499808b4e885146ac3fe7593edd47/places/search/json`,
          {
            params: {
              query,
              location: "28.61,77.23", // Optional: Bias results around this location
              // Add other parameters as needed
            },
          }
        );

        if (response.data.suggestedLocations) {
          setSuggestions(response.data.suggestedLocations);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        setError("Failed to fetch suggestions. Please try again.");
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [query]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.placeName);
    setShowSuggestions(false);
    // Handle the selected suggestion as needed
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setSelectedSuggestionIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === "ArrowUp") {
      setSelectedSuggestionIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : 0
      );
    } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
      handleSuggestionClick(suggestions[selectedSuggestionIndex]);
    }
  };

  return (
    <div style={{ position: "relative", width: "300px" }}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search for a location"
        style={{ width: "100%", padding: "8px", fontSize: "16px" }}
      />
      {showSuggestions && query && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            zIndex: 1000,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {isLoading ? (
            <div style={{ padding: "8px" }}>Loading...</div>
          ) : error ? (
            <div style={{ padding: "8px", color: "red" }}>{error}</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <div
                key={suggestion.placeId}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  backgroundColor:
                    index === selectedSuggestionIndex ? "#f0f0f0" : "#fff",
                }}
                onMouseEnter={() => setSelectedSuggestionIndex(index)}
              >
                {suggestion.placeName}
              </div>
            ))
          ) : (
            <div style={{ padding: "8px" }}>No suggestions found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
