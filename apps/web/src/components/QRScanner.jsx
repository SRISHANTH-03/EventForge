import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button, Input } from './UI';
import { Camera, CameraOff, Keyboard, QrCode } from 'lucide-react';

export const QRScanner = ({ onScanSuccess, isScanning = true }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [inputMode, setInputMode] = useState('camera'); // 'camera' | 'manual'
  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'qr-reader-container';

  useEffect(() => {
    let qrInstance = null;

    if (inputMode === 'camera' && isScanning) {
      qrInstance = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = qrInstance;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      qrInstance
        .start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            // Success scan
            onScanSuccess(decodedText, 'qr');
          },
          (errorMessage) => {
            // Ignore scan noise
          }
        )
        .then(() => {
          setCameraActive(true);
          setCameraError(null);
        })
        .catch((err) => {
          console.warn('[QRScanner] Camera start failed:', err);
          setCameraError('Camera unavailable or permission denied. Use manual code entry below.');
          setCameraActive(false);
          setInputMode('manual');
        });
    }

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            try {
              html5QrCodeRef.current.clear();
            } catch (e) {}
          });
      }
    };
  }, [inputMode, isScanning]);

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    if (!manualCode.trim()) return;
    onScanSuccess(manualCode.trim(), 'manual');
    setManualCode('');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-warm-surface rounded-xl border border-border p-4 shadow-subtle">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <QrCode className="w-4 h-4 text-forest" />
          Check-in Scanner
        </span>
        <div className="flex items-center gap-1 bg-mint-soft p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setInputMode('camera')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
              inputMode === 'camera'
                ? 'bg-warm-surface text-forest-dark shadow-sm'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Camera
          </button>
          <button
            type="button"
            onClick={() => setInputMode('manual')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
              inputMode === 'manual'
                ? 'bg-warm-surface text-forest-dark shadow-sm'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            Manual
          </button>
        </div>
      </div>

      {inputMode === 'camera' ? (
        <div className="flex flex-col items-center">
          <div
            id={scannerContainerId}
            className="w-full max-w-[280px] h-[280px] rounded-lg overflow-hidden bg-text-main/5 border border-border flex items-center justify-center relative"
          >
            {!cameraActive && !cameraError && (
              <div className="text-xs text-text-muted animate-pulse text-center p-4">
                Initializing camera feed...
              </div>
            )}
          </div>
          {cameraError && (
            <p className="mt-2 text-xs text-status-warning text-center">{cameraError}</p>
          )}
          <p className="mt-3 text-xs text-text-muted text-center">
            Position attendee ticket QR code inside the viewfinder
          </p>
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-3 py-2">
          <Input
            label="Enter Ticket Code"
            placeholder="e.g. EF-2026-1001"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            helperText="Type or paste the attendee's ticket code or search by email"
            autoFocus
          />
          <Button type="submit" variant="primary" className="w-full">
            Verify & Check In Attendee
          </Button>
        </form>
      )}
    </div>
  );
};
