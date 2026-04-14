"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";

const MusicContext = createContext();

export function MusicProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

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
    }
  };

  // Handle audio end - play next song
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      playNext();
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [songs, currentIndex]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || songs.length === 0) return;

    if (isPlaying) {
      // If audio source changed, update it
      const currentSong = songs[currentIndex];
      if (audio.src !== currentSong.url) {
        audio.src = currentSong.url;
      }
      audio.play().catch((e) => {
        console.error("Playback error:", e);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentIndex, songs]);

  const play = () => {
    if (songs.length > 0) {
      setIsPlaying(true);
    }
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const toggle = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const playNext = () => {
    if (songs.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % songs.length);
  };

  const playPrevious = () => {
    if (songs.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);
  };

  const skipToSong = (index) => {
    if (index >= 0 && index < songs.length) {
      setCurrentIndex(index);
      setIsPlaying(true);
    }
  };

  const currentSong = songs[currentIndex] || null;

  return (
    <MusicContext.Provider
      value={{
        songs,
        currentSong,
        currentIndex,
        isPlaying,
        play,
        pause,
        toggle,
        playNext,
        playPrevious,
        skipToSong,
        audioRef,
        fetchSongs,
      }}
    >
      <audio ref={audioRef} crossOrigin="anonymous" />
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within MusicProvider");
  }
  return context;
}
