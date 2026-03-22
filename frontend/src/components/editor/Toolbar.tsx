/** HWP 스타일 도구 모음 — 기능 미구현, UI만 */

export function Toolbar() {
  return (
    <div style={{ borderBottom: '1px solid #c0c0c0', backgroundColor: '#f5f6f7', userSelect: 'none', fontSize: 13 }}>
      <MenuBar />
      <IconToolbar />
      <FormatBar />
    </div>
  );
}

// ═══════════════════════════════════════
// 메뉴 바
// ═══════════════════════════════════════
function MenuBar() {
  const menus = ['파일', '편집', '보기', '입력', '서식', '쪽', '표', '검토', '도구'];
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid #ddd',
      height: 30,
      padding: '0 2px',
    }}>
      {menus.map((m) => (
        <button key={m} className="toolbar-btn" style={{ padding: '4px 14px', fontSize: 13 }}>
          {m}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// 아이콘 도구 모음
// ═══════════════════════════════════════
function IconToolbar() {
  const groups: { items: { icon: React.ReactNode; label: string; sub?: boolean }[] }[] = [
    { items: [
      { icon: <IconBox>💾</IconBox>, label: '저장하기' },
    ]},
    { items: [
      { icon: <IconBox>✂</IconBox>, label: '오려두기' },
      { icon: <IconBox>📋</IconBox>, label: '복사하기' },
      { icon: <IconBox>📄</IconBox>, label: '붙이기' },
      { icon: <IconBox>🖌</IconBox>, label: '모양복사' },
    ]},
    { items: [
      { icon: <IconBox>🔍</IconBox>, label: '찾기' },
    ]},
    { items: [
      { icon: <IconBox color="#4a7ebb">△</IconBox>, label: '도형', sub: true },
      { icon: <IconBox color="#5a8f4a">🖼</IconBox>, label: '그림', sub: true },
      { icon: <IconBox>⊞</IconBox>, label: '표', sub: true },
      { icon: <IconBox color="#4a7ebb">📊</IconBox>, label: '차트', sub: true },
      { icon: <IconBox>🌐</IconBox>, label: '웹\n동영상' },
    ]},
    { items: [
      { icon: <IconBox>①</IconBox>, label: '각주' },
      { icon: <IconBox>②</IconBox>, label: '미주' },
    ]},
    { items: [
      { icon: <IconBox color="#4a7ebb">🔗</IconBox>, label: '하이퍼링크' },
      { icon: <IconBox>文</IconBox>, label: '문자표' },
    ]},
    { items: [
      { icon: <IconBox style={{ fontWeight: 'bold', fontSize: 18 }}>가</IconBox>, label: '글자\n모양' },
      { icon: <IconBox>≡</IconBox>, label: '문단\n모양' },
    ]},
    { items: [
      { icon: <IconBox>⬜</IconBox>, label: '개체\n속성', sub: true },
    ]},
    { items: [
      { icon: <IconBox>📃</IconBox>, label: '머리말' },
      { icon: <IconBox>📃</IconBox>, label: '꼬리말' },
    ]},
    { items: [
      { icon: <IconBox>[#]</IconBox>, label: '조판\n부호' },
      { icon: <IconBox>→</IconBox>, label: '문단\n부호' },
      { icon: <IconBox>⊞</IconBox>, label: '격자\n보기' },
    ]},
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      borderBottom: '1px solid #ddd',
      padding: '3px 4px 2px',
      gap: 0,
      minHeight: 56,
    }}>
      {groups.map((group, gi) => (
        <div key={gi} style={{ display: 'flex', alignItems: 'flex-end', gap: 0 }}>
          {group.items.map((item, ii) => (
            <div key={ii} style={{ position: 'relative' }}>
              <button
                className="toolbar-btn"
                title={item.label.replace('\n', '')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  minWidth: 36,
                  height: 50,
                  padding: '2px 3px 1px',
                  gap: 1,
                }}
              >
                {item.icon}
                <span style={{
                  fontSize: 9,
                  color: '#444',
                  lineHeight: 1.2,
                  whiteSpace: 'pre-line',
                  textAlign: 'center',
                }}>
                  {item.label}
                </span>
              </button>
              {item.sub && (
                <span style={{
                  position: 'absolute',
                  bottom: 14,
                  right: 2,
                  fontSize: 7,
                  color: '#888',
                }}>▾</span>
              )}
            </div>
          ))}
          {gi < groups.length - 1 && <Sep h={40} />}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// 서식 도구 모음
// ═══════════════════════════════════════
function FormatBar() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '2px 4px',
      gap: 3,
      height: 30,
    }}>
      {/* 실행취소/다시실행 */}
      <SmallBtn title="실행 취소">↩</SmallBtn>
      <SmallBtn title="다시 실행">↪</SmallBtn>
      <Sep />

      {/* 스타일 */}
      <Dropdown value="바탕글" width={80} />
      <Sep />

      {/* 언어 */}
      <Dropdown value="대표" width={52} />
      <Sep />

      {/* 글꼴 */}
      <Dropdown value="맑은 고딕" width={110} />

      {/* 크기 */}
      <Dropdown value="10.0" width={44} />
      <span style={{ fontSize: 11, color: '#666' }}>pt</span>
      <SmallBtn title="크기 증가">▲</SmallBtn>
      <SmallBtn title="크기 감소">▼</SmallBtn>
      <Sep />

      {/* 글자 스타일 */}
      <FmtBtn title="굵게" bold>가</FmtBtn>
      <FmtBtn title="기울임" italic>가</FmtBtn>
      <FmtBtn title="밑줄" underline>가</FmtBtn>
      <FmtBtn title="취소선" strike>가</FmtBtn>
      <Sep />

      {/* 글자색 */}
      <ColorBtn title="글자 색" label="가" color="#dc2626" />
      <Sep />

      {/* 형광펜 */}
      <SmallBtn title="형광펜">🖊</SmallBtn>
      <Sep />

      {/* 정렬 */}
      <AlignBtn title="양쪽 정렬" lines={[10, 10, 10, 8]} active />
      <AlignBtn title="왼쪽 정렬" lines={[10, 8, 10, 6]} />
      <AlignBtn title="가운데 정렬" lines={[8, 10, 6, 10]} center />
      <AlignBtn title="오른쪽 정렬" lines={[8, 10, 6, 10]} right />
      <Sep />

      {/* 줄간격 */}
      <SmallBtn title="줄 간격" style={{ fontSize: 13 }}>⇕</SmallBtn>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #bbb',
        borderRadius: 2,
        height: 22,
        padding: '0 4px',
        backgroundColor: '#fff',
        gap: 2,
      }}>
        <span style={{ fontSize: 12, color: '#333', minWidth: 24, textAlign: 'right' }}>160</span>
        <span style={{ fontSize: 10, color: '#999' }}>%</span>
        <span style={{ fontSize: 8, color: '#999', marginLeft: 2 }}>▾</span>
      </div>
      <Sep />

      {/* 목록 */}
      <SmallBtn title="글머리 기호">☰</SmallBtn>
      <SmallBtn title="번호 매기기">≡</SmallBtn>
      <Sep />

      {/* 들여쓰기 */}
      <SmallBtn title="들여쓰기 늘리기">⇥</SmallBtn>
      <SmallBtn title="들여쓰기 줄이기">⇤</SmallBtn>
    </div>
  );
}

// ═══════════════════════════════════════
// 공통 UI 요소
// ═══════════════════════════════════════

function IconBox({ children, color, style }: {
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 26,
      height: 26,
      fontSize: 16,
      color: color || '#555',
      ...style,
    }}>
      {children}
    </span>
  );
}

function SmallBtn({ children, title, style }: {
  children: React.ReactNode;
  title: string;
  style?: React.CSSProperties;
}) {
  return (
    <button className="toolbar-btn" title={title} style={{
      width: 22,
      height: 22,
      fontSize: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      ...style,
    }}>
      {children}
    </button>
  );
}

function FmtBtn({ children, title, bold, italic, underline, strike }: {
  children: React.ReactNode;
  title: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
}) {
  return (
    <button className="toolbar-btn" title={title} style={{
      minWidth: 24,
      height: 24,
      fontSize: 14,
      fontWeight: bold ? 'bold' : 'normal',
      fontStyle: italic ? 'italic' : 'normal',
      textDecoration: underline ? 'underline' : strike ? 'line-through' : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 2px',
      color: '#333',
    }}>
      {children}
    </button>
  );
}

function ColorBtn({ title, label, color }: { title: string; label: string; color: string }) {
  return (
    <button className="toolbar-btn" title={title} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: 26,
      height: 24,
      padding: 0,
      gap: 0,
    }}>
      <span style={{ fontSize: 14, color: '#333', lineHeight: 1 }}>{label}</span>
      <span style={{ width: 16, height: 3, backgroundColor: color, borderRadius: 1 }} />
    </button>
  );
}

function AlignBtn({ title, lines, active, center, right }: {
  title: string;
  lines: number[];
  active?: boolean;
  center?: boolean;
  right?: boolean;
}) {
  return (
    <button className="toolbar-btn" title={title} style={{
      width: 24,
      height: 24,
      display: 'flex',
      flexDirection: 'column',
      alignItems: center ? 'center' : right ? 'flex-end' : 'flex-start',
      justifyContent: 'center',
      padding: '3px 4px',
      gap: 2,
      backgroundColor: active ? '#dbeafe' : undefined,
      borderColor: active ? '#93c5fd' : undefined,
    }}>
      {lines.map((w, i) => (
        <span key={i} style={{
          display: 'block',
          width: w * 1.4,
          height: 1.5,
          backgroundColor: active ? '#2563eb' : '#666',
          borderRadius: 0.5,
        }} />
      ))}
    </button>
  );
}

function Dropdown({ value, width }: { value: string; width: number }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width,
      height: 22,
      border: '1px solid #bbb',
      borderRadius: 2,
      padding: '0 4px',
      backgroundColor: '#fff',
      cursor: 'pointer',
      fontSize: 12,
      color: '#333',
    }}>
      <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {value}
      </span>
      <span style={{ fontSize: 8, color: '#999', marginLeft: 2, flexShrink: 0 }}>▾</span>
    </div>
  );
}

function Sep({ h }: { h?: number }) {
  return (
    <div style={{
      width: 1,
      height: h ?? 18,
      backgroundColor: '#ccc',
      margin: '0 4px',
      flexShrink: 0,
    }} />
  );
}
