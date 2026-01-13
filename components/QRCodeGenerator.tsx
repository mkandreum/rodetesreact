import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface Props {
  text: string;
  width?: number;
}

const QRCodeGenerator: React.FC<Props> = ({ text, width = 200 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, text, {
        width,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [text, width]);

  return <canvas ref={canvasRef} />;
};

export default QRCodeGenerator;
