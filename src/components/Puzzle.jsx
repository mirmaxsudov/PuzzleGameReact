import React, { useState, useEffect, useCallback } from "react";
import { Shuffle } from 'react-feather';
import "./Puzzle.css";

const SlidingPuzzle = () => {
    const [size, setSize] = useState(3);
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

    const getTileAtIndex = (index) => tiles.find(tile => tile.currentIndex === index);

    const handleTileClick = (index) => {
        if (isWon) return;

        const canMove =
            (Math.abs(index - emptyIndex) === 1 &&
                Math.floor(index / size) === Math.floor(emptyIndex / size)) ||
            Math.abs(index - emptyIndex) === size;

        if (canMove) {
            if (!isPlaying) {
                setIsPlaying(true);
            }

            const clickedTile = getTileAtIndex(index);
            if (!clickedTile) return;

            setTiles(prevTiles =>
                prevTiles.map(tile =>
                    tile.value === clickedTile.value
                        ? { ...tile, currentIndex: emptyIndex }
                        : tile
                )
            );
            setEmptyIndex(index);

            setTimeout(() => {
                if (checkWin()) {
                    setIsWon(true);
                    setIsPlaying(false);
                }
            }, 100);
        }
    };

    const shuffle = () => {
        setIsPlaying(false);
        setTime(0);
        setIsWon(false);

        const positions = Array.from({ length: size * size }, (_, i) => i);
        const values = Array.from({ length: size * size - 1 }, (_, i) => i + 1);

        for (let i = values.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [values[i], values[j]] = [values[j], values[i]];
        }

        const newEmptyIndex = Math.floor(Math.random() * positions.length);
        positions.splice(newEmptyIndex, 1);

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
        <>
            <div className="sliding-puzzle">
                <div className="controls">
                    <select
                        id="size-select"
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
                        <Shuffle id="shuffle" size={24} stroke="#152942" style={{ margin: "10px", transform: "rotate(45deg)" }} />
                    </button>
                </div>
                <div className="timer-wrapper">
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
                            return <div key={`empty-${index}`} className="empty-tile" />;
                        }
                        return (
                            <button
                                id={size < 6 ? "tile" : "tile-small"}
                                key={tile.value}
                                onClick={() => handleTileClick(index)}
                                className={`tile ${isWon ? "won" : ""}`}
                            >
                                {tile.value}
                            </button>
                        );
                    })}
                </div>
            </div>
            {isWon && (
                <div className="win-message">
                    Congratulations!<br /> You solved it in {formatTime(time)}!
                </div>
            )}
        </>
    );
};

export default SlidingPuzzle;

