// ============================================================
// DialogSystem.js — 대화창, 선택지, 타이핑 연출
// scripts.js에서 대사 데이터를 받아 화면에 표시
// 대사 하드코딩 금지 — 모든 텍스트는 외부에서 주입
// ============================================================

import { NPC_EMOJI } from '../data/scripts.js';

/** 대화창 UI 설정 */
const DIALOG_CONFIG = {
  // 대화창 위치/크기
  BOX_X: 80,
  BOX_Y: 520,
  BOX_W: 1120,
  BOX_H: 170,
  BOX_RADIUS: 12,

  // 색상
  BG_COLOR: 0x000000,
  BG_ALPHA: 0.5,
  BORDER_COLOR: 0xffffff,
  BORDER_ALPHA: 0.15,
  NAME_COLOR: '#FFD700',
  TEXT_COLOR: '#ffffff',
  ITALIC_COLOR: '#cccccc',
  HINT_COLOR: '#888888',
  CHOICE_BG: 0x222244,
  CHOICE_HOVER_BORDER: 0xFFD700,

  // 타이핑 속도 (ms/글자)
  TYPING_SPEED: 35,

  // 커서 깜빡임 주기 (ms)
  CURSOR_BLINK: 500,

  // 텍스트 여백
  PAD_X: 24,
  PAD_Y: 16,
  NAME_SIZE: '18px',
  TEXT_SIZE: '16px',
  HINT_SIZE: '14px',
  CHOICE_SIZE: '15px',
};

export default class DialogSystem {
  /**
   * @param {Phaser.Scene} scene — 대화창을 표시할 씬
   */
  constructor(scene) {
    /** 소속 씬 */
    this.scene = scene;

    /** 대화 진행 중 여부 */
    this.isActive = false;

    /** 현재 대사 배열 */
    this.lines = [];

    /** 현재 대사 인덱스 */
    this.lineIndex = 0;

    /** 타이핑 진행 중 여부 */
    this.isTyping = false;

    /** 현재 표시할 전체 텍스트 */
    this.fullText = '';

    /** 현재까지 표시된 글자 수 */
    this.charIndex = 0;

    /** 타이핑 타이머 */
    this.typingTimer = null;

    /** 커서 깜빡임 타이머 */
    this.cursorTimer = null;

    /** 커서 표시 상태 */
    this.cursorVisible = true;

    /** 선택지 콜백 */
    this.choiceCallback = null;

    /** 대화 완료 콜백 */
    this.onComplete = null;

    // UI 요소들
    this.container = null;
    this.bgGraphics = null;
    this.nameText = null;
    this.bodyText = null;
    this.hintText = null;

    /** 선택지 시각 요소 (container 내 그래픽/텍스트) */
    this.choiceButtons = [];

    /** 선택지 히트 영역 (씬 레벨, container 밖) */
    this._choiceZones = [];

    /** 현재 선택지 메타데이터 [{label, rect}] */
    this._choiceRects = [];

    /** 현재 호버 중인 버튼 인덱스 */
    this._hoveredIndex = -1;

    // UI 생성
    this._createUI();

    // 입력 바인딩
    this._bindInput();
  }

  /** 대화창 UI 요소 생성 (숨긴 상태) */
  _createUI() {
    const c = DIALOG_CONFIG;
    const scene = this.scene;

    // 컨테이너 (depth 높게 설정)
    this.container = scene.add.container(0, 0).setDepth(1000).setVisible(false);

    // 반투명 배경 박스
    this.bgGraphics = scene.add.graphics();
    this.bgGraphics.fillStyle(c.BG_COLOR, c.BG_ALPHA);
    this.bgGraphics.fillRoundedRect(c.BOX_X, c.BOX_Y, c.BOX_W, c.BOX_H, c.BOX_RADIUS);
    this.bgGraphics.lineStyle(1, c.BORDER_COLOR, c.BORDER_ALPHA);
    this.bgGraphics.strokeRoundedRect(c.BOX_X, c.BOX_Y, c.BOX_W, c.BOX_H, c.BOX_RADIUS);
    this.container.add(this.bgGraphics);

    // NPC 이름 텍스트 (상단)
    this.nameText = scene.add.text(
      c.BOX_X + c.PAD_X,
      c.BOX_Y + c.PAD_Y,
      '',
      { fontSize: c.NAME_SIZE, fontFamily: 'sans-serif', color: c.NAME_COLOR, fontStyle: 'bold' }
    );
    this.container.add(this.nameText);

    // 대사 본문 텍스트 (중단)
    this.bodyText = scene.add.text(
      c.BOX_X + c.PAD_X,
      c.BOX_Y + c.PAD_Y + 30,
      '',
      {
        fontSize: c.TEXT_SIZE,
        fontFamily: 'sans-serif',
        color: c.TEXT_COLOR,
        wordWrap: { width: c.BOX_W - c.PAD_X * 2 - 20 },
        lineSpacing: 4,
      }
    );
    this.container.add(this.bodyText);

    // 진행 안내 텍스트 (하단)
    this.hintText = scene.add.text(
      c.BOX_X + c.BOX_W - c.PAD_X,
      c.BOX_Y + c.BOX_H - c.PAD_Y,
      '클릭 또는 SPACE로 진행 ▶',
      { fontSize: c.HINT_SIZE, fontFamily: 'sans-serif', color: c.HINT_COLOR }
    ).setOrigin(1, 1);
    this.container.add(this.hintText);

    // 대화창 클릭 영역 (투명 히트박스)
    const hitZone = scene.add.zone(
      c.BOX_X + c.BOX_W / 2,
      c.BOX_Y + c.BOX_H / 2,
      c.BOX_W,
      c.BOX_H
    ).setInteractive({ useHandCursor: true });
    hitZone.on('pointerdown', () => this._onAdvance());
    this.container.add(hitZone);
  }

  /** 키보드/마우스 입력 바인딩 */
  _bindInput() {
    const kb = this.scene.input.keyboard;

    // 스페이스바 — 대사 진행
    this.spaceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      if (this.isActive) this._onAdvance();
    });

    // ── 선택지 키보드 입력 (숫자키 1/2/3) ──
    const numCodes = [
      Phaser.Input.Keyboard.KeyCodes.ONE,
      Phaser.Input.Keyboard.KeyCodes.TWO,
      Phaser.Input.Keyboard.KeyCodes.THREE,
    ];
    numCodes.forEach((code, i) => {
      const key = kb.addKey(code);
      key.on('down', () => this._selectChoiceByIndex(i));
    });

    // A/B/C 키는 WASD 이동과 충돌하므로 사용하지 않음

    // ESC 키는 GameScene update 루프에서 JustDown으로 처리

    // ── 숫자키 4, 5 추가 (FAQ 5개 선택지용) ──
    const extraNumCodes = [
      Phaser.Input.Keyboard.KeyCodes.FOUR,
      Phaser.Input.Keyboard.KeyCodes.FIVE,
    ];
    extraNumCodes.forEach((code, i) => {
      const key = kb.addKey(code);
      key.on('down', () => this._selectChoiceByIndex(i + 3));
    });

    // ── 씬 레벨 포인터 이벤트 (선택지 클릭/호버) ──
    this.scene.input.on('pointerdown', (pointer) => {
      this._handleChoiceClick(pointer);
    });
    this.scene.input.on('pointermove', (pointer) => {
      this._handleChoiceHover(pointer);
    });
  }

  // ─────────────────────────────────────────────────────────
  // 공개 API
  // ─────────────────────────────────────────────────────────

  /**
   * 대사 배열 재생 시작
   * @param {Array} lines — scripts.js 대사 배열
   * @param {Function} [onComplete] — 모든 대사 완료 시 콜백
   */
  startDialog(lines, onComplete) {
    if (!lines || lines.length === 0) return;

    this.lines = lines;
    this.lineIndex = 0;
    this.onComplete = onComplete || null;
    this.isActive = true;
    this.container.setVisible(true);
    this._clearChoices();
    this._showLine(this.lines[this.lineIndex]);
  }

  /**
   * 선택지 표시
   * @param {Array} choices — [{ label, text }]
   * @param {Function} callback — (선택된 label) => void
   * @param {Object} [questionLine] — 선택지 위에 표시할 질문 대사 (선택)
   */
  showChoices(choices, callback, questionLine) {
    this.isActive = true;
    this.container.setVisible(true);
    this._stopTyping();

    this.choiceCallback = callback;
    this.hintText.setVisible(false);
    this._clearChoices();

    const c = DIALOG_CONFIG;
    const count = choices.length;

    // ── 레이아웃 계산 ──
    const NAME_H   = 40;   // NPC 이름 영역
    const BODY_H   = questionLine ? 40 : 0;  // 질문 텍스트 영역
    const BTN_H    = 36;   // 버튼 높이
    const BTN_GAP  = 4;    // 버튼 간격
    const PAD      = 12;   // 상하 여백
    const BOX_H    = NAME_H + BODY_H + count * BTN_H + (count - 1) * BTN_GAP + PAD * 2;
    const BOX_Y    = 720 - BOX_H;  // 화면 하단에 딱 맞추기
    const BTN_W    = 1040; // 버튼 너비
    const BTN_X    = c.BOX_X + (c.BOX_W - BTN_W) / 2; // 화면 중앙 정렬

    // ── 배경 박스 재그리기 ──
    this.bgGraphics.clear();
    this.bgGraphics.fillStyle(c.BG_COLOR, c.BG_ALPHA);
    this.bgGraphics.fillRoundedRect(c.BOX_X, BOX_Y, c.BOX_W, BOX_H, c.BOX_RADIUS);
    this.bgGraphics.lineStyle(1, c.BORDER_COLOR, c.BORDER_ALPHA);
    this.bgGraphics.strokeRoundedRect(c.BOX_X, BOX_Y, c.BOX_W, BOX_H, c.BOX_RADIUS);

    // ── NPC 이름 표시 ──
    if (questionLine) {
      const emoji = NPC_EMOJI[questionLine.speaker] || '';
      const nameStr = emoji ? `${emoji}  ${questionLine.name}` : (questionLine.name || '');
      this.nameText.setText(nameStr);
      this.nameText.setStyle({
        fontSize: c.NAME_SIZE, fontFamily: 'sans-serif',
        color: c.NAME_COLOR, fontStyle: 'bold',
      });
      this.nameText.setY(BOX_Y + PAD);

      this.bodyText.setText(questionLine.text || '');
      this.bodyText.setStyle({
        fontSize: c.TEXT_SIZE, fontFamily: 'sans-serif',
        color: c.TEXT_COLOR, fontStyle: 'normal',
        wordWrap: { width: c.BOX_W - c.PAD_X * 2 - 20 }, lineSpacing: 4,
      });
      this.bodyText.setY(BOX_Y + PAD + NAME_H);
    } else {
      this.nameText.setText('');
      this.bodyText.setText('');
    }

    // ── 선택지 버튼 생성 ──
    const startY = BOX_Y + PAD + NAME_H + BODY_H;

    choices.forEach((choice, i) => {
      const btnY = startY + i * (BTN_H + BTN_GAP);

      // 버튼 배경
      const btnBg = this.scene.add.graphics();
      this._drawChoiceBg(btnBg, BTN_X, btnY, BTN_W, BTN_H, false);

      // 버튼 텍스트 (세로 중앙 정렬)
      const btnText = this.scene.add.text(
        BTN_X + 14,
        btnY + (BTN_H - 16) / 2,
        `${i + 1}. ${choice.text}`,
        { fontSize: '14px', fontFamily: 'sans-serif', color: '#ffffff' }
      );

      this.container.add([btnBg, btnText]);
      this.choiceButtons.push({ bg: btnBg, text: btnText });

      // 히트 영역 메타데이터
      this._choiceRects.push({
        x: BTN_X,
        y: btnY,
        w: BTN_W,
        h: BTN_H,
        label: choice.label,
        index: i,
      });
    });
  }

  /** 대화창 닫기 */
  close() {
    this.isActive = false;
    this.container.setVisible(false);
    this._stopTyping();
    this._clearChoices();
    this.lines = [];
    this.lineIndex = 0;
  }

  /**
   * 대화창 강제 종료 (콜백 실행 안 함, 상태만 정리)
   * ESC 종료 후 종료 대사를 새로 시작하기 위해 사용
   */
  forceClose() {
    this.isActive = false;
    this.container.setVisible(false);
    this._stopTyping();
    this._clearChoices();
    this.lines = [];
    this.lineIndex = 0;
    this.onComplete = null;
    this.choiceCallback = null;
  }

  // ─────────────────────────────────────────────────────────
  // 선택지 입력 처리 (씬 레벨)
  // ─────────────────────────────────────────────────────────

  /** 키보드 숫자/문자키로 선택지 선택 */
  _selectChoiceByIndex(index) {
    // 선택지가 없거나 대화 중이 아니면 무시
    if (!this.isActive || this._choiceRects.length === 0) return;
    if (index >= this._choiceRects.length) return;

    const rect = this._choiceRects[index];
    this._onChoiceSelect(rect.label);
  }

  /** 씬 레벨 포인터 클릭 → 선택지 히트 판정 */
  _handleChoiceClick(pointer) {
    if (!this.isActive || this._choiceRects.length === 0) return;

    for (const rect of this._choiceRects) {
      if (pointer.x >= rect.x && pointer.x <= rect.x + rect.w &&
          pointer.y >= rect.y && pointer.y <= rect.y + rect.h) {
        this._onChoiceSelect(rect.label);
        return;
      }
    }
  }

  /** 씬 레벨 포인터 이동 → 선택지 호버 효과 */
  _handleChoiceHover(pointer) {
    if (!this.isActive || this._choiceRects.length === 0) return;

    const c = DIALOG_CONFIG;
    let newHovered = -1;

    for (let i = 0; i < this._choiceRects.length; i++) {
      const rect = this._choiceRects[i];
      if (pointer.x >= rect.x && pointer.x <= rect.x + rect.w &&
          pointer.y >= rect.y && pointer.y <= rect.y + rect.h) {
        newHovered = i;
        break;
      }
    }

    // 호버 상태 변화 시에만 다시 그리기
    if (newHovered !== this._hoveredIndex) {
      // 이전 호버 해제
      if (this._hoveredIndex >= 0 && this._hoveredIndex < this.choiceButtons.length) {
        const prev = this.choiceButtons[this._hoveredIndex];
        const prevRect = this._choiceRects[this._hoveredIndex];
        this._drawChoiceBg(prev.bg, prevRect.x, prevRect.y, prevRect.w, prevRect.h, false);
      }
      // 새 호버 적용
      if (newHovered >= 0 && newHovered < this.choiceButtons.length) {
        const curr = this.choiceButtons[newHovered];
        const currRect = this._choiceRects[newHovered];
        this._drawChoiceBg(curr.bg, currRect.x, currRect.y, currRect.w, currRect.h, true);
      }
      this._hoveredIndex = newHovered;
    }
  }

  /** 선택지 버튼 배경 그리기 (호버 여부에 따라 스타일 변경) */
  _drawChoiceBg(graphics, x, y, w, h, hovered) {
    const c = DIALOG_CONFIG;
    graphics.clear();
    graphics.fillStyle(c.CHOICE_BG, hovered ? 0.9 : 0.8);
    graphics.fillRoundedRect(x, y, w, h, 6);
    if (hovered) {
      graphics.lineStyle(2, c.CHOICE_HOVER_BORDER, 1);
    } else {
      graphics.lineStyle(1, 0xffffff, 0.2);
    }
    graphics.strokeRoundedRect(x, y, w, h, 6);
  }

  // ─────────────────────────────────────────────────────────
  // 내부 메서드
  // ─────────────────────────────────────────────────────────

  /** 한 줄 대사 표시 */
  _showLine(line) {
    if (!line) return;

    const c = DIALOG_CONFIG;

    // showScreen 이벤트 처리 (전체화면 이미지 표시)
    if (line.showScreen) {
      this._showScreenImage(line.showScreen);
      return;
    }

    // 이름 표시 (독백이면 비우기, 시스템이면 [시스템])
    const emoji = NPC_EMOJI[line.speaker] || '';
    if (line.speaker === 'dotori' && line.italic) {
      // 도토리 독백: 이름 없이 이탤릭
      this.nameText.setText('');
      this.bodyText.setStyle({
        fontSize: c.TEXT_SIZE,
        fontFamily: 'sans-serif',
        color: c.ITALIC_COLOR,
        fontStyle: 'italic',
        wordWrap: { width: c.BOX_W - c.PAD_X * 2 - 20 },
        lineSpacing: 4,
      });
      this.bodyText.setY(c.BOX_Y + c.PAD_Y + 14);
    } else if (line.speaker === 'system') {
      // 시스템 메시지
      this.nameText.setText(line.name || '[시스템]');
      this.nameText.setStyle({
        fontSize: c.NAME_SIZE, fontFamily: 'sans-serif',
        color: '#aaaaaa', fontStyle: 'italic',
      });
      this.bodyText.setStyle({
        fontSize: c.TEXT_SIZE,
        fontFamily: 'sans-serif',
        color: line.italic ? c.ITALIC_COLOR : c.TEXT_COLOR,
        fontStyle: line.italic ? 'italic' : 'normal',
        wordWrap: { width: c.BOX_W - c.PAD_X * 2 - 20 },
        lineSpacing: 4,
      });
      this.bodyText.setY(c.BOX_Y + c.PAD_Y + 30);
    } else {
      // 일반 NPC 대사
      const nameStr = emoji ? `${emoji}  ${line.name}` : line.name;
      this.nameText.setText(nameStr);
      this.nameText.setStyle({
        fontSize: c.NAME_SIZE, fontFamily: 'sans-serif',
        color: c.NAME_COLOR, fontStyle: 'bold',
      });
      this.bodyText.setStyle({
        fontSize: c.TEXT_SIZE,
        fontFamily: 'sans-serif',
        color: c.TEXT_COLOR,
        fontStyle: 'normal',
        wordWrap: { width: c.BOX_W - c.PAD_X * 2 - 20 },
        lineSpacing: 4,
      });
      this.bodyText.setY(c.BOX_Y + c.PAD_Y + 30);
    }

    // 안내 텍스트 표시
    this.hintText.setVisible(true);
    this.hintText.setAlpha(0);

    // 타이핑 시작
    this._startTyping(line.text);
  }

  /** 타이핑 연출 시작 */
  _startTyping(text) {
    this._stopTyping();
    this.fullText = text;
    this.charIndex = 0;
    this.isTyping = true;
    this.bodyText.setText('');

    // 커서 깜빡임 시작
    this.cursorVisible = true;
    this.cursorTimer = this.scene.time.addEvent({
      delay: DIALOG_CONFIG.CURSOR_BLINK,
      loop: true,
      callback: () => {
        this.cursorVisible = !this.cursorVisible;
        if (this.isTyping) {
          this._updateDisplayText();
        }
      },
    });

    // 글자 하나씩 추가
    this.typingTimer = this.scene.time.addEvent({
      delay: DIALOG_CONFIG.TYPING_SPEED,
      repeat: this.fullText.length - 1,
      callback: () => {
        this.charIndex++;
        this._updateDisplayText();

        // 타이핑 완료
        if (this.charIndex >= this.fullText.length) {
          this._finishTyping();
        }
      },
    });
  }

  /** 타이핑 중 표시 텍스트 업데이트 (커서 포함) */
  _updateDisplayText() {
    const shown = this.fullText.substring(0, this.charIndex);
    const cursor = this.isTyping && this.cursorVisible ? ' ▌' : '';
    this.bodyText.setText(shown + cursor);
  }

  /** 타이핑 완료 처리 */
  _finishTyping() {
    this.isTyping = false;
    this.bodyText.setText(this.fullText);
    // 안내 텍스트 페이드인
    this.scene.tweens.add({
      targets: this.hintText,
      alpha: 1,
      duration: 300,
    });
    // 커서 타이머 정리
    if (this.cursorTimer) {
      this.cursorTimer.remove(false);
      this.cursorTimer = null;
    }
  }

  /** 타이핑 중지 (스킵 또는 정리) */
  _stopTyping() {
    if (this.typingTimer) {
      this.typingTimer.remove(false);
      this.typingTimer = null;
    }
    if (this.cursorTimer) {
      this.cursorTimer.remove(false);
      this.cursorTimer = null;
    }
    this.isTyping = false;
  }

  /** 진행 버튼 (클릭/스페이스) 처리 */
  _onAdvance() {
    if (!this.isActive) return;

    // 스크린 이미지 표시 중이면 무시 (이미지 자체 입력으로 닫힘)
    if (this._screenShowing) return;

    // 선택지 표시 중이면 무시 (키보드/클릭으로만 선택)
    if (this._choiceRects.length > 0) return;

    if (this.isTyping) {
      // 타이핑 중 → 즉시 전체 표시 (스킵)
      this._stopTyping();
      this.charIndex = this.fullText.length;
      this._finishTyping();
    } else {
      // 타이핑 완료 → 다음 대사
      this._advanceToNext();
    }
  }

  /** 다음 대사로 이동 */
  _advanceToNext() {
    this.lineIndex++;
    if (this.lineIndex < this.lines.length) {
      this._showLine(this.lines[this.lineIndex]);
    } else {
      // 모든 대사 완료 — cb를 먼저 저장 후 상태만 정리
      const cb = this.onComplete;
      this.onComplete = null;
      this._stopTyping();
      this._clearChoices();
      this.lines = [];
      this.lineIndex = 0;
      this.isActive = false;

      // 콜백 실행 (콜백에서 showChoices/startDialog 호출 가능)
      if (cb) cb();

      // 콜백이 대화창을 다시 열지 않았으면 숨기기
      if (!this.isActive) {
        this.container.setVisible(false);
      }
    }
  }

  /** 선택지 선택 처리 */
  _onChoiceSelect(label) {
    this._clearChoices();
    if (this.choiceCallback) {
      const cb = this.choiceCallback;
      this.choiceCallback = null;
      cb(label);
    }
  }

  /** 선택지 버튼 및 상태 정리 */
  _clearChoices() {
    // 컨테이너 내 시각 요소 제거
    this.choiceButtons.forEach(({ bg, text }) => {
      bg.destroy();
      text.destroy();
    });
    this.choiceButtons = [];

    // 히트 영역 메타데이터 초기화
    this._choiceRects = [];
    this._hoveredIndex = -1;

    // 대화창 배경을 기본 크기로 복원
    this._restoreDialogBox();
  }

  /** 대화창 배경을 기본 위치/크기로 복원 */
  _restoreDialogBox() {
    const c = DIALOG_CONFIG;
    this.bgGraphics.clear();
    this.bgGraphics.fillStyle(c.BG_COLOR, c.BG_ALPHA);
    this.bgGraphics.fillRoundedRect(c.BOX_X, c.BOX_Y, c.BOX_W, c.BOX_H, c.BOX_RADIUS);
    this.bgGraphics.lineStyle(1, c.BORDER_COLOR, c.BORDER_ALPHA);
    this.bgGraphics.strokeRoundedRect(c.BOX_X, c.BOX_Y, c.BOX_W, c.BOX_H, c.BOX_RADIUS);
    // 이름/본문 텍스트 위치도 기본으로
    this.nameText.setY(c.BOX_Y + c.PAD_Y);
    this.bodyText.setY(c.BOX_Y + c.PAD_Y + 30);
  }

  // ─────────────────────────────────────────────────────────
  // 스크린 이미지 표시 (showScreen 이벤트)
  // ─────────────────────────────────────────────────────────

  /**
   * 전체화면 이미지 오버레이 표시
   * 이미지가 로드되지 않은 screen 키는 건너뛰기
   * @param {string} screenKey — 'screen_1' ~ 'screen_6'
   */
  _showScreenImage(screenKey) {
    const scene = this.scene;

    // 해당 이미지가 로드되어 있는지 확인
    const tex = scene.textures.get(screenKey);
    if (!tex || tex.key === '__MISSING') {
      // 이미지 없으면 건너뛰기 (screen_1, 3, 5 등)
      this._advanceToNext();
      return;
    }

    // 이미지 표시 중 플래그 (스페이스 이중 입력 방지)
    this._screenShowing = true;

    // 대화창 임시 숨기기
    this.container.setVisible(false);

    const CX = 640;
    const CY = 360;
    const W = 1280;
    const H = 720;
    const DEPTH = 2000;

    // ── dimming 배경 ──
    const dim = scene.add.rectangle(CX, CY, W, H, 0x000000, 0)
      .setDepth(DEPTH).setInteractive();
    scene.tweens.add({ targets: dim, fillAlpha: 0.75, duration: 300 });

    // ── 이미지 표시 (화면 중앙, 여백 포함 축소) ──
    // pixelArt 모드에서도 스크린 이미지는 부드럽게 표시
    const texSource = scene.textures.get(screenKey).getSourceImage();
    if (texSource) {
      scene.textures.get(screenKey).setFilter(Phaser.Textures.FilterMode.LINEAR);
    }

    const img = scene.add.image(CX, CY - 10, screenKey)
      .setDepth(DEPTH + 1).setAlpha(0);

    // 이미지를 화면에 맞게 스케일 (상하좌우 여백)
    const maxW = W - 80;
    const maxH = H - 100;
    const scaleX = maxW / img.width;
    const scaleY = maxH / img.height;
    const scale = Math.min(scaleX, scaleY, 1); // 원본보다 커지지 않게
    img.setScale(scale);

    // 페이드인
    scene.tweens.add({
      targets: img,
      alpha: 1,
      duration: 400,
      ease: 'Power2',
    });

    // ── 안내 텍스트 ──
    const hint = scene.add.text(CX, H - 30, '클릭 또는 SPACE로 계속 ▶', {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      color: '#888888',
    }).setOrigin(0.5).setDepth(DEPTH + 2).setAlpha(0);

    scene.tweens.add({
      targets: hint,
      alpha: 1,
      duration: 400,
      delay: 500,
    });

    // ── 닫기 처리 ──
    let closed = false;
    const closeScreen = () => {
      if (closed) return;
      closed = true;

      // 이벤트 해제
      dim.off('pointerdown', onPointer);
      if (this._screenSpaceKey) {
        this._screenSpaceKey.off('down', onSpace);
      }

      // 페이드아웃 후 제거
      scene.tweens.add({
        targets: [dim, img, hint],
        alpha: 0,
        duration: 250,
        onComplete: () => {
          dim.destroy();
          img.destroy();
          hint.destroy();

          // 대화창 복원 후 다음 대사로
          this._screenShowing = false;
          this.container.setVisible(true);
          this._advanceToNext();
        },
      });
    };

    const onPointer = () => closeScreen();
    const onSpace = () => closeScreen();

    dim.on('pointerdown', onPointer);
    this._screenSpaceKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this._screenSpaceKey.on('down', onSpace);
  }
}
