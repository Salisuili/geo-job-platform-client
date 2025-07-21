import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap'; 

function InstallPWAButton() {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsAppInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      console.log("BeforeInstallPrompt event captured.");
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setInstallPromptEvent(null); 
      console.log("App was successfully installed!");
    };

    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []); 

  const handleInstallClick = async () => {
    if (!installPromptEvent) {
      console.log("Install prompt not available or app already installed.");
      return;
    }

    installPromptEvent.prompt();

    const { outcome } = await installPromptEvent.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the PWA installation');
    } else {
      console.log('User dismissed the PWA installation');
    }

    setInstallPromptEvent(null);
  };

  if (installPromptEvent && !isAppInstalled) {
    return (
      <Button
        variant="outline-primary" 
        className="me-2 px-4 py-2"
        onClick={handleInstallClick}
      >
        Install App
      </Button>
    );
  }

  
  return null;
}

export default InstallPWAButton;