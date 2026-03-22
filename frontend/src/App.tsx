import { useState, useEffect, useCallback, useRef } from 'react';
import { useHwpxDocument } from './hooks/useHwpxDocument';
import { useEditor } from './hooks/useEditor';
import { StyleProvider } from './components/viewer/StyleContext';
import { EditorView } from './components/editor/EditorView';
import { Toolbar } from './components/editor/Toolbar';
import { StatusBar } from './components/common/StatusBar';
import { Ruler } from './components/viewer/Ruler';
import { hwpunitToPx } from './utils/unit-converter';
import type { PageLayout } from './lib/model';
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
  const [insertMode, setInsertMode] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [pageInfo, setPageInfo] = useState({ totalPages: 1, currentPage: 1 });
  const [editorStyles, setEditorStyles] = useState<StyleStore>(createDefaultStyles);
  const mainRef = useRef<HTMLElement>(null);

  // main 가로 스크롤과 눈금자 동기화 (transform 방식)
  const rulerInnerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const handleScroll = () => {
      if (rulerInnerRef.current) {
        rulerInnerRef.current.style.transform = `translateX(-${main.scrollLeft}px)`;
      }
    };
    main.addEventListener('scroll', handleScroll);
    return () => main.removeEventListener('scroll', handleScroll);
  }, []);

  // A4 기본 페이지 크기
  const pageWidthPx = hwpunitToPx(59528);
  const pageHeightPx = hwpunitToPx(84188);
  const defaultPageLayout: PageLayout = {
    width: 59528, height: 84188, landscape: 'NARROWLY', gutterType: 'LEFT_ONLY',
    margin: { left: 8504, right: 8504, top: 5668, bottom: 4252, header: 4252, footer: 4252, gutter: 0 },
  };

  // baseScale: 100%일 때 페이지가 화면에 딱 맞는 CSS scale 값
  const [baseScale, setBaseScale] = useState(1);

  const calcBaseScale = useCallback(() => {
    const el = mainRef.current;
    if (!el) return 1;
    const containerWidth = el.clientWidth - 32;
    const containerHeight = el.clientHeight - 80;
    const scaleW = containerWidth / pageWidthPx;
    const scaleH = containerHeight / pageHeightPx;
    return Math.min(scaleW, scaleH);
  }, [pageWidthPx, pageHeightPx]);

  // 줌 프리셋 값
  const ZOOM_PRESETS = [50, 75, 100, 125, 150, 200, 300];

  // 실제 CSS zoom = (zoom / 100) * baseScale
  const actualScale = (zoom / 100) * baseScale;

  const handleZoomIn = useCallback(() => {
    setZoom((z) => {
      const next = ZOOM_PRESETS.find((v) => v > z);
      return next ?? z;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => {
      const prev = [...ZOOM_PRESETS].reverse().find((v) => v < z);
      return prev ?? z;
    });
  }, []);

  const handleZoomSet = useCallback((value: number) => {
    setZoom(value);
  }, []);

  const handleFitWidth = useCallback(() => {
    const el = mainRef.current;
    if (!el || baseScale === 0) return;
    const containerWidth = el.clientWidth - 32;
    const fitWidthPercent = (containerWidth / pageWidthPx / baseScale) * 100;
    // 오버플로 없는 최대 프리셋 값
    const best = [...ZOOM_PRESETS].reverse().find((v) => v <= fitWidthPercent);
    setZoom(best ?? ZOOM_PRESETS[0]);
  }, [pageWidthPx, baseScale]);

  const handleFitPage = useCallback(() => {
    setZoom(100);
  }, []);

  // 창 크기 변경 시 baseScale 재계산
  useEffect(() => {
    const handleResize = () => {
      setBaseScale(calcBaseScale());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calcBaseScale]);

  // Insert 키로 삽입/수정 모드 토글
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Insert') {
        setInsertMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
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

  // 에디터 모드 진입 시 baseScale 계산
  useEffect(() => {
    if (mode === 'editor') {
      requestAnimationFrame(() => {
        setBaseScale(calcBaseScale());
      });
    }
  }, [mode, calcBaseScale]);

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
    <div className="flex flex-col h-screen bg-gray-100" style={{ overflow: 'hidden' }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 28,
        padding: '0 8px',
        backgroundColor: '#f5f6f7',
        borderBottom: '1px solid #ddd',
        flexShrink: 0,
        fontSize: 12,
      }}>
        <span style={{ fontWeight: 600, color: '#333' }}>HWPX Editor</span>
        {mode === 'editor' && (
          <span style={{ color: '#888' }}>{document?.meta.title || '새 문서'}</span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button
            onClick={handleNewDocument}
            style={{
              padding: '2px 10px', backgroundColor: '#4abe4a', color: '#fff',
              fontSize: 11, borderRadius: 3, border: 'none', cursor: 'pointer',
            }}
          >
            새 문서
          </button>
          <label
            htmlFor="file-input"
            style={{
              padding: '2px 10px', backgroundColor: '#4a8fdb', color: '#fff',
              fontSize: 11, borderRadius: 3, cursor: 'pointer',
            }}
          >
            파일 열기
          </label>
          <input type="file" accept=".hwpx" onChange={handleChange} className="hidden" id="file-input" />
        </div>
      </header>

      {mode === 'editor' && <Toolbar />}
      {mode === 'editor' && (
        <div style={{ backgroundColor: '#e5e7eb', flexShrink: 0, padding: '6px 16px', overflow: 'hidden', scrollbarGutter: 'stable' }}>
          <div ref={rulerInnerRef}>
            <Ruler pageLayout={defaultPageLayout} scale={actualScale} />
          </div>
        </div>
      )}
      <main ref={mainRef} className="flex-1 overflow-auto" style={mode === 'editor' ? { backgroundColor: '#e5e7eb', scrollbarGutter: 'stable' } : undefined}>
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
              <EditorView state={editorState} dispatch={dispatch} zoom={actualScale * 100} onPageInfo={setPageInfo} />
            </StyleProvider>
          </div>
        )}
      </main>

      {mode === 'editor' && (
        <StatusBar
          totalPages={pageInfo.totalPages}
          currentPage={pageInfo.currentPage}
          charCount={editorState.paragraphs.reduce((sum, p) => sum + p.runs.reduce((rs, r) => rs + r.contents.reduce((cs, c) => cs + (c.type === 'text' ? c.value.length : 0), 0), 0), 0)}
          sectionCount={document?.sections.length ?? 1}
          currentSection={1}
          insertMode={insertMode}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomSet={handleZoomSet}
          onFitWidth={handleFitWidth}
          onFitPage={handleFitPage}
        />
      )}
    </div>
  );
}

export default App;
