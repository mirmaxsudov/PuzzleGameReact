import React, { useState, useEffect, useCallback } from "react";
import { Shuffle } from 'react-feather';

const SlidingPuzzle = () => {
    const [size, setSize] = useState(2);
    const [tiles, setTiles] = useState([]);
    const [emptyIndex, setEmptyIndex] = useState(size * size - 1);
    const [isWon, setIsWon] = useState(false);
    const [time, setTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const initializePuzzle = useCallback((gridSize) => {
        const newTiles = Array.from(
            { length: gridSize * gridSize - 1 },
            (_, i) => ({
                value: i + 1,
                currentIndex: i,
            })
        );
        setTiles(newTiles);
        setEmptyIndex(gridSize * gridSize - 1);
        setIsWon(false);
        setTime(0);
        setIsPlaying(false);
    }, []);

    useEffect(() => {
        initializePuzzle(size);
    }, [size, initializePuzzle]);

    useEffect(() => {
        let interval = null;

        if (isPlaying && !isWon) {
            interval = setInterval(() => {
                setTime(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, isWon]);

    const checkWin = useCallback(() => {
        return tiles.every((tile) => tile.value === tile.currentIndex + 1);
    }, [tiles]);

    const getTileAtIndex = (index) => {
        return tiles.find(tile => tile.currentIndex === index);
    };

    const handleTileClick = (index) => {
        if (isWon) return;

        const canMove =
            // Check if the clicked position is adjacent to the empty space
            (Math.abs(index - emptyIndex) === 1 &&
                Math.floor(index / size) === Math.floor(emptyIndex / size)) || // Same row
            Math.abs(index - emptyIndex) === size; // Same column

        if (canMove) {
            if (!isPlaying) {
                setIsPlaying(true);
            }

            // Find the tile at the clicked position
            const clickedTile = getTileAtIndex(index);
            if (!clickedTile) return;

            // Move the tile to the empty space
            setTiles(prevTiles =>
                prevTiles.map(tile =>
                    tile.value === clickedTile.value
                        ? { ...tile, currentIndex: emptyIndex }
                        : tile
                )
            );
            setEmptyIndex(index);

            // Check for win after move
            setTimeout(() => {
                if (checkWin()) {
                    setIsWon(true);
                    setIsPlaying(false);
                }
            }, 100);
        }
    };

    // Shuffle the puzzle
    const shuffle = () => {
        setIsPlaying(false);
        setTime(0);
        setIsWon(false);

        // Create array of possible positions
        const positions = Array.from({ length: size * size }, (_, i) => i);
        const values = Array.from({ length: size * size - 1 }, (_, i) => i + 1);

        // Shuffle values randomly
        for (let i = values.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [values[i], values[j]] = [values[j], values[i]];
        }

        // Remove one random position for empty space
        const newEmptyIndex = Math.floor(Math.random() * positions.length);
        positions.splice(newEmptyIndex, 1);

        // Create new tiles with shuffled positions
        const newTiles = values.map((value, index) => ({
            value,
            currentIndex: positions[index],
        }));

        setTiles(newTiles);
        setEmptyIndex(newEmptyIndex);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    return (
        <div className="sliding-puzzle">
            <div className="controls">
                <select
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value))}
                    disabled={isPlaying}
                >
                    {Array.from({ length: 8 }, (_, i) => i + 3).map((n) => (
                        <option key={n} value={n}>
                            {n}x{n} Grid
                        </option>
                    ))}
                </select>
                <button onClick={shuffle} disabled={isPlaying}>
                    <Shuffle />
                </button>
                <div className="timer">{formatTime(time)}</div>
            </div>

            <div
                className="puzzle-grid"
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${size}, 1fr)`,
                    gap: "0.5rem",
                    width: `${Math.min(400, size * 80)}px`,
                    height: `${Math.min(400, size * 80)}px`,
                }}
            >
                {Array.from({ length: size * size }).map((_, index) => {
                    const tile = getTileAtIndex(index);
                    if (!tile) {
                        // This is the empty space
                        return <div key={`empty-${index}`} className="empty-tile" />;
                    }
                    return (
                        <button
                            key={tile.value}
                            onClick={() => handleTileClick(index)}
                            className={`tile ${isWon ? "won" : ""}`}
                        >
                            {tile.value}
                        </button>
                    );
                })}
            </div>
            {isWon && (
                <div className="win-message">
                    Congratulations! You solved it in {formatTime(time)}!
                </div>
            )}
        </div>
    );
};

export default SlidingPuzzle;