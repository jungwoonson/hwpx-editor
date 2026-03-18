# HWPX Editor

HWPX(한글 문서) 파일을 웹 브라우저에서 보고 편집할 수 있는 순수 구현 뷰어/에디터입니다.
외부 라이브러리(한컴 SDK 등) 없이 HWPX 파일 형식을 직접 파싱하고 렌더링합니다.

## 기술 스택

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **ZIP 해제**: fflate (순수 JS)
- **XML 파싱**: fast-xml-parser
- **테스트**: Vitest + @testing-library/react

## 실행

```bash
cd frontend
npm install
npm run dev
```

http://localhost:5173 에서 HWPX 파일을 드래그 앤 드롭하면 문서가 렌더링됩니다.

## 현재 구현 상태

### 완료

- [x] HWPX ZIP 해제 + XML 파싱 (section, header, content.hpf)
- [x] 텍스트/문단 렌더링 (폰트, 크기, 굵기, 기울임, 색상, 밑줄)
- [x] 표(Table) 렌더링 (행/열 병합, colgroup 열 너비)
- [x] BorderFill 스타일 적용 (셀 배경색, 테두리 두께/종류)
- [x] 이미지 렌더링 (BinData → Blob URL, 도장/그림 표시)
- [x] 셀 높이/정렬 개선 (lineHeight 축소, vertAlign, wordBreak)
- [x] 페이지 구분 (A4 용지 스타일, 페이지 간 간격)

### 남은 작업

- [ ] **문단 테두리/배경**: paraPr의 borderFill 적용 (굵은 검정 바, 회색 배경 박스)
- [ ] **셀 세로 가운데 정렬**: 행 병합된 셀(기업현황, 소재지 등) vertAlign: middle 정확 적용
- [ ] **텍스트 정렬**: 셀 내 가운데/오른쪽 정렬 (paraPr align 반영)
- [ ] **특수문자 간격**: FWSPACE 폭 조정, 탭 위치 정확도
- [ ] **페이지 분리 고도화**: 표가 넘치면 다음 페이지로 분할
- [ ] **가상 스크롤**: 수백 페이지 문서 성능 최적화
- [ ] **Web Worker**: 파싱을 백그라운드 스레드로 분리
- [ ] **한글 폰트 폴백**: 한컴 전용 폰트 → 웹 폰트 매핑 테이블 확장
- [ ] **에디터 (Phase 2)**: 텍스트 편집, 문단/표 수정, HWPX 저장

## 프로젝트 구조

```
frontend/
├── src/
│   ├── components/viewer/   # 뷰어 컴포넌트 (PageView, TableView, TextRunView 등)
│   ├── lib/
│   │   ├── model/           # 데이터 모델 (Paragraph, Table, ImageObject 등)
│   │   └── hwpx/            # HWPX 파서 (section-parser, header-parser 등)
│   └── utils/               # 유틸리티 (unit-converter, xml-helpers)
docs/
├── reference/               # HWP/HWPX 형식 참조 PDF
├── hwp_5.0_format.md        # HWP 5.0 바이너리 형식 (마크다운)
├── hwpml_3.0_format.md      # HWPML XML 형식 (마크다운)
└── hwpx-actual-structure.md # HWPX 실측 분석 결과
```

## 샘플 파일

`docs/sample/` 디렉토리에 테스트용 HWPX 파일을 넣어서 사용합니다 (git 추적 제외).
