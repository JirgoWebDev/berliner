'use client';

import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';

export default function QRCodePage() {
  const [qrUrl, setQrUrl] = useState('');
  const [menuUrl, setMenuUrl] = useState('');

  useEffect(() => {
    // Get the base URL dynamically based on where it's hosted
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}`;
    setMenuUrl(fullUrl);

    QRCode.toDataURL(fullUrl, {
      width: 800,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }).then(url => {
      setQrUrl(url);
    });
  }, []);

  const downloadQR = () => {
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = 'moda-berliner-qr.png';
    a.click();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 md:p-2">
      <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">QR Kod Oluşturucu</h2>
      <p className="text-neutral-500 text-sm">
        Müşterilerinizin okutarak menüye ulaşabileceği karekodu aşağıdan indirebilirsiniz.
      </p>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm flex flex-col items-center">
        {qrUrl ? (
          <img src={qrUrl} alt="QR Code" className="w-64 h-64 border-4 border-white shadow-xl rounded-xl" />
        ) : (
          <div className="w-64 h-64 bg-neutral-100 animate-pulse rounded-xl" />
        )}
        
        <div className="mt-8 text-center space-y-4">
          <div className="bg-neutral-100 px-4 py-2 rounded-lg text-xs md:text-sm font-mono text-neutral-600 max-w-full overflow-hidden text-ellipsis">
            {menuUrl}
          </div>
          <button 
            onClick={downloadQR}
            className="flex items-center justify-center w-full md:w-auto gap-2 bg-[#e3372c] text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 active:scale-95 transition-all shadow-md"
          >
            <Download className="w-5 h-5" />
            Yüksek Çözünürlüklü İndir (PNG)
          </button>
        </div>
      </div>
    </div>
  );
}
