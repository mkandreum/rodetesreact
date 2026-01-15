import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<Props> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScan(decodedText);
          },
          (errorMessage) => {
            // Ignore frame errors
          }
        );
      } catch (err) {
        console.error("Error starting scanner", err);
        setError("Could not start camera. Please ensure permissions are granted.");
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(err => console.error("Error stopping scanner", err));
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-white p-4">
        <h3 className="text-2xl font-pixel text-white text-center mb-4">ESCANEAR CÓDIGO</h3>
        <div id="reader" className="w-full bg-black aspect-square overflow-hidden border border-gray-700"></div>
        {error && <p className="text-red-400 text-center font-pixel mt-2">{error}</p>}
        <button
          onClick={onClose}
          className="w-full mt-4 neon-btn font-pixel text-xl py-2 px-4"
        >
          CERRAR CÁMARA
        </button>
      </div>
    </div>
  );
};

export default Scanner;
