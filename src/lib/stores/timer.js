import { writable } from "svelte/store";

const now = new Date();

// Define the target date (January 1, 2025)
const targetDate = new Date('2025-02-03T00:00:00');

// Calculate the difference in milliseconds
const timeDifference = targetDate - now;

// Convert milliseconds to seconds
const secondsUntilTarget = timeDifference;

const COUNTDOWN_FROM = secondsUntilTarget;

const formatter = new Intl.DateTimeFormat("en", {
  hour12: false,
  minute: "2-digit",
  second: "2-digit",
  hour: "2-digit",
  day: "2-digit",
});

export const time = writable(formatter.format(COUNTDOWN_FROM));
export const isRunning = writable(false);
export const isComplete = writable(false);

const createTimer = () => {
  let animationRef;
  let latestStartTime;
  let remainingTime = COUNTDOWN_FROM;

  const animate = timestamp => {
    // is it the first iteration in this cycle?
    if (latestStartTime === undefined) {
      // make a note of the start time
      latestStartTime = timestamp + remainingTime;
    }

    // the time to display now
    const currentTime = latestStartTime - timestamp;
    if (currentTime <= 0) {
      cancelAnimationFrame(animationRef);
      time.set(formatter.format(0));
      isRunning.set(false);
      isComplete.set(true);
      return;
    }
    time.set(formatter.formatToParts(currentTime));
    // keep animating recursively
    animationRef = requestAnimationFrame(animate);
  };

  const api = {
    start: () => {
      isRunning.set(true);
      animationRef = requestAnimationFrame(animate);
    },

    pause: () => {
      cancelAnimationFrame(animationRef);
      if (latestStartTime !== undefined) {
        // prepare for the next cycle
        remainingTime = latestStartTime - performance.now();
        latestStartTime = undefined;
      }
      isRunning.set(false);
    },

    reset: Function.prototype
  };

  return api;
};

export const timer = createTimer();
