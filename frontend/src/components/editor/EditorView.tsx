import { useRef, useCallback, useEffect, useState } from 'react';
import { EditableParagraph } from './EditableParagraph';
import { hwpunitToPx } from '../../utils/unit-converter';
import type { EditorState, EditorAction, CursorPosition } from '../../lib/editor/document';

interface EditorViewProps {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
}

// HWP 기본 A4 페이지 설정 (hwpunit)
const DEFAULT_PAGE_HWPUNIT = {
  width: 59528,       // A4 210mm
  height: 84188,      // A4 297mm
  marginTop: 5668,    // 20mm
  marginBottom: 4252,  // 15mm
  marginLeft: 8504,   // 30mm
  marginRight: 8504,  // 30mm
};

const DEFAULT_PAGE = {
  width: hwpunitToPx(DEFAULT_PAGE_HWPUNIT.width),
  height: hwpunitToPx(DEFAULT_PAGE_HWPUNIT.height),
  paddingTop: hwpunitToPx(DEFAULT_PAGE_HWPUNIT.marginTop),
  paddingBottom: hwpunitToPx(DEFAULT_PAGE_HWPUNIT.marginBottom),
  paddingLeft: hwpunitToPx(DEFAULT_PAGE_HWPUNIT.marginLeft),
  paddingRight: hwpunitToPx(DEFAULT_PAGE_HWPUNIT.marginRight),
};

export function EditorView({ state, dispatch }: EditorViewProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);
  const [composingText, setComposingText] = useState('');

  const focusTextarea = useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    focusTextarea();
  }, [focusTextarea]);

  // keydown — 특수 키만 처리
  // 문자 입력은 모두 input 이벤트에서 처리 (IME/직접 입력 통합)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 조합 중에는 Enter만 preventDefault (textarea에 줄바꿈 방지)
    if (e.nativeEvent.isComposing || composingRef.current) {
      if (e.key === 'Enter') e.preventDefault();
      return;
    }

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        dispatch({ type: 'SPLIT_PARAGRAPH' });
        break;
      case 'Backspace':
        e.preventDefault();
        dispatch({ type: 'DELETE_BACKWARD' });
        break;
      case 'Delete':
        e.preventDefault();
        dispatch({ type: 'DELETE_FORWARD' });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        dispatch({ type: 'MOVE_LEFT' });
        break;
      case 'ArrowRight':
        e.preventDefault();
        dispatch({ type: 'MOVE_RIGHT' });
        break;
    }
  }, [dispatch]);

  const handleCompositionStart = useCallback(() => {
    composingRef.current = true;
    setComposingText('');
  }, []);

  const handleCompositionUpdate = useCallback((e: React.CompositionEvent<HTMLTextAreaElement>) => {
    setComposingText(e.data);
  }, []);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLTextAreaElement>) => {
    composingRef.current = false;
    setComposingText('');
    // 조합 완료된 텍스트 삽입
    if (e.data) {
      dispatch({ type: 'INSERT_TEXT', char: e.data });
    }
    // textarea 초기화 → 직후 input 이벤트에서 중복 삽입 방지
    if (textareaRef.current) {
      textareaRef.current.value = '';
    }
  }, [dispatch]);

  // input 이벤트 — IME가 아닌 직접 입력 (영문, 숫자, 특수문자)
  // IME 입력은 compositionEnd에서 처리되고 textarea가 비워지므로 여기서 중복 없음
  const handleInput = useCallback(() => {
    if (composingRef.current) return;
    const ta = textareaRef.current;
    if (!ta) return;
    const value = ta.value;
    ta.value = '';
    if (!value) return;

    const text = value.replace(/\n/g, '');
    if (text) {
      dispatch({ type: 'INSERT_TEXT', char: text });
    }
  }, [dispatch]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const range = document.caretRangeFromPoint(e.clientX, e.clientY);
    if (!range) {
      focusTextarea();
      return;
    }

    const textNode = range.startContainer;
    const clickOffset = range.startOffset;

    const runElement = findAncestorWithData(textNode, 'runIndex');
    const paraElement = findAncestorWithData(textNode, 'paraIndex');

    if (!paraElement || !runElement) {
      if (paraElement) {
        const paraIndex = parseInt(paraElement.dataset.paraIndex!, 10);
        const para = state.paragraphs[paraIndex];
        if (para) {
          const lastRunIndex = para.runs.length - 1;
          let lastRunLen = 0;
          for (const c of para.runs[lastRunIndex].contents) {
            if (c.type === 'text') lastRunLen += c.value.length;
          }
          dispatch({
            type: 'MOVE_CURSOR',
            pos: { paraIndex, runIndex: lastRunIndex, offset: lastRunLen },
          });
        }
      }
      focusTextarea();
      return;
    }

    const paraIndex = parseInt(paraElement.dataset.paraIndex!, 10);
    const runIndex = parseInt(runElement.dataset.runIndex!, 10);

    const run = state.paragraphs[paraIndex]?.runs[runIndex];
    if (!run) {
      focusTextarea();
      return;
    }

    const offset = computeOffsetInRun(runElement, textNode, clickOffset, run);
    dispatch({ type: 'MOVE_CURSOR', pos: { paraIndex, runIndex, offset } });
    focusTextarea();
  }, [state.paragraphs, dispatch, focusTextarea]);

  const pageStyle: React.CSSProperties = {
    width: DEFAULT_PAGE.width,
    maxWidth: '100%',
    minHeight: DEFAULT_PAGE.height,
    backgroundColor: '#fff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
    margin: '24px auto',
    paddingTop: DEFAULT_PAGE.paddingTop,
    paddingBottom: DEFAULT_PAGE.paddingBottom,
    paddingLeft: DEFAULT_PAGE.paddingLeft,
    paddingRight: DEFAULT_PAGE.paddingRight,
    boxSizing: 'border-box',
    position: 'relative',
    borderRadius: 2,
    cursor: 'text',
  };

  return (
    <div
      ref={editorRef}
      onClick={handleClick}
      style={{ outline: 'none', position: 'relative' }}
    >
      <textarea
        ref={textareaRef}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionUpdate={handleCompositionUpdate}
        onCompositionEnd={handleCompositionEnd}
        onInput={handleInput}
        style={{
          position: 'fixed',
          left: -9999,
          top: 0,
          width: 1,
          height: 1,
          opacity: 0,
          border: 'none',
          padding: 0,
          resize: 'none',
          outline: 'none',
          overflow: 'hidden',
        }}
        aria-hidden="true"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      <div style={pageStyle}>
        {state.paragraphs.map((para, pi) => (
          <EditableParagraph
            key={pi}
            paragraph={para}
            paraIndex={pi}
            cursor={state.cursor.paraIndex === pi ? state.cursor : null}
            composingText={state.cursor.paraIndex === pi ? composingText : ''}
          />
        ))}
      </div>
    </div>
  );
}

/** data 속성을 가진 조상 Element 찾기 */
function findAncestorWithData(node: Node, dataKey: string): HTMLElement | null {
  let current: Node | null = node;
  const attr = `data-${camelToKebab(dataKey)}`;
  while (current) {
    if (current instanceof HTMLElement && current.hasAttribute(attr)) {
      return current;
    }
    current = current.parentNode;
  }
  return null;
}

function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/** 런 element 내에서 텍스트 노드의 글로벌 오프셋 계산 */
function computeOffsetInRun(
  runElement: HTMLElement,
  targetTextNode: Node,
  clickOffset: number,
  run: import('../../lib/model').TextRun,
): number {
  const walker = document.createTreeWalker(runElement, NodeFilter.SHOW_TEXT);
  let offset = 0;
  let node: Node | null;

  while ((node = walker.nextNode())) {
    if (node === targetTextNode) {
      return offset + clickOffset;
    }
    offset += (node.textContent?.length ?? 0);
  }

  let total = 0;
  for (const c of run.contents) {
    if (c.type === 'text') total += c.value.length;
  }
  return total;
}
