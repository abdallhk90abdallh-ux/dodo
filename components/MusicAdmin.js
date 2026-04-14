"use client";
import React, { useState, useEffect } from "react";
import { Music, Trash2, Plus } from "lucide-react";

export default function MusicAdmin() {
  const [songs, setSongs] = useState([]);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch songs on mount
  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const res = await fetch("/api/music");
      const data = await res.json();
      setSongs(data);
    } catch (error) {
      console.error("Error fetching songs:", error);
      setMessage("Failed to load songs");
    }
  };

  const handleAddSong = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setMessage("Please enter a song URL");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), title: title.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to add song");
      } else {
        setSongs([...songs, data]);
        setUrl("");
        setTitle("");
        setMessage("✓ Song added successfully!");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      setMessage("Error adding song");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSong = async (id) => {
    if (!confirm("Delete this song?")) return;

    try {
      const res = await fetch("/api/music", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setSongs(songs.filter((song) => song._id !== id));
        setMessage("✓ Song deleted successfully!");
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage("Failed to delete song");
      }
    } catch (error) {
      setMessage("Error deleting song");
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Music className="text-blue-600" /> Music Manager
      </h2>

      {/* Add Song Form */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus size={20} /> Add Song
        </h3>
        <form onSubmit={handleAddSong} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Song URL (MP3)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/song.mp3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Song Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song title or name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Adding..." : "➕ Add Song"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm font-medium ${
              message.includes("✓")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {/* Songs List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Music size={20} /> Playlist ({songs.length})
        </h3>

        {songs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No songs added yet. Add your first song above!
          </p>
        ) : (
          <div className="space-y-3">
            {songs.map((song, idx) => (
              <div
                key={song._id}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {idx + 1}. {song.title || "Untitled"}
                  </p>
                  <p className="text-sm text-gray-600 break-all">{song.url}</p>
                </div>
                <button
                  onClick={() => handleDeleteSong(song._id)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete song"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
