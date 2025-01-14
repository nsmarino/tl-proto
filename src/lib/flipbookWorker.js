// flipbookWorker.js
let canvasStates = {};  // Store state for each canvas (e.g., current index)

// Listen for messages from the main thread
self.onmessage = (e) => {
  const { action, canvasId, flipbook, flipbookLength, productImageEnterSpeed } = e.data;

  switch (action) {
    case 'start':
      // Initialize the canvas state if it doesn't exist
      if (!canvasStates[canvasId]) {
        canvasStates[canvasId] = { i: 0, flipbook, flipbookLength };
      }

      // Start the interval for the specified canvas
      startFlipbookInterval(canvasId, productImageEnterSpeed);
      break;

    case 'stop':
      // Stop the interval for this canvas (if needed)
      clearInterval(canvasStates[canvasId]?.intervalId);
      delete canvasStates[canvasId]; // Optionally clear the state for this canvas
      break;
  }
};

// Function to start the flipbook animation for a specific canvas
function startFlipbookInterval(canvasId, productImageEnterSpeed) {
  const state = canvasStates[canvasId];
  if (!state) return; // Make sure state exists

  const { flipbook, flipbookLength, i } = state;

  const flipbookInterval = setInterval(() => {
    if (state.i < flipbookLength) {
      // Send the current image index back to the main thread
      self.postMessage({ type: 'update-image', canvasId, image: flipbook[state.i] });
      state.i++;
    } else {
      // Animation finished for this canvas
      clearInterval(flipbookInterval);
      self.postMessage({ type: 'end', canvasId });
    }
  }, productImageEnterSpeed);

  // Store the interval ID in the state so it can be cleared later
  state.intervalId = flipbookInterval;
}
