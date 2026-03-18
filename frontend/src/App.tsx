import { useState } from 'react';
import { useHwpxDocument } from './hooks/useHwpxDocument';
import { DocumentViewer } from './components/viewer/DocumentViewer';

function App() {
  const [dragOver, setDragOver] = useState(false);
  const { loading, error, document, loadFile } = useHwpxDocument();

  const handleFileSelect = (file: File) => {
    loadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.hwpx')) {
      handleFileSelect(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm px-6 py-3 flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-800">HWPX Viewer</h1>
        {document && (
          <span className="text-sm text-gray-500">{document.meta.title || '문서'}</span>
        )}
        <label
          htmlFor="file-input"
          className="ml-auto px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 cursor-pointer"
        >
          파일 열기
        </label>
        <input type="file" accept=".hwpx" onChange={handleChange} className="hidden" id="file-input" />
      </header>

      <main className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">문서를 불러오는 중...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-600 bg-red-50 px-6 py-4 rounded-lg">{error}</div>
          </div>
        )}

        {!loading && !error && !document && (
          <div className="flex items-center justify-center h-full p-8">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors duration-200 ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              <p className="text-gray-500 mb-2">HWPX 파일을 여기에 드래그하거나 클릭하세요</p>
              <p className="text-sm text-gray-400">.hwpx 파일만 지원됩니다</p>
              <label
                htmlFor="file-input"
                className="mt-4 inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
              >
                파일 선택
              </label>
            </div>
          </div>
        )}

        {document && <DocumentViewer document={document} />}
      </main>

      <footer className="text-center text-xs text-gray-400 py-3 bg-white border-t">
        본 제품은 한글과컴퓨터의 한글 문서 파일(.hwp) 공개 문서를 참고하여 개발하였습니다.
      </footer>
    </div>
  );
}

export default App;
