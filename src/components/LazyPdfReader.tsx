
import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Volume2, VolumeX, Maximize, Minimize, Loader2 } from 'lucide-react';
import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;

interface LazyPdfReaderProps {
  pdfUrl: string;
  title: string;
  onClose: () => void;
}

const LazyPdfReader: React.FC<LazyPdfReaderProps> = ({ pdfUrl, title, onClose }) => {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedPagesCount, setLoadedPagesCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const flipBookRef = useRef<any>(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const pdf: PDFDocumentProxy = await getDocument(pdfUrl).promise;
        setTotalPages(pdf.numPages);
        
        const pageImages: string[] = [];
        
        // PDF sayfalarını lazy loading ile yükle
        for (let i = 1; i <= pdf.numPages; i++) {
          try {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const context = canvas.getContext('2d');
            
            if (context) {
              await page.render({ canvasContext: context, viewport }).promise;
              pageImages.push(canvas.toDataURL('image/jpeg', 0.8));
              setLoadedPagesCount(i);
              
              // Her 3 sayfa yüklendiğinde UI'ı güncelle
              if (i % 3 === 0 || i === pdf.numPages) {
                setPages([...pageImages]);
              }
            }
          } catch (pageError) {
            console.error(`Error loading page ${i}:`, pageError);
            // Hatalı sayfa için placeholder ekle
            pageImages.push('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzY5NzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9rdW5hbWF5YW4gU2F5ZmE8L3RleHQ+PC9zdmc+');
          }
        }
        
        setPages(pageImages);
        setLoading(false);
      } catch (err) {
        console.error('PDF loading error:', err);
        setError('PDF yüklenirken hata oluştu. Lütfen tekrar deneyin.');
        setLoading(false);
      }
    };

    if (pdfUrl) {
      loadPdf();
    }
  }, [pdfUrl]);

  const playFlipSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ses çalınamadı, sessizce devam et
      });
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 flex flex-col items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">PDF Yükleniyor...</h3>
          <p className="text-slate-300 mb-4">{title}</p>
          {totalPages > 0 && (
            <div className="bg-white/10 rounded-lg p-4 max-w-sm">
              <div className="flex justify-between text-sm mb-2">
                <span>İlerleme</span>
                <span>{loadedPagesCount} / {totalPages}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(loadedPagesCount / totalPages) * 100}%` }}
                />
              </div>
            </div>
          )}
          <Button 
            variant="outline" 
            onClick={onClose}
            className="mt-6 text-white border-white/20 hover:bg-white/10"
          >
            İptal
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <X className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Hata</h3>
          <p className="text-slate-300 mb-6">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()} className="bg-cyan-600 hover:bg-cyan-700">
              Tekrar Dene
            </Button>
            <Button variant="outline" onClick={onClose} className="text-white border-white/20 hover:bg-white/10">
              Kapat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!pages.length) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <h3 className="text-xl font-semibold mb-2">PDF sayfaları bulunamadı</h3>
          <Button variant="outline" onClick={onClose} className="text-white border-white/20 hover:bg-white/10">
            Kapat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-2 pt-2">
        <div className="flex items-center justify-between gap-2 bg-black/80 backdrop-blur-md rounded-lg px-2 py-1 sm:p-3 border border-white/10 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 p-1">
              <X className="h-4 w-4" />
            </Button>
            <span className="text-white font-medium truncate max-w-[40vw] sm:max-w-48 px-2">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              className="text-white hover:bg-white/20 p-1"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleFullscreen} 
              className="text-white hover:bg-white/20 p-1"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden py-16 px-4">
        <div className="max-w-4xl w-full h-full flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-h-full max-w-full">
            <img
              src={pages[currentPage]}
              alt={`Sayfa ${currentPage + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzY5NzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9rdW5hbWF5YW4gU2F5ZmE8L3RleHQ+PC9zdmc+';
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 px-2">
        <div className="bg-black/80 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10 flex flex-col items-center text-xs sm:text-sm min-w-[200px]">
          <div className="text-white font-medium mb-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (currentPage > 0) {
                  setCurrentPage(currentPage - 1);
                  playFlipSound();
                }
              }}
              disabled={currentPage === 0}
              className="text-white hover:bg-white/20 h-6 px-2"
            >
              ‹
            </Button>
            <span>Sayfa {currentPage + 1} / {pages.length}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (currentPage < pages.length - 1) {
                  setCurrentPage(currentPage + 1);
                  playFlipSound();
                }
              }}
              disabled={currentPage === pages.length - 1}
              className="text-white hover:bg-white/20 h-6 px-2"
            >
              ›
            </Button>
          </div>
          <input
            type="range"
            min={0}
            max={pages.length - 1}
            value={currentPage}
            onChange={(e) => {
              setCurrentPage(Number(e.target.value));
              playFlipSound();
            }}
            className="w-48 sm:w-64 h-2 rounded-lg appearance-none bg-gradient-to-r from-cyan-400 to-teal-400 outline-none"
          />
        </div>
      </div>

      <audio ref={audioRef} src="/page-flip.mp3" preload="auto" />
    </div>
  );
};

export default LazyPdfReader;
