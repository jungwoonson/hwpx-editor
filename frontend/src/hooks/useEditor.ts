import { useReducer, useCallback } from 'react';
import type { Paragraph } from '../lib/model';
import {
  editorReducer,
  createEmptyDocument,
  type EditorState,
  type EditorAction,
  type CursorPosition,
} from '../lib/editor/document';

export function useEditor() {
  const [state, dispatch] = useReducer(editorReducer, undefined, createEmptyDocument);

  const loadDocument = useCallback((paragraphs: Paragraph[]) => {
    dispatch({ type: 'SET_DOCUMENT', paragraphs });
  }, []);

  const moveCursor = useCallback((pos: CursorPosition) => {
    dispatch({ type: 'MOVE_CURSOR', pos });
  }, []);

  return { state, dispatch, loadDocument, moveCursor };
}

export type { EditorState, EditorAction, CursorPosition };
