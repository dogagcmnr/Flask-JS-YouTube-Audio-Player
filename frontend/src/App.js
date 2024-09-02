import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, PlusCircle, Play, Pause, SkipForward, SkipBack, Repeat, Volume2 } from 'lucide-react';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [playlists, setPlaylists] = useState({});
  const [currentPlaylist, setCurrentPlaylist] = useState('');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loop, setLoop] = useState('none');
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/get_playlists`);
    setPlaylists(response.data);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/search?q=${searchQuery}`);
    setSearchResults(response.data);
  };

  const createPlaylist = async () => {
    if (newPlaylistName.trim() === '') return;
    await axios.post(`${process.env.REACT_APP_API_URL}/create_playlist`, { playlist_name: newPlaylistName });
    setNewPlaylistName('');
    fetchPlaylists();
  };

  const addToPlaylist = async (videoId, videoTitle) => {
    if (!currentPlaylist) return;
    await axios.post(`${process.env.REACT_APP_API_URL}/add_to_playlist`, {
      video_id: videoId,
      video_title: videoTitle,
      playlist_name: currentPlaylist
    });
    fetchPlaylists();
  };

  const playTrack = async (videoId, videoTitle) => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/get_audio_url?video_id=${videoId}`);
    setCurrentTrack({ id: videoId, title: videoTitle, url: response.data.audio_url });
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
    audioRef.current.src = response.data.audio_url;
    audioRef.current.play();
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleLoop = () => {
    if (loop === 'none') setLoop('one');
    else if (loop === 'one') setLoop('all');
    else setLoop('none');
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    audioRef.current.currentTime = time;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-4">YouTube Audio Player</h1>
          <form onSubmit={handleSearch} className="flex items-center bg-white rounded-full p-1">
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search for music"
              className="flex-grow px-4 py-2 bg-transparent text-gray-900 focus:outline-none"
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded-full">
              <Search size={20} />
            </button>
          </form>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 flex gap-4">
        <div className="w-2/3">
          <h2 className="text-xl font-semibold mb-2">Search Results</h2>
          <ul className="space-y-2">
            {searchResults.map((result) => (
              <li key={result.id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                <span>{result.title}</span>
                <div>
                  <button onClick={() => addToPlaylist(result.id, result.title)} className="mr-2 text-blue-400 hover:text-blue-300">
                    <PlusCircle size={20} />
                  </button>
                  <button onClick={() => playTrack(result.id, result.title)} className="text-green-400 hover:text-green-300">
                    <Play size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-1/3">
          <h2 className="text-xl font-semibold mb-2">Playlists</h2>
          <div className="mb-4">
            <input 
              type="text" 
              value={newPlaylistName} 
              onChange={(e) => setNewPlaylistName(e.target.value)} 
              placeholder="New playlist name"
              className="w-full p-2 bg-gray-800 rounded mb-2"
            />
            <button onClick={createPlaylist} className="bg-green-500 text-white p-2 rounded w-full flex items-center justify-center">
              <PlusCircle size={18} className="mr-2" /> Create Playlist
            </button>
          </div>
          <select 
            onChange={(e) => setCurrentPlaylist(e.target.value)} 
            className="w-full p-2 bg-gray-800 rounded mb-4"
          >
            <option value="">Select a playlist</option>
            {Object.keys(playlists).map((playlist) => (
              <option key={playlist} value={playlist}>{playlist}</option>
            ))}
          </select>
          {currentPlaylist && (
            <ul className="space-y-2">
              {playlists[currentPlaylist].tracks.map((track) => (
                <li key={track.id} className="bg-gray-800 p-2 rounded-lg flex justify-between items-center">
                  <span>{track.title}</span>
                  <button onClick={() => playTrack(track.id, track.title)} className="text-green-400 hover:text-green-300">
                    <Play size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <footer className="bg-gray-800 p-4 sticky bottom-0">
        <div className="container mx-auto flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-700 rounded mr-4"></div>
              <div>
                <div className="font-semibold">
                  {currentTrack ? currentTrack.title : 'No track playing'}
                </div>
                <div className="text-sm text-gray-400">
                  {currentPlaylist || 'Not in a playlist'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => {}} className="text-gray-400 hover:text-white">
                <SkipBack size={24} />
              </button>
              <button onClick={togglePlayPause} className="bg-white text-gray-900 rounded-full p-2 hover:bg-gray-200">
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button onClick={() => {}} className="text-gray-400 hover:text-white">
                <SkipForward size={24} />
              </button>
              <button onClick={handleLoop} className="text-gray-400 hover:text-white">
                <Repeat size={24} color={loop !== 'none' ? '#4CAF50' : 'currentColor'} />
              </button>
              <div className="flex items-center">
                <Volume2 size={24} className="text-gray-400 mr-2" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="flex-grow"
            />
            <span className="text-sm">{formatTime(duration)}</span>
          </div>
        </div>
      </footer>
      <audio 
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        loop={loop === 'one'}
      />
    </div>
  );
}