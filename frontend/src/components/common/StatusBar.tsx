import { useState, useRef, useEffect } from 'react';

interface StatusBarProps {
  totalPages: number;
  currentPage: number;
  charCount: number;
  sectionCount: number;
  currentSection: number;
  insertMode: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomSet: (value: number) => void;
  onFitWidth: () => void;
  onFitPage: () => void;
}

type ZoomOption = { type: 'fit'; label: string; action: 'fitPage' | 'fitWidth' } | { type: 'value'; value: number };

const ZOOM_OPTIONS: ZoomOption[] = [
  { type: 'fit', label: '쪽 맞춤', action: 'fitPage' },
  { type: 'fit', label: '폭 맞춤', action: 'fitWidth' },
  { type: 'value', value: 50 },
  { type: 'value', value: 75 },
  { type: 'value', value: 100 },
  { type: 'value', value: 125 },
  { type: 'value', value: 150 },
  { type: 'value', value: 200 },
  { type: 'value', value: 300 },
];

export function StatusBar({
  totalPages,
  currentPage,
  charCount,
  sectionCount,
  currentSection,
  insertMode,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomSet,
  onFitWidth,
  onFitPage,
}: StatusBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const itemStyle: React.CSSProperties = {
    padding: '0 10px',
    borderRight: '1px solid #d1d5db',
    whiteSpace: 'nowrap',
  };

  const handleOptionClick = (opt: ZoomOption) => {
    if (opt.type === 'fit') {
      if (opt.action === 'fitPage') onFitPage();
      else onFitWidth();
    } else {
      onZoomSet(opt.value);
    }
    setDropdownOpen(false);
  };

  const isSelected = (opt: ZoomOption) => {
    if (opt.type === 'fit') return false;
    return Math.round(zoom) === opt.value;
  };

  const displayText = `${Math.round(zoom)}%`;

  return (
    <footer
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 28,
        backgroundColor: '#f3f4f6',
        borderTop: '1px solid #d1d5db',
        fontSize: 12,
        color: '#374151',
        fontFamily: 'sans-serif',
        userSelect: 'none',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
        paddingRight: 8,
      }}
    >
      {/* 왼쪽 영역 */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <span style={itemStyle}>
          {currentPage}/{totalPages}쪽
        </span>
        <span style={itemStyle}>
          {charCount}글자
        </span>
        <span style={itemStyle}>
          구역:{currentSection}/{sectionCount}
        </span>
        <span style={itemStyle}>{insertMode ? '삽입' : '수정'}</span>
        <span style={{ ...itemStyle, borderRight: 'none', color: '#6b7280' }}>
          변경 내용 (기록 중지)
        </span>
      </div>

      {/* 오른쪽 영역 */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 4 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onFitWidth(); }}
          style={{ ...btnStyle, color: '#6b7280' }}
          title="폭맞춤"
        >
          <FitWidthIcon />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onFitPage(); }}
          style={{ ...btnStyle, color: '#6b7280' }}
          title="쪽맞춤"
        >
          <FitPageIcon />
        </button>

        {/* 퍼센트 드롭다운 */}
        <div ref={dropdownRef} style={{ position: 'relative', marginLeft: 4 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setDropdownOpen((o) => !o); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              height: 22,
              padding: '0 6px 0 10px',
              border: '1px solid #d1d5db',
              borderRadius: 3,
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: 12,
              color: '#374151',
              minWidth: 72,
              justifyContent: 'space-between',
            }}
          >
            <span>{displayText}</span>
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none" stroke="#666" strokeWidth="1.5">
              <polyline points="1,1 4,4 7,1" />
            </svg>
          </button>
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: 24,
                left: 0,
                backgroundColor: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 100,
                minWidth: 120,
                overflow: 'hidden',
                padding: '2px 0',
              }}
            >
              {ZOOM_OPTIONS.map((opt, i) => (
                <div
                  key={i}
                  onClick={(e) => { e.stopPropagation(); handleOptionClick(opt); }}
                  style={{
                    padding: '5px 14px',
                    cursor: 'pointer',
                    backgroundColor: isSelected(opt) ? '#dbeafe' : '#fff',
                    fontSize: 12,
                    color: '#374151',
                  }}
                  onMouseEnter={(e) => { if (!isSelected(opt)) (e.currentTarget).style.backgroundColor = '#f3f4f6'; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.backgroundColor = isSelected(opt) ? '#dbeafe' : '#fff'; }}
                >
                  {opt.type === 'fit' ? opt.label : `${opt.value}%`}
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={(e) => { e.stopPropagation(); onZoomOut(); }} style={btnStyle} title="축소">
          <ZoomOutIcon />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onZoomIn(); }} style={btnStyle} title="확대">
          <ZoomInIcon />
        </button>
      </div>
    </footer>
  );
}

const btnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 24,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  color: '#6b7280',
  borderRadius: 3,
  padding: 0,
};

function FitWidthIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <line x1="1" y1="7" x2="13" y2="7" />
      <polyline points="1,7 3.5,4.5" />
      <polyline points="1,7 3.5,9.5" />
      <polyline points="13,7 10.5,4.5" />
      <polyline points="13,7 10.5,9.5" />
    </svg>
  );
}

function FitPageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="2" y="1" width="10" height="12" rx="1" />
      <line x1="4.5" y1="7" x2="9.5" y2="7" />
      <line x1="7" y1="4" x2="7" y2="10" />
    </svg>
  );
}

function ZoomInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="6" cy="6" r="4.5" />
      <line x1="9.5" y1="9.5" x2="13" y2="13" />
      <line x1="4" y1="6" x2="8" y2="6" />
      <line x1="6" y1="4" x2="6" y2="8" />
    </svg>
  );
}

function ZoomOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="6" cy="6" r="4.5" />
      <line x1="9.5" y1="9.5" x2="13" y2="13" />
      <line x1="4" y1="6" x2="8" y2="6" />
    </svg>
  );
}
