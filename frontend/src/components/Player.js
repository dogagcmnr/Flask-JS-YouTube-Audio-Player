import React from 'react';

function Player({ currentTrack, isPlaying, togglePlayPause, loop, handleLoop }) {
  return (
    <div>
      <h2>Now Playing</h2>
      {currentTrack && (
        <div>
          <p>Current Track: {currentTrack.id}</p>
          <button onClick={togglePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
          <button onClick={handleLoop}>
            Loop: {loop === 'none' ? 'Off' : loop === 'one' ? 'One' : 'All'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Player;