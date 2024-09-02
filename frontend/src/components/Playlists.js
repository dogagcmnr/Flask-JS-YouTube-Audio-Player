import React from 'react';

function Playlists({ playlists, currentPlaylist, setCurrentPlaylist, playTrack }) {
  return (
    <div>
      <h2>Playlists</h2>
      <select onChange={(e) => setCurrentPlaylist(e.target.value)}>
        <option value="">Select a playlist</option>
        {Object.keys(playlists).map((playlist) => (
          <option key={playlist} value={playlist}>{playlist}</option>
        ))}
      </select>
      {currentPlaylist && (
        <ul>
          {playlists[currentPlaylist].map((videoId) => (
            <li key={videoId}>
              {videoId}
              <button onClick={() => playTrack(videoId)}>Play</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Playlists;