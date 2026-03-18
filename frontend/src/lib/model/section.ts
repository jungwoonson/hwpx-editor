import type { Paragraph } from './paragraph';

/** 구역 (hs:sec / section*.xml) */
export interface Section {
  pageLayout: PageLayout;
  paragraphs: Paragraph[];
}

/** 용지 설정 (hp:pagePr + hp:margin) */
export interface PageLayout {
  width: number; // hwpunit (A4 = 59528)
  height: number; // hwpunit (A4 = 84188)
  landscape: string; // WIDELY = 가로, NARROWLY = 세로
  gutterType: string;
  margin: PageMargin;
}

export interface PageMargin {
  left: number;
  right: number;
  top: number;
  bottom: number;
  header: number;
  footer: number;
  gutter: number;
}
