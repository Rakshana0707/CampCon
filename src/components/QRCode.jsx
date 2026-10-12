import React from "react";

function QRCode({ value = "CC-1-1", size = 120 }) {
    // A simple hash function to generate deterministic pseudo-random blocks
    const getHash = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
    };

    const hashValue = getHash(value);

    // Generate a 15x15 QR grid pattern deterministically
    const gridSize = 15;
    const grid = [];

    // Helper to check if a cell is in the 3 large corner locator blocks
    // Top-left: (0,0) to (4,4)
    // Top-right: (10,0) to (14,4)
    // Bottom-left: (0,10) to (4,14)
    const isLocatorBlock = (r, c) => {
        if (r < 5 && c < 5) return true; // Top-Left
        if (r < 5 && c >= gridSize - 5) return true; // Top-Right
        if (r >= gridSize - 5 && c < 5) return true; // Bottom-Left
        return false;
    };

    for (let r = 0; r < gridSize; r++) {
        const row = [];
        for (let c = 0; c < gridSize; c++) {
            if (isLocatorBlock(r, c)) {
                // Renders outer border, middle gap, inner dot for locator blocks
                const getLocatorValue = () => {
                    const relativeR = r >= gridSize - 5 ? r - (gridSize - 5) : r;
                    const relativeC = c >= gridSize - 5 ? c - (gridSize - 5) : c;
                    // Outer square (width 5, border thickness 1)
                    if (relativeR === 0 || relativeR === 4 || relativeC === 0 || relativeC === 4) return 1;
                    // Inner dot (width 1, at center 2,2)
                    if (relativeR === 2 && relativeC === 2) return 1;
                    return 0;
                };
                row.push(getLocatorValue());
            } else {
                // Pseudo-random data blocks based on hash
                const cellSeed = hashValue + (r * 13) + (c * 37);
                // 45% fill density
                row.push((cellSeed % 100) < 45 ? 1 : 0);
            }
        }
        grid.push(row);
    }

    const cellSize = size / gridSize;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="qrcode-svg" style={{ display: "block", borderRadius: "8px" }}>
            <rect width={size} height={size} fill="white" />
            {grid.map((row, r) =>
                row.map((cell, c) => {
                    if (cell === 1) {
                        return (
                            <rect
                                key={`${r}-${c}`}
                                x={c * cellSize}
                                y={r * cellSize}
                                width={cellSize}
                                height={cellSize}
                                fill="#0b1120" // slate-900 color for high contrast
                            />
                        );
                    }
                    return null;
                })
            )}
        </svg>
    );
}

export default QRCode;
