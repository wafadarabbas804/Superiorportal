'use client';

import { useEffect } from 'react';

export default function SecurityShield() {
  useEffect(() => {
    // 1. Disable Right Click (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Block Inspect Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + I (Inspect)
      // Ctrl + Shift + J (Console)
      // Ctrl + Shift + C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + U (View Source)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + S (Save Page)
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 3. DevTools Open Detection via Dimension Threshold
    const detectDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;

      if (widthDiff || heightDiff) {
        // If devtools is opened in a docked mode, clear body and close/redirect
        try {
          document.body.innerHTML = `
            <div style="display:flex;height:100vh;align-items:center;justify-content:center;background:#0C7E81;color:white;font-family:sans-serif;text-align:center;padding:20px;">
              <div>
                <h1 style="font-size:24px;font-weight:bold;margin-bottom:8px;">Access Denied</h1>
                <p style="font-size:14px;opacity:0.9;">Developer tools are restricted on Superior College Convocation Portal.</p>
                <p style="font-size:12px;margin-top:16px;opacity:0.75;">Please close developer tools and refresh the page.</p>
              </div>
            </div>
          `;
        } catch {}
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    const interval = setInterval(detectDevTools, 1000);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  return null;
}
