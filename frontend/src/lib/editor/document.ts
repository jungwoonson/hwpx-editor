import type { Paragraph, TextRun, RunContent } from '../model';

/** 커서 위치 */
export interface CursorPosition {
  paraIndex: number;
  runIndex: number;
  offset: number; // 런 내 텍스트 오프셋
}

/** 에디터 상태 */
export interface EditorState {
  paragraphs: Paragraph[];
  cursor: CursorPosition;
}

/** 에디터 액션 */
export type EditorAction =
  | { type: 'INSERT_TEXT'; char: string }
  | { type: 'DELETE_BACKWARD' }
  | { type: 'DELETE_FORWARD' }
  | { type: 'SPLIT_PARAGRAPH' }
  | { type: 'MOVE_CURSOR'; pos: CursorPosition }
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'SET_DOCUMENT'; paragraphs: Paragraph[] };

/** 런의 전체 텍스트 길이 계산 */
function getRunTextLength(run: TextRun): number {
  let len = 0;
  for (const c of run.contents) {
    if (c.type === 'text') len += c.value.length;
  }
  return len;
}

/** 문단의 전체 텍스트 길이 계산 */
function getParaTextLength(para: Paragraph): number {
  let len = 0;
  for (const run of para.runs) {
    len += getRunTextLength(run);
  }
  return len;
}

/** 런 내 offset 위치에서 텍스트 RunContent의 인덱스와 내부 offset 찾기 */
function findContentOffset(run: TextRun, offset: number): { contentIndex: number; innerOffset: number } {
  let remaining = offset;
  for (let i = 0; i < run.contents.length; i++) {
    const c = run.contents[i];
    if (c.type === 'text') {
      if (remaining <= c.value.length) {
        return { contentIndex: i, innerOffset: remaining };
      }
      remaining -= c.value.length;
    }
  }
  // offset이 끝을 넘으면 마지막 위치
  const lastTextIdx = run.contents.findLastIndex(c => c.type === 'text');
  if (lastTextIdx >= 0) {
    const last = run.contents[lastTextIdx];
    return { contentIndex: lastTextIdx, innerOffset: last.type === 'text' ? last.value.length : 0 };
  }
  return { contentIndex: 0, innerOffset: 0 };
}

/** 런의 contents를 깊은 복사 */
function cloneContents(contents: RunContent[]): RunContent[] {
  return contents.map(c => ({ ...c }));
}

/** 런을 깊은 복사 */
function cloneRun(run: TextRun): TextRun {
  return { charPrIDRef: run.charPrIDRef, contents: cloneContents(run.contents) };
}

/** 문단을 깊은 복사 */
function cloneParagraph(para: Paragraph): Paragraph {
  return {
    ...para,
    runs: para.runs.map(cloneRun),
  };
}

/** INSERT_TEXT: 커서 위치에 문자 삽입 */
function insertText(state: EditorState, char: string): EditorState {
  const { cursor } = state;
  const paragraphs = state.paragraphs.map(cloneParagraph);
  const para = paragraphs[cursor.paraIndex];
  if (!para) return state;

  const run = para.runs[cursor.runIndex];
  if (!run) return state;

  const { contentIndex, innerOffset } = findContentOffset(run, cursor.offset);
  const content = run.contents[contentIndex];

  if (content && content.type === 'text') {
    // 기존 텍스트 content에 삽입
    content.value = content.value.slice(0, innerOffset) + char + content.value.slice(innerOffset);
  } else {
    // 텍스트 content가 없으면 새로 생성
    run.contents.splice(contentIndex, 0, { type: 'text', value: char });
  }

  return {
    paragraphs,
    cursor: { ...cursor, offset: cursor.offset + char.length },
  };
}

/** DELETE_BACKWARD: 커서 앞의 문자 삭제 (Backspace) */
function deleteBackward(state: EditorState): EditorState {
  const { cursor } = state;
  const paragraphs = state.paragraphs.map(cloneParagraph);

  if (cursor.offset > 0) {
    // 현재 런 내에서 삭제
    const run = paragraphs[cursor.paraIndex].runs[cursor.runIndex];
    const { contentIndex, innerOffset } = findContentOffset(run, cursor.offset);
    const content = run.contents[contentIndex];

    if (content && content.type === 'text' && innerOffset > 0) {
      content.value = content.value.slice(0, innerOffset - 1) + content.value.slice(innerOffset);
      // 빈 텍스트 content 제거
      if (content.value === '') {
        run.contents.splice(contentIndex, 1);
        if (run.contents.length === 0) {
          run.contents.push({ type: 'text', value: '' });
        }
      }
    }

    return {
      paragraphs,
      cursor: { ...cursor, offset: cursor.offset - 1 },
    };
  }

  if (cursor.runIndex > 0) {
    // 이전 런의 끝으로 이동 후 다음 턴에서 삭제 (이 경우는 런 경계)
    const prevRun = paragraphs[cursor.paraIndex].runs[cursor.runIndex - 1];
    const prevLen = getRunTextLength(prevRun);
    return {
      paragraphs,
      cursor: { ...cursor, runIndex: cursor.runIndex - 1, offset: prevLen },
    };
  }

  if (cursor.paraIndex > 0) {
    // 이전 문단과 병합
    const prevPara = paragraphs[cursor.paraIndex - 1];
    const currPara = paragraphs[cursor.paraIndex];
    const prevLastRunIndex = prevPara.runs.length - 1;
    const prevLastRunLen = getRunTextLength(prevPara.runs[prevLastRunIndex]);

    // 현재 문단의 런들을 이전 문단에 추가
    prevPara.runs = [...prevPara.runs, ...currPara.runs];
    paragraphs.splice(cursor.paraIndex, 1);

    return {
      paragraphs,
      cursor: {
        paraIndex: cursor.paraIndex - 1,
        runIndex: prevLastRunIndex,
        offset: prevLastRunLen,
      },
    };
  }

  return state;
}

/** DELETE_FORWARD: 커서 뒤의 문자 삭제 (Delete) */
function deleteForward(state: EditorState): EditorState {
  const { cursor } = state;
  const paragraphs = state.paragraphs.map(cloneParagraph);
  const para = paragraphs[cursor.paraIndex];
  if (!para) return state;

  const run = para.runs[cursor.runIndex];
  const runLen = getRunTextLength(run);

  if (cursor.offset < runLen) {
    // 현재 런 내에서 삭제
    const { contentIndex, innerOffset } = findContentOffset(run, cursor.offset);
    const content = run.contents[contentIndex];

    if (content && content.type === 'text' && innerOffset < content.value.length) {
      content.value = content.value.slice(0, innerOffset) + content.value.slice(innerOffset + 1);
      if (content.value === '') {
        run.contents.splice(contentIndex, 1);
        if (run.contents.length === 0) {
          run.contents.push({ type: 'text', value: '' });
        }
      }
    }

    return { paragraphs, cursor };
  }

  if (cursor.runIndex < para.runs.length - 1) {
    // 다음 런의 시작으로 이동
    return {
      paragraphs,
      cursor: { ...cursor, runIndex: cursor.runIndex + 1, offset: 0 },
    };
  }

  if (cursor.paraIndex < paragraphs.length - 1) {
    // 다음 문단을 현재 문단에 병합
    const nextPara = paragraphs[cursor.paraIndex + 1];
    para.runs = [...para.runs, ...nextPara.runs];
    paragraphs.splice(cursor.paraIndex + 1, 1);
    return { paragraphs, cursor };
  }

  return state;
}

/** SPLIT_PARAGRAPH: Enter 키 — 현재 커서 위치에서 문단 분할 */
function splitParagraph(state: EditorState): EditorState {
  const { cursor } = state;
  const paragraphs = state.paragraphs.map(cloneParagraph);
  const para = paragraphs[cursor.paraIndex];
  if (!para) return state;

  const run = para.runs[cursor.runIndex];
  const { contentIndex, innerOffset } = findContentOffset(run, cursor.offset);
  const content = run.contents[contentIndex];

  // 현재 런을 분할
  let beforeContents: RunContent[];
  let afterContents: RunContent[];

  if (content && content.type === 'text') {
    const beforeText = content.value.slice(0, innerOffset);
    const afterText = content.value.slice(innerOffset);

    beforeContents = [
      ...run.contents.slice(0, contentIndex),
      ...(beforeText ? [{ type: 'text' as const, value: beforeText }] : []),
    ];
    afterContents = [
      ...(afterText ? [{ type: 'text' as const, value: afterText }] : []),
      ...cloneContents(run.contents.slice(contentIndex + 1)),
    ];
  } else {
    beforeContents = cloneContents(run.contents.slice(0, contentIndex));
    afterContents = cloneContents(run.contents.slice(contentIndex));
  }

  // 빈 contents 방지
  if (beforeContents.length === 0) beforeContents = [{ type: 'text', value: '' }];
  if (afterContents.length === 0) afterContents = [{ type: 'text', value: '' }];

  // 현재 문단: 분할 전 부분 (현재 런까지 + 분할된 앞부분)
  const beforeRuns: TextRun[] = [
    ...para.runs.slice(0, cursor.runIndex),
    { charPrIDRef: run.charPrIDRef, contents: beforeContents },
  ];

  // 새 문단: 분할 후 부분 (분할된 뒷부분 + 나머지 런들)
  const afterRuns: TextRun[] = [
    { charPrIDRef: run.charPrIDRef, contents: afterContents },
    ...para.runs.slice(cursor.runIndex + 1).map(cloneRun),
  ];

  // 현재 문단 업데이트
  para.runs = beforeRuns;

  // 새 문단 생성 (같은 스타일 유지)
  const newPara: Paragraph = {
    id: Date.now(),
    paraPrIDRef: para.paraPrIDRef,
    styleIDRef: para.styleIDRef,
    pageBreak: false,
    columnBreak: false,
    runs: afterRuns,
  };

  paragraphs.splice(cursor.paraIndex + 1, 0, newPara);

  return {
    paragraphs,
    cursor: {
      paraIndex: cursor.paraIndex + 1,
      runIndex: 0,
      offset: 0,
    },
  };
}

/** MOVE_LEFT: 커서를 한 글자 왼쪽으로 */
function moveLeft(state: EditorState): EditorState {
  const { cursor, paragraphs } = state;

  if (cursor.offset > 0) {
    return { paragraphs, cursor: { ...cursor, offset: cursor.offset - 1 } };
  }

  if (cursor.runIndex > 0) {
    const prevRun = paragraphs[cursor.paraIndex].runs[cursor.runIndex - 1];
    return {
      paragraphs,
      cursor: { ...cursor, runIndex: cursor.runIndex - 1, offset: getRunTextLength(prevRun) },
    };
  }

  if (cursor.paraIndex > 0) {
    const prevPara = paragraphs[cursor.paraIndex - 1];
    const lastRunIndex = prevPara.runs.length - 1;
    return {
      paragraphs,
      cursor: {
        paraIndex: cursor.paraIndex - 1,
        runIndex: lastRunIndex,
        offset: getRunTextLength(prevPara.runs[lastRunIndex]),
      },
    };
  }

  return state;
}

/** MOVE_RIGHT: 커서를 한 글자 오른쪽으로 */
function moveRight(state: EditorState): EditorState {
  const { cursor, paragraphs } = state;
  const para = paragraphs[cursor.paraIndex];
  if (!para) return state;

  const run = para.runs[cursor.runIndex];
  const runLen = getRunTextLength(run);

  if (cursor.offset < runLen) {
    return { paragraphs, cursor: { ...cursor, offset: cursor.offset + 1 } };
  }

  if (cursor.runIndex < para.runs.length - 1) {
    return {
      paragraphs,
      cursor: { ...cursor, runIndex: cursor.runIndex + 1, offset: 0 },
    };
  }

  if (cursor.paraIndex < paragraphs.length - 1) {
    return {
      paragraphs,
      cursor: { paraIndex: cursor.paraIndex + 1, runIndex: 0, offset: 0 },
    };
  }

  return state;
}

/** 에디터 리듀서 */
export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'INSERT_TEXT':
      return insertText(state, action.char);
    case 'DELETE_BACKWARD':
      return deleteBackward(state);
    case 'DELETE_FORWARD':
      return deleteForward(state);
    case 'SPLIT_PARAGRAPH':
      return splitParagraph(state);
    case 'MOVE_CURSOR':
      return { ...state, cursor: action.pos };
    case 'MOVE_LEFT':
      return moveLeft(state);
    case 'MOVE_RIGHT':
      return moveRight(state);
    case 'SET_DOCUMENT': {
      const paragraphs = action.paragraphs.length > 0
        ? action.paragraphs
        : createEmptyDocument().paragraphs;
      return {
        paragraphs,
        cursor: { paraIndex: 0, runIndex: 0, offset: 0 },
      };
    }
    default:
      return state;
  }
}

/** 빈 문서 초기 상태 생성 */
export function createEmptyDocument(): EditorState {
  const emptyParagraph: Paragraph = {
    id: 0,
    paraPrIDRef: 0,
    styleIDRef: 0,
    pageBreak: false,
    columnBreak: false,
    runs: [{
      charPrIDRef: 0,
      contents: [{ type: 'text', value: '' }],
    }],
  };

  return {
    paragraphs: [emptyParagraph],
    cursor: { paraIndex: 0, runIndex: 0, offset: 0 },
  };
}
