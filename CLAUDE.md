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

## HWP/HWPX Reference Documents

Markdown-converted reference documents for HWP/HWPX file formats. Always use these instead of the source PDFs in `docs/reference/` (original PDFs, no need to read).

| File | Description |
|------|-------------|
| [docs/hwp_5.0_format.md](docs/hwp_5.0_format.md) | HWP 5.0 binary file structure. Data types, storage/stream layout, data records (document info, body text, controls, objects) |
| [docs/hwpml_3.0_format.md](docs/hwpml_3.0_format.md) | HWP 3.0 binary structure + HWPML (XML-based) format. XML element/attribute spec |
| [docs/chart_format.md](docs/chart_format.md) | Chart object format. 63 chart objects (VtChart, Axis, Series, etc.) and 52 constant types |
| [docs/equation_format.md](docs/equation_format.md) | Equation editor format. Commands, font/symbol tables, functions, examples |
| [docs/distribution_format.md](docs/distribution_format.md) | Distribution document format. Data structure and AES-128 ECB encryption/decryption |
