import React from 'react';

function SearchResults({ results, addToPlaylist, playTrack }) {
  return (
    <div>
      <h2>Search Results</h2>
      <ul>
        {results.map((result) => (
          <li key={result.id}>
            {result.title}
            <button onClick={() => addToPlaylist(result.id)}>Add to Playlist</button>
            <button onClick={() => playTrack(result.id)}>Play</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchResults;