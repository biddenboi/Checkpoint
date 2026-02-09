/***Pretty elegant, albeit difficult to reuse solution.
 * The way it works is that stopwatch uses a useEffect to constantly
 * update a visual display of the elapsed time since the startTime prop was set.
 * It doesn't actually really store data - really only taking care of the visual aspect.
 * The state updates every 100ms to update the number displayed. Unfortunately,
 * this means that a re-render of the component will be necessary.
 * 
 * In the dashboard, Elapsed time is formatted as hours, minutes, and seconds.
 * The actual duration in milliseconds is calculated within the dashboard upon
 * task completion by subtracting the current time from the start time.
 * 
 * When this component is finally detached, clearInterval command will run.
 * 
 * This implementation therefore doesn't cleanly encapsulate the stopwatch logic.
 * I don't think thats really possible unless I was using a javascript class though.
 * 
 * I think honestly this is kind of how react handles things. 
*/

//[CHECK] Implement again using online tutorial.

import { useState, useEffect } from 'react';
import './Stopwatch.css';

/**
 * Displays elapsed time since startTime
 * @param {number} startTime - Timestamp (from Date.now()) when task started
*/

function Stopwatch({ startTime }) {  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    //check if elapsedtime set already
    if (!startTime) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
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
    //[CHECK] how method functions
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // [Pad with zeros: 5 becomes "05"
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="stopwatch">
      <span>{formatTime(elapsedTime)}</span>
    </div>
  );
}

export default Stopwatch;