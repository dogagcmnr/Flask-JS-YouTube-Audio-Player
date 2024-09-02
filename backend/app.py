from flask import Flask, request, jsonify
from flask_cors import CORS
from pytube import Search
import yt_dlp
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

app = Flask(__name__)
CORS(app)

playlists = {}

@app.route('/search', methods=['GET'])
def search_youtube():
    query = request.args.get('q')
    try:
        results = Search(query).results
        return jsonify([{'id': video.video_id, 'title': video.title} for video in results[:10]])
    except Exception as e:
        print(f"Error during YouTube search: {str(e)}")
        return jsonify([]), 200

@app.route('/create_playlist', methods=['POST'])
def create_playlist():
    data = request.json
    playlist_name = data['playlist_name']
    if playlist_name not in playlists:
        playlists[playlist_name] = {'id': str(uuid.uuid4()), 'tracks': []}
        return jsonify({'success': True, 'playlist_id': playlists[playlist_name]['id']})
    return jsonify({'success': False, 'message': 'Playlist already exists'}), 400

@app.route('/add_to_playlist', methods=['POST'])
def add_to_playlist():
    data = request.json
    video_id = data['video_id']
    video_title = data['video_title']
    playlist_name = data['playlist_name']
    if playlist_name not in playlists:
        return jsonify({'success': False, 'message': 'Playlist does not exist'}), 404
    if video_id not in [track['id'] for track in playlists[playlist_name]['tracks']]:
        playlists[playlist_name]['tracks'].append({'id': video_id, 'title': video_title})
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Track already in playlist'}), 400

@app.route('/get_playlists', methods=['GET'])
def get_playlists():
    return jsonify(playlists)

@app.route('/get_audio_url', methods=['GET'])
def get_audio_url():
    video_id = request.args.get('video_id')
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'quiet': True,
        'no_warnings': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(f'https://www.youtube.com/watch?v={video_id}', download=False)
            audio_url = info['url']
            return jsonify({'audio_url': audio_url})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)