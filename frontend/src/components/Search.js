import React from 'react';

function Search({ searchQuery, setSearchQuery, handleSearch }) {
  return (
    <div>
      <input 
        type="text" 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)} 
        placeholder="Search for a song"
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}

export default Search;