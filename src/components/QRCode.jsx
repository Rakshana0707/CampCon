import React from "react";

function QRCode({ value = "CC-1-1", size = 148 }) {
    // 21x21 is the standard Version 1 QR Code matrix dimension
    const gridSize = 21;

    // Multi-round FNV-1a / Murmur-style bit mixer so every character of the UUID
    // produces a completely distinct, high-entropy 2D bit pattern
    const getCellBit = (str, r, c) => {
        let h = 2166136261 >>> 0;
        const seedStr = `${str}:${r * 31 + c}:${c * 17 ^ r}`;
        for (let i = 0; i < seedStr.length; i++) {
            h ^= seedStr.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        h ^= h >>> 16;
        h = Math.imul(h, 0x85ebca6b) >>> 0;
        h ^= h >>> 13;
        h = Math.imul(h, 0xc2b2ae35) >>> 0;
        h ^= h >>> 16;
        return (h & 1) === 1 ? 1 : 0;
    };

    // Standard 7x7 Finder Pattern + 1-cell white separator
    const isFinderArea = (r, c) => {
        if (r < 8 && c < 8) return true; // Top-Left + separator
        if (r < 8 && c >= gridSize - 8) return true; // Top-Right + separator
        if (r >= gridSize - 8 && c < 8) return true; // Bottom-Left + separator
        return false;
    };

    const getFinderBit = (r, c) => {
        let lr = r;
        let lc = c;
        if (r < 8 && c >= gridSize - 8) {
            lc = c - (gridSize - 7);
        } else if (r >= gridSize - 8 && c < 8) {
            lr = r - (gridSize - 7);
        }
        // White separator ring around 7x7 finder
        if (lr < 0 || lr > 6 || lc < 0 || lc > 6) return 0;
        // Outer 7x7 black ring
        if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return 1;
        // Inner 5x5 white ring
        if (lr === 1 || lr === 5 || lc === 1 || lc === 5) return 0;
        // Center 3x3 black block
        return 1;
    };

    const grid = [];
    for (let r = 0; r < gridSize; r++) {
        const row = [];
        for (let c = 0; c < gridSize; c++) {
            if (isFinderArea(r, c)) {
                row.push(getFinderBit(r, c));
            } else if (r === 6) {
                // Horizontal timing pattern
                row.push(c % 2 === 0 ? 1 : 0);
            } else if (c === 6) {
                // Vertical timing pattern
                row.push(r % 2 === 0 ? 1 : 0);
            } else {
                row.push(getCellBit(String(value), r, c));
            }
        }
        grid.push(row);
    }

    const quietZone = 10;
    const innerSize = size - quietZone * 2;
    const cellSize = innerSize / gridSize;

    return (
        <div
            className="d-inline-flex align-items-center justify-content-center p-2 bg-white rounded-3 shadow-sm"
            style={{ border: "2px solid #e2e8f0" }}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="qrcode-svg"
                style={{ display: "block", borderRadius: "4px" }}
                aria-label={`QR Code for ${value}`}
            >
                <rect width={size} height={size} fill="#ffffff" />
                {grid.map((row, r) =>
                    row.map((cell, c) => {
                        if (cell === 1) {
                            return (
                                <rect
                                    key={`${r}-${c}`}
                                    x={quietZone + c * cellSize}
                                    y={quietZone + r * cellSize}
                                    width={cellSize + 0.35}
                                    height={cellSize + 0.35}
                                    fill="#0f172a"
                                />
                            );
                        }
                        return null;
                    })
                )}
            </svg>
        </div>
    );
}

export default QRCode;

