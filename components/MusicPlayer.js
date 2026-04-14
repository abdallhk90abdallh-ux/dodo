"use client";
import React, { useState } from "react";
import { Music, Play, Pause, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useMusic } from "@/context/MusicContext";

export default function MusicPlayer() {
  const {
    songs,
    currentSong,
    currentIndex,
    isPlaying,
    toggle,
    playNext,
    playPrevious,
  } = useMusic();

  const [isOpen, setIsOpen] = useState(false);

  if (songs.length === 0) return null;

  return (
    <>
      {/* Music Icon Button in Navbar */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300"
        title="Music Player"
      >
        <Music size={18} />
        {isPlaying && <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
      </button>

      {/* Music Player Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-t-2xl md:rounded-2xl w-full md:w-96 shadow-2xl text-white p-6 border border-slate-700">
            {/* Close Button */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Music size={20} /> Now Playing
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-700 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Current Song Info */}
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6 border border-slate-600">
              <p className="text-xs text-slate-400 mb-1">
                Song {currentIndex + 1} of {songs.length}
              </p>
              <p className="font-semibold truncate">{currentSong?.title || "Untitled"}</p>
              <p className="text-xs text-slate-400 mt-2 truncate">{currentSong?.url}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={playPrevious}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
                title="Previous song"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={toggle}
                className={`p-4 rounded-full transition transform hover:scale-110 ${
                  isPlaying
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>

              <button
                onClick={playNext}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
                title="Next song"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Playlist */}
            <div className="bg-slate-700/30 rounded-lg p-3 max-h-48 overflow-y-auto border border-slate-600">
              <p className="text-xs font-semibold text-slate-400 mb-2">PLAYLIST ({songs.length})</p>
              <div className="space-y-2">
                {songs.map((song, idx) => (
                  <button
                    key={song._id}
                    onClick={() => {
                      // Skip to this song (handled in context)
                      const diff = idx - currentIndex;
                      if (diff > 0) {
                        for (let i = 0; i < diff; i++) playNext();
                      } else if (diff < 0) {
                        for (let i = 0; i < Math.abs(diff); i++) playPrevious();
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      idx === currentIndex
                        ? "bg-green-600 text-white"
                        : "text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    <span className="font-semibold">{idx + 1}.</span> {song.title || "Untitled"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
