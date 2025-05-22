# Chladni Plate Simulation (클라드니 판 시뮬레이션)

실시간으로 변화하는 아름다운 클라드니 패턴을 웹 브라우저에서 탐색할 수 있는 시뮬레이터입니다. Rust (WebAssembly)를 사용하여 핵심 물리 연산을 수행하고, JavaScript와 HTML Canvas로 시각화합니다.

**✨ [라이브 데모 바로가기 (Live Demo)](https://jinyoung4478.github.io/cymatics/) ✨**

---

## 🌟 주요 기능

*   **동적 파티클 시뮬레이션**: 수많은 입자들이 특정 주파수와 진동판 모양에 따라 클라드니 패턴으로 점차 수렴하는 과정을 실시간으로 보여줍니다.
*   **파라미터 조절**: 클라드니 방정식의 주요 파라미터 (`n`, `m`, `a`, `b`)를 슬라이더로 직접 조절하며 패턴 변화를 즉시 확인할 수 있습니다.
*   **다양한 진동판 모양**: 정사각형, 원형, 직사각형(가로/세로), 정육각형 등 다양한 모양의 진동판을 선택하고 해당 모양에 맞는 패턴을 관찰할 수 있습니다.
*   **사용자 설정**: 입자 개수, 입자 이동 속도 등을 조절하여 시뮬레이션의 상세 설정을 변경할 수 있습니다.
*   **사전 설정된 패턴 (프리셋)**: 대표적인 클라드니 패턴을 프리셋으로 제공하여 쉽게 탐색할 수 있습니다.
*   **한국어 UI**: 모든 UI 텍스트와 설명이 한국어로 제공됩니다.
*   **테마 지원**: 밝은 모드와 어두운 모드를 모두 지원하며, 사용자의 선택은 로컬 저장소에 기억됩니다.
*   **반응형 디자인**: 데스크톱 및 모바일 환경 모두에서 최적화된 화면을 제공합니다.

---

## 🛠️ 기술 스택

*   **핵심 로직**:
    *   [Rust](https://www.rust-lang.org/)
    *   [WebAssembly (WASM)](https://webassembly.org/)
    *   `wasm-bindgen`: Rust와 JavaScript 간의 상호 운용성 제공
    *   `rand`: 파티클 초기화 및 미세 떨림 효과에 사용
    *   `getrandom` (js feature): WASM 환경에서의 랜덤 값 생성
    *   `console_error_panic_hook`: WASM 패닉 발생 시 브라우저 콘솔에 에러 메시지 표시
*   **프론트엔드**:
    *   HTML5
    *   CSS3
    *   JavaScript (ES6+)
*   **빌드 도구**:
    *   `wasm-pack`: Rust 코드를 WASM 패키지로 빌드
    *   `npm` (또는 `yarn`): 빌드 스크립트 실행
*   **배포**:
    *   GitHub Pages

---

## 📁 프로젝트 구조

```
cymatics/
├── .git/
├── .gitignore
├── docs/                     # GitHub Pages 배포용 디렉토리 (빌드 결과물)
│   ├── index.html
│   ├── main.js
│   ├── style.css
│   └── pkg/                  # 컴파일된 WASM 모듈 및 JS 바인딩
│       ├── rust_chladni_logic.js
│       └── rust_chladni_logic_bg.wasm
│       └── ...
├── rust_chladni_logic/       # Rust 라이브러리 (시뮬레이션 로직)
│   ├── src/
│   │   └── lib.rs            # 핵심 Rust 코드
│   ├── Cargo.toml
│   └── ...
├── web_chladni_ui/           # 웹 UI 관련 파일
│   ├── index.html            # 메인 HTML
│   ├── main.js               # UI 로직, WASM 연동, 렌더링
│   ├── style.css             # 스타일시트
│   └── package.json          # 빌드 스크립트 정의
└── README.md                 # 현재 파일
```

---

## 🚀 로컬 환경 설정 및 실행

1.  **필수 설치 항목**:
    *   Rust 및 `cargo` ([설치 가이드](https://www.rust-lang.org/tools/install))
    *   `wasm-pack` ([설치 가이드](https://rustwasm.github.io/wasm-pack/installer/))
    *   Node.js 및 `npm` (또는 `yarn`) ([설치 가이드](https://nodejs.org/))

2.  **저장소 클론**:
    ```bash
    git clone https://github.com/jinyoung4478/cymatics.git
    cd cymatics
    ```

3.  **WASM 빌드 및 웹 파일 준비**:
    `web_chladni_ui` 디렉토리에서 빌드 스크립트를 실행합니다. 이 스크립트는 Rust 코드를 WASM으로 컴파일하고, 필요한 모든 정적 파일을 프로젝트 루트의 `docs/` 폴더로 복사합니다.
    ```bash
    cd web_chladni_ui
    npm run build
    cd .. 
    ```
    (또는 `yarn build` 사용 가능)

4.  **로컬 웹 서버 실행**:
    프로젝트 루트 디렉토리(`cymatics/`)에서 `docs/` 폴더를 기준으로 웹 서버를 실행합니다. Python의 `http.server`를 사용하는 예시는 다음과 같습니다:
    ```bash
    python3 -m http.server 8000 --directory docs
    ```
    (다른 로컬 서버 도구 사용 가능. 예: VS Code Live Server 확장 - `docs/index.html` 대상)

5.  **브라우저에서 확인**:
    웹 브라우저를 열고 `http://localhost:8000` (또는 설정한 포트 번호)으로 접속합니다.

---

## 📦 빌드 및 배포

*   **빌드**: `web_chladni_ui` 디렉토리에서 `npm run build` 명령을 실행하면, GitHub Pages 배포에 필요한 모든 파일이 `docs/` 폴더에 준비됩니다.
*   **배포**: 이 프로젝트는 `docs/` 폴더의 내용을 GitHub Pages를 통해 자동으로 배포하도록 설정되어 있습니다. `main` 브랜치에 변경사항 (특히 `docs/` 폴더의 업데이트 내용)이 푸시되면 GitHub Actions (또는 GitHub Pages의 기본 빌드 프로세스)에 의해 사이트가 업데이트됩니다.

---

## 🙏 기여하기 (Contributing)

버그 리포트, 기능 제안, 코드 개선 등 모든 종류의 기여를 환영합니다! 이슈를 생성하거나 풀 리퀘스트를 보내주세요.

---

## 📜 라이선스 (License)

이 프로젝트는 별도의 라이선스가 명시되어 있지 않습니다.
(추후 원하는 라이선스를 명시할 수 있습니다. 예: MIT License) 