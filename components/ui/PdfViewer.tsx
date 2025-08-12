
import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import Spinner from './Spinner';
import Button from './Button';
import { IconAlertTriangle } from '../../constants';

// Set worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs';


interface PdfViewerProps {
  fileUrl: string | null;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ fileUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      if (!fileUrl) return;

      setIsLoading(true);
      setError(null);
      setPdfDoc(null);
      setPageNum(1);

      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
      } catch (err) {
        console.error('Failed to load PDF:', err);
        setError('Não foi possível carregar o arquivo PDF. Verifique o link ou tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [fileUrl]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    const renderPage = async () => {
       try {
        const page = await pdfDoc.getPage(pageNum);
        const container = containerRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;
        
        const viewportDefault = page.getViewport({ scale: 1 });
        
        const scale = Math.min(
            (container.clientWidth - 16) / viewportDefault.width,
            (container.clientHeight - 16) / viewportDefault.height
        );

        const viewport = page.getViewport({ scale: scale });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;

      } catch (err) {
        console.error("Error rendering page:", err);
        setError("Erro ao renderizar a página do PDF.");
      }
    };

    renderPage();
  }, [pdfDoc, pageNum]);

  const onPrevPage = () => setPageNum(prev => Math.max(prev - 1, 1));
  const onNextPage = () => setPageNum(prev => Math.min(prev + 1, numPages));

  return (
    <div className="flex flex-col h-full bg-gray-800 dark:bg-slate-900 rounded-b-lg p-2">
      {isLoading && <div className="m-auto"><Spinner /></div>}
      
      {error && !isLoading && (
        <div className="m-auto text-center text-red-400">
            <IconAlertTriangle className="h-10 w-10 mx-auto mb-2"/>
            <p className="font-semibold">Erro ao Carregar PDF</p>
            <p className="text-sm">{error}</p>
        </div>
      )}
      
      {!fileUrl && !isLoading && !error && (
         <div className="m-auto text-center text-gray-400">
            <p>Selecione um documento para visualizar.</p>
        </div>
      )}

      {pdfDoc && !error && (
        <>
          <div ref={containerRef} className="flex-1 overflow-auto flex justify-center items-center p-2">
            <canvas ref={canvasRef} className="shadow-lg" />
          </div>
          <div className="flex-shrink-0 flex items-center justify-center p-2 bg-black bg-opacity-20 dark:bg-black/40 rounded">
            <Button onClick={onPrevPage} disabled={pageNum <= 1} variant="secondary">Anterior</Button>
            <span className="mx-4 text-white text-sm font-medium">
              Página {pageNum} de {numPages}
            </span>
            <Button onClick={onNextPage} disabled={pageNum >= numPages} variant="secondary">Próxima</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PdfViewer;
