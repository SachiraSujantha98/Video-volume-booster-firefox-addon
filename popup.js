document.addEventListener('DOMContentLoaded', function() {
  const slider = document.getElementById('volumeSlider');
  const volumeValue = document.getElementById('volumeValue');

  // Load saved value
  browser.storage.local.get('volumeBoost').then((result) => {
    if (result.volumeBoost) {
      slider.value = result.volumeBoost;
      volumeValue.textContent = result.volumeBoost;
    }
  });

  // Update volume when slider changes
  slider.addEventListener('input', function() {
    const value = this.value;
    volumeValue.textContent = value;
    
    // Save the value
    browser.storage.local.set({ volumeBoost: value });
    
    // Send message to content script
    browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
      if (tabs[0]) {  // Check if there's an active tab
        browser.tabs.sendMessage(tabs[0].id, {
          action: 'setVolume',
          value: value / 100
        }).catch(error => console.log('Error sending message:', error));
      }
    });
  });
});