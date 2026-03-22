import { useState, useEffect, useCallback } from 'react';
import { useHwpxDocument } from './hooks/useHwpxDocument';
import { useEditor } from './hooks/useEditor';
import { StyleProvider } from './components/viewer/StyleContext';
import { EditorView } from './components/editor/EditorView';
import { Toolbar } from './components/editor/Toolbar';
import type { StyleStore } from './lib/model';

/** 빈 문서용 기본 StyleStore */
function createDefaultStyles(): StyleStore {
  return {
    charShapes: new Map([[0, {
      id: 0,
      height: 1000, // 10pt
      textColor: '#000000',
      shadeColor: 'none',
      useFontSpace: false,
      useKerning: false,
      symMark: 'NONE',
      borderFillIDRef: 0,
      fontRef: { hangul: 0, latin: 0, hanja: 0, japanese: 0, other: 0, symbol: 0, user: 0 },
      ratio: { hangul: 100, latin: 100, hanja: 100, japanese: 100, other: 100, symbol: 100, user: 100 },
      spacing: { hangul: 0, latin: 0, hanja: 0, japanese: 0, other: 0, symbol: 0, user: 0 },
      relSz: { hangul: 100, latin: 100, hanja: 100, japanese: 100, other: 100, symbol: 100, user: 100 },
      offset: { hangul: 0, latin: 0, hanja: 0, japanese: 0, other: 0, symbol: 0, user: 0 },
      bold: false,
      italic: false,
      underline: { type: 'NONE', shape: 'SOLID', color: '#000000' },
      strikeout: { shape: 'NONE', color: '#000000' },
      outline: 'NONE',
      shadow: { type: 'NONE', color: '#000000', offsetX: 0, offsetY: 0 },
      superscript: false,
      subscript: false,
    }]]),
    paraShapes: new Map([[0, {
      id: 0,
      tabPrIDRef: 0,
      condense: 0,
      fontLineHeight: false,
      snapToGrid: false,
      align: { horizontal: 'JUSTIFY', vertical: 'BASELINE' },
      heading: { type: 'NONE', idRef: 0, level: 0 },
      breakSetting: {
        breakLatinWord: 'KEEP_WORD',
        breakNonLatinWord: 'KEEP_WORD',
        widowOrphan: false,
        keepWithNext: false,
        keepLines: false,
        pageBreakBefore: false,
        lineWrap: 'BREAK',
      },
      autoSpacing: { eAsianEng: false, eAsianNum: false },
      margin: { indent: 0, left: 0, right: 0, prev: 0, next: 0 },
      lineSpacing: { type: 'PERCENT', value: 160, unit: 'HWPUNIT' },
      border: { borderFillIDRef: 0, offsetLeft: 0, offsetRight: 0, offsetTop: 0, offsetBottom: 0, connect: false, ignoreMargin: false },
    }]]),
    fonts: new Map([['HANGUL', new Map([[0, { id: 0, face: '바탕', type: 'TTF', isEmbedded: false }]])]]),
    styles: new Map(),
    borderFills: new Map(),
    tabProperties: new Map(),
  };
}

type AppMode = 'idle' | 'viewer' | 'editor';

function App() {
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState<AppMode>('idle');
  const [editorStyles, setEditorStyles] = useState<StyleStore>(createDefaultStyles);
  const { loading, error, document, loadFile, loadBuffer } = useHwpxDocument();
  const { state: editorState, dispatch, loadDocument } = useEditor();

  // ?sample=sample01 URL 파라미터로 자동 로드
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sample = params.get('sample');
    if (sample) {
      fetch(`/samples/${sample}.hwpx`)
        .then((res) => {
          if (!res.ok) throw new Error(`샘플 파일을 찾을 수 없습니다: ${sample}.hwpx`);
          return res.arrayBuffer();
        })
        .then((buffer) => loadBuffer(buffer))
        .catch((err) => console.error('샘플 로드 실패:', err));
    }
  }, [loadBuffer]);

  // HWPX 로드 완료 시 에디터 모드로 전환
  useEffect(() => {
    if (document) {
      const paragraphs = document.sections.flatMap(s => s.paragraphs);
      loadDocument(paragraphs);
      setEditorStyles(document.styles);
      setMode('editor');
    }
  }, [document, loadDocument]);

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

  const handleNewDocument = useCallback(() => {
    loadDocument([]);
    setEditorStyles(createDefaultStyles());
    setMode('editor');
  }, [loadDocument]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm px-6 py-3 flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-800">HWPX Editor</h1>
        {mode === 'editor' && (
          <span className="text-sm text-gray-500">
            {document?.meta.title || '새 문서'}
          </span>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={handleNewDocument}
            className="px-4 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 cursor-pointer"
          >
            새 문서
          </button>
          <label
            htmlFor="file-input"
            className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 cursor-pointer"
          >
            파일 열기
          </label>
          <input type="file" accept=".hwpx" onChange={handleChange} className="hidden" id="file-input" />
        </div>
      </header>

      {mode === 'editor' && <Toolbar />}

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

        {!loading && !error && mode === 'idle' && (
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
              <p className="text-sm text-gray-400 mb-4">.hwpx 파일만 지원됩니다</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleNewDocument}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer"
                >
                  새 문서 만들기
                </button>
                <label
                  htmlFor="file-input"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
                >
                  파일 선택
                </label>
              </div>
            </div>
          </div>
        )}

        {mode === 'editor' && (
          <div style={{ padding: '16px', backgroundColor: '#e5e7eb', minHeight: '100%' }}>
            <StyleProvider store={editorStyles}>
              <EditorView state={editorState} dispatch={dispatch} />
            </StyleProvider>
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 py-3 bg-white border-t">
        본 제품은 한글과컴퓨터의 한글 문서 파일(.hwp) 공개 문서를 참고하여 개발하였습니다.
      </footer>
    </div>
  );
}

export default App;
