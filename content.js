let audioContext = null;
let videoElements = new Map();

// Initialize audio context and gain node for a video element
function initializeAudioContext(video) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (!videoElements.has(video)) {
    const source = audioContext.createMediaElementSource(video);
    const gain = audioContext.createGain();
    source.connect(gain);
    gain.connect(audioContext.destination);
    videoElements.set(video, gain);

    // Load and apply saved volume
    browser.storage.local
      .get("volumeBoost")
      .then((result) => {
        if (result.volumeBoost) {
          gain.gain.value = result.volumeBoost / 100;
        }
      })
      .catch((error) => console.log("Error loading volume:", error));
  }

  return videoElements.get(video);
}

// Listen for messages from popup
browser.runtime.onMessage.addListener((message) => {
  if (message.action === "setVolume") {
    const videos = document.getElementsByTagName("video");

    for (const video of videos) {
      try {
        const gain = initializeAudioContext(video);
        gain.gain.setValueAtTime(message.value, audioContext.currentTime);
      } catch (error) {
        console.log("Error setting volume:", error);
      }
    }
  }
  return true; // Important: indicates async response
});

// Handle dynamically added videos
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeName === "VIDEO") {
        initializeAudioContext(node);
      }
    });
  });
});

// Start observing the document
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Initialize existing videos when the script loads
document.querySelectorAll("video").forEach((video) => {
  initializeAudioContext(video);
});
