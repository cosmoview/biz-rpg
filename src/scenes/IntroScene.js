// ============================================================
// IntroScene.js — 게임 시작 전 인트로 화면
// 타이틀 + 조작 방법 + 시작 버튼
// ============================================================

/** 인트로 화면 설정 */
const INTRO = {
  CX: 640,
  CY: 360,
  BG: 0x1a1a2e,
  GOLD: '#FFD700',
  GOLD_HEX: 0xFFD700,
  WHITE: '#ffffff',
  GRAY: '#aaaaaa',
  BOX_BG: 0x222244,
};

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create() {
    // ── 배경 ──
    this.add.rectangle(INTRO.CX, INTRO.CY, 1280, 720, INTRO.BG);

    // ── 상단 타이틀 ──
    this.add.text(INTRO.CX, 140, '에이닷 비즈 2.0', {
      fontSize: '18px', fontFamily: 'sans-serif', color: INTRO.GOLD,
    }).setOrigin(0.5);

    this.add.text(INTRO.CX, 190, '🌰 신입사원 도토리의 첫 출근', {
      fontSize: '36px', fontFamily: 'sans-serif', color: INTRO.WHITE, fontStyle: 'bold',
    }).setOrigin(0.5);

    // ── 조작 방법 박스 ──
    const boxW = 420, boxH = 160;
    const boxX = INTRO.CX - boxW / 2, boxY = 270;

    const boxBg = this.add.graphics();
    boxBg.fillStyle(INTRO.BOX_BG, 0.8);
    boxBg.fillRoundedRect(boxX, boxY, boxW, boxH, 10);
    boxBg.lineStyle(1, 0xffffff, 0.15);
    boxBg.strokeRoundedRect(boxX, boxY, boxW, boxH, 10);

    this.add.text(INTRO.CX, boxY + 24, '🕹️ 조작 방법', {
      fontSize: '16px', fontFamily: 'sans-serif', color: INTRO.GOLD, fontStyle: 'bold',
    }).setOrigin(0.5);

    const controls = [
      { key: '방향키 / WASD', desc: '캐릭터 이동' },
      { key: 'SPACE', desc: '대화 / 조사 / 넘기기' },
      { key: '숫자키 1~5', desc: '선택지 선택' },
    ];

    controls.forEach((c, i) => {
      const y = boxY + 60 + i * 30;
      this.add.text(boxX + 40, y, c.key, {
        fontSize: '14px', fontFamily: 'monospace', color: INTRO.WHITE,
      });
      this.add.text(boxX + 240, y, c.desc, {
        fontSize: '14px', fontFamily: 'sans-serif', color: INTRO.GRAY,
      });
    });

    // ── 시작 버튼 ──
    const btnW = 220, btnH = 54, btnY = 500;

    const btnBg = this.add.graphics();
    this._drawBtn(btnBg, btnW, btnH, btnY, false);

    const btnText = this.add.text(INTRO.CX, btnY + btnH / 2, '게임 시작', {
      fontSize: '22px', fontFamily: 'sans-serif', color: INTRO.GOLD, fontStyle: 'bold',
    }).setOrigin(0.5);

    // 버튼 히트 영역
    const btnZone = this.add.zone(INTRO.CX, btnY + btnH / 2, btnW, btnH)
      .setInteractive({ useHandCursor: true });

    btnZone.on('pointerover', () => this._drawBtn(btnBg, btnW, btnH, btnY, true));
    btnZone.on('pointerout', () => this._drawBtn(btnBg, btnW, btnH, btnY, false));
    btnZone.on('pointerdown', () => this._startGame());

    // 스페이스바로도 시작
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
      .on('down', () => this._startGame());

    // ── 하단 안내 ──
    this.add.text(INTRO.CX, 620, '스페이스바 또는 버튼 클릭으로 시작', {
      fontSize: '13px', fontFamily: 'sans-serif', color: '#666666',
    }).setOrigin(0.5);
  }

  /** 버튼 배경 그리기 */
  _drawBtn(g, w, h, y, hovered) {
    const x = INTRO.CX - w / 2;
    g.clear();
    g.fillStyle(hovered ? 0x333366 : INTRO.BOX_BG, 1);
    g.fillRoundedRect(x, y, w, h, 10);
    g.lineStyle(2, INTRO.GOLD_HEX, 1);
    g.strokeRoundedRect(x, y, w, h, 10);
  }

  /** BootScene으로 전환 */
  _startGame() {
    this.scene.start('BootScene');
  }
}
