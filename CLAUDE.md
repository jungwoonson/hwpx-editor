# HWPX Editor

## 개발 서버

- 프론트엔드 고정 포트: **3800** (`frontend/vite.config.ts`에 설정됨)
- 프론트엔드 dev server 시작: `cd frontend && npm run dev`

### 프론트엔드 재시작 절차

프론트엔드를 재시작해야 할 때 아래 절차를 따른다:

1. 포트 3800 사용 중인 프로세스 확인: `lsof -ti:3800`
2. 프로세스가 있으면 해당 프로세스의 명령어 확인: `ps -p <PID> -o command=`
3. **같은 프론트엔드 프로세스**(vite, node 등 `npm run dev` 관련)이면 → 바로 종료 후 재시작: `kill <PID> && npm run dev`
4. **다른 프로세스**이면 → 사용자에게 프로세스 정보(PID, 명령어)를 보여주며 "포트 3800을 [프로세스명] (PID: xxx)이 사용 중입니다. 종료해도 되나요?" 라고 확인 후 진행

## 렌더링 핵심 원칙: 하드코딩 금지, 규칙 기반 구현

모든 시각적 수치(높이, 너비, 여백, 줄간격, 폰트, 테두리 등)는 **HWPX 문서 데이터에서 파생**해야 한다. 임의의 매직넘버(`lineHeight: 1.3`, `width: '2em'`, `minHeight: '0.2em'` 등)를 사용하지 않는다.

**이유**:
- HWPX 문서는 문단마다, 셀마다, 런마다 서로 다른 스타일 값을 가짐 (예: 셀 내 줄간격 100%~160% 다양)
- 하드코딩하면 특정 문서에서는 맞아 보여도 다른 문서에서 깨짐
- 추후 에디터(수정 기능) 추가 시 스타일 변경이 정확히 반영되어야 함
- 표 안의 표, 중첩 구조에서도 동일한 규칙이 재귀적으로 작동해야 함

**구체적 규칙**:
- 치수 → HWPUNIT에서 변환 (96/7200 px/hwpunit)
- 줄간격 → paraShape.lineSpacing (PERCENT/FIXED/BETWEEN_LINES/AT_LEAST)
- 폰트 → charShape.fontRef → 2단계 해석 (명시적1 매핑 + 자동 분류 fallback). 매핑에 없는 폰트는 이름에서 종류 자동 감지 (바탕/명조→serif, 돋움/고딕→sans-serif)
- 테두리 → borderFill에서 서브픽셀로 변환, 완전 매핑 테이블 (14종)
- 문단은 최상위든 셀 내부든 동일한 ParagraphView 규칙 적용
- 이미지 → 브라우저 지원 포맷은 직접 렌더링. EMF/WMF 등 미지원 포맷은 변환 시도 → 실패 시 원본 크기 placeholder
- 객체 위치 → treatAsChar=true면 inline, false면 CSS absolute positioning
- 알 수 없는 요소 → 빈 공간으로 사라지지 않고 placeholder 표시 (크기/레이아웃 보존)

상세 규칙은 메모리 파일 `project_rendering_rules.md` 참조.

## HWP/HWPX Reference Documents

Markdown-converted reference documents for HWP/HWPX file formats. Always use these instead of the source PDFs in `docs/reference/` (original PDFs, no need to read).

| File | Description |
|------|-------------|
| [docs/hwp_5.0_format.md](docs/hwp_5.0_format.md) | HWP 5.0 binary file structure. Data types, storage/stream layout, data records (document info, body text, controls, objects) |
| [docs/hwpml_3.0_format.md](docs/hwpml_3.0_format.md) | HWP 3.0 binary structure + HWPML (XML-based) format. XML element/attribute spec |
| [docs/chart_format.md](docs/chart_format.md) | Chart object format. 63 chart objects (VtChart, Axis, Series, etc.) and 52 constant types |
| [docs/equation_format.md](docs/equation_format.md) | Equation editor format. Commands, font/symbol tables, functions, examples |
| [docs/distribution_format.md](docs/distribution_format.md) | Distribution document format. Data structure and AES-128 ECB encryption/decryption |
