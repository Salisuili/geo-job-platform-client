// src/components/InstallPWAButton.jsx
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap'; // Assuming you use react-bootstrap for buttons

function InstallPWAButton() {
  // State to hold the 'beforeinstallprompt' event
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  // State to track if the app is already installed
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is already running as a standalone PWA
    // This heuristic is fairly reliable for detecting PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsAppInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the default browser UI for installation
      e.preventDefault();
      // Store the event for later use
      setInstallPromptEvent(e);
      console.log("BeforeInstallPrompt event captured.");
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setInstallPromptEvent(null); // Clear the event once installed
      console.log("App was successfully installed!");
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []); // Empty dependency array means this runs once on mount

  const handleInstallClick = async () => {
    if (!installPromptEvent) {
      // If the event is null, it means the prompt was already shown/dismissed
      // or the app is already installed.
      console.log("Install prompt not available or app already installed.");
      return;
    }

    // Show the installation prompt to the user
    installPromptEvent.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPromptEvent.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the PWA installation');
      // No need to set isAppInstalled here, the 'appinstalled' event will handle it
    } else {
      console.log('User dismissed the PWA installation');
    }

    // Clear the prompt event so the button disappears after interaction
    setInstallPromptEvent(null);
  };

  // Render the button only if the prompt is available and the app isn't already installed
  if (installPromptEvent && !isAppInstalled) {
    return (
      <Button
        variant="outline-primary" // Or 'primary', choose what fits your design
        className="me-2 px-4 py-2"
        onClick={handleInstallClick}
      >
        Install App
      </Button>
    );
  }

  // Otherwise, render nothing
  return null;
}

export default InstallPWAButton;