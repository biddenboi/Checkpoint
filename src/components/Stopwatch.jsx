// ============================================================================
// NEW FILE - Stopwatch.jsx - ADDED IN VERSION 0.88
// ============================================================================
// This component displays a running timer during task sessions
// Updates every 100ms to show elapsed time in HH:MM:SS format
// ============================================================================

import { useState, useEffect } from 'react';
import './Stopwatch.css';

/**
 * Stopwatch Component - NEW IN v0.88
 * Displays elapsed time since startTime
 * @param {number} startTime - Timestamp (from Date.now()) when task started
 */
function Stopwatch({ startTime }) {
  // Track elapsed time in milliseconds
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time every 100ms
  useEffect(() => {
    // If no task in progress, reset to 0
    if (!startTime) {
      setElapsedTime(0);
      return;
    }

    // Update every 100ms for smooth display
    const interval = setInterval(() => {
      // Calculate: current time - start time
      setElapsedTime(Date.now() - startTime);
    }, 100);

    // Cleanup: clear interval when component unmounts or startTime changes
    return () => clearInterval(interval);
  }, [startTime]);

  /**
   * Convert milliseconds to HH:MM:SS format
   * @param {number} ms - Time in milliseconds
   * @returns {string} Formatted time (e.g., "01:23:45")
   */
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Pad with zeros: 5 becomes "05"
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="stopwatch">
      <span className="stopwatch-time">{formatTime(elapsedTime)}</span>
    </div>
  );
}

export default Stopwatch;
// ============================================================================
// END OF NEW FILE
// ============================================================================