// ============================================================
// EffectSystem.js — 시각 이펙트 전담
// 정답/오답 피드백, 미션 클리어 파티클, 스킬카드 획득 UI
// 무음 게임이므로 모든 피드백은 시각 이펙트로만 처리
// ============================================================

/** 이펙트 설정 상수 */
const FX = {
  // 화면 중심
  CX: 640,
  CY: 360,
  W: 1280,
  H: 720,

  // 스킬카드 UI
  CARD_W: 420,
  CARD_H: 200,
  CARD_BG: 0x1e2140,
  CARD_BORDER: 0xFFD700,
  CARD_RADIUS: 14,
  DIM_COLOR: 0x000000,
  DIM_ALPHA: 0.7,

  // 공통 depth (대화창보다 위)
  DEPTH: 3000,
};

export default class EffectSystem {
  /**
   * @param {Phaser.Scene} scene — GameScene 참조
   */
  constructor(scene) {
    this.scene = scene;

    /** 스킬카드 UI가 표시 중인지 여부 */
    this.isCardShowing = false;

    /** 스킬카드 닫기 콜백 */
    this._cardCloseCallback = null;

    /** 스킬카드 UI 요소 참조 (닫을 때 정리용) */
    this._cardElements = [];

    // ── GameScene 이벤트 수신 ──
    scene.events.on('skillCardAcquired', (cardData) => {
      this.showSkillCard(cardData);
    });
  }

  // ─────────────────────────────────────────────────────────
  // 1. 정답 이펙트: 초록 반짝임 + 체크
  // ─────────────────────────────────────────────────────────

  /** 정답 선택 시 초록 플래시 + ✓ 마크 */
  flashCorrect() {
    const s = this.scene;

    // 초록색 전체 화면 플래시
    const flash = s.add.rectangle(
      FX.CX, FX.CY, FX.W, FX.H, 0x00ff00, 0.3
    ).setDepth(FX.DEPTH);

    s.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 400,
      onComplete: () => flash.destroy(),
    });

    // ✓ 체크 마크 팝업
    const check = s.add.text(FX.CX, FX.CY - 60, '✓', {
      fontSize: '80px',
      fontFamily: 'sans-serif',
      color: '#00ff00',
    }).setOrigin(0.5).setDepth(FX.DEPTH + 1).setAlpha(0);

    s.tweens.add({
      targets: check,
      alpha: 1,
      scale: 1.3,
      duration: 300,
      yoyo: true,
      hold: 200,
      onComplete: () => check.destroy(),
    });
  }

  // ─────────────────────────────────────────────────────────
  // 2. 오답 이펙트: 쉐이크 + 빨간 플래시
  // ─────────────────────────────────────────────────────────

  /** 오답 선택 시 화면 흔들림 + 빨간 플래시 */
  shakeScreen() {
    const s = this.scene;

    // 카메라 쉐이크
    s.cameras.main.shake(300, 0.01);

    // 빨간색 전체 화면 플래시
    const flash = s.add.rectangle(
      FX.CX, FX.CY, FX.W, FX.H, 0xff0000, 0.15
    ).setDepth(FX.DEPTH);

    s.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy(),
    });
  }

  // ─────────────────────────────────────────────────────────
  // 3. 미션 클리어: 별 파티클 버스트
  // ─────────────────────────────────────────────────────────

  /** 화면 가장자리에서 별(⭐) 파티클 방출 */
  starBurst() {
    const s = this.scene;
    const stars = [];
    const count = 24; // 별 개수

    for (let i = 0; i < count; i++) {
      // 화면 가장자리 랜덤 위치에서 시작
      let sx, sy;
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0)      { sx = Math.random() * FX.W; sy = 0; }       // 상단
      else if (edge === 1) { sx = Math.random() * FX.W; sy = FX.H; }    // 하단
      else if (edge === 2) { sx = 0; sy = Math.random() * FX.H; }       // 좌측
      else                 { sx = FX.W; sy = Math.random() * FX.H; }    // 우측

      const star = s.add.text(sx, sy, '⭐', {
        fontSize: `${14 + Math.random() * 16}px`,
      }).setOrigin(0.5).setDepth(FX.DEPTH).setAlpha(0);

      // 화면 중앙 방향으로 이동하면서 페이드인 → 페이드아웃
      const targetX = sx + (FX.CX - sx) * (0.3 + Math.random() * 0.4);
      const targetY = sy + (FX.CY - sy) * (0.3 + Math.random() * 0.4);
      const delay = Math.random() * 300;

      s.tweens.add({
        targets: star,
        x: targetX,
        y: targetY,
        alpha: { from: 0, to: 1 },
        scale: { from: 0.3, to: 1.2 },
        duration: 500,
        delay: delay,
        ease: 'Back.easeOut',
        onComplete: () => {
          // 페이드아웃
          s.tweens.add({
            targets: star,
            alpha: 0,
            scale: 0.5,
            duration: 400,
            onComplete: () => star.destroy(),
          });
        },
      });

      stars.push(star);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 4. 스킬카드 획득 UI
  // ─────────────────────────────────────────────────────────

  /**
   * 스킬카드 획득 연출
   * @param {Object} cardData — { icon, title, desc1, desc2 }
   * @param {Function} [onClose] — 카드 닫힌 후 콜백
   */
  showSkillCard(cardData, onClose) {
    if (this.isCardShowing) return;
    this.isCardShowing = true;
    this._cardCloseCallback = onClose || null;
    this._cardElements = [];

    const s = this.scene;
    const d = FX.DEPTH + 10;

    // ── 배경 dimming ──
    const dim = s.add.rectangle(FX.CX, FX.CY, FX.W, FX.H, FX.DIM_COLOR, 0)
      .setDepth(d);
    s.tweens.add({ targets: dim, fillAlpha: FX.DIM_ALPHA, duration: 300 });
    this._cardElements.push(dim);

    // ── 카드 컨테이너 (아래에서 슬라이드 등장) ──
    const cardY = FX.CY;
    const container = s.add.container(FX.CX, FX.H + 120).setDepth(d + 1);
    this._cardElements.push(container);

    // 카드 배경
    const cardBg = s.add.graphics();
    cardBg.fillStyle(FX.CARD_BG, 1);
    cardBg.fillRoundedRect(
      -FX.CARD_W / 2, -FX.CARD_H / 2,
      FX.CARD_W, FX.CARD_H, FX.CARD_RADIUS
    );
    // 골드 테두리
    cardBg.lineStyle(2, FX.CARD_BORDER, 1);
    cardBg.strokeRoundedRect(
      -FX.CARD_W / 2, -FX.CARD_H / 2,
      FX.CARD_W, FX.CARD_H, FX.CARD_RADIUS
    );
    container.add(cardBg);

    // 스킬 아이콘 (대형)
    const icon = s.add.text(0, -55, cardData.icon, {
      fontSize: '48px',
    }).setOrigin(0.5);
    container.add(icon);

    // 스킬 이름
    const title = s.add.text(0, -10, cardData.title, {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#FFD700',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(title);

    // 설명 1줄
    const desc1 = s.add.text(0, 22, cardData.desc1, {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
    }).setOrigin(0.5);
    container.add(desc1);

    // 설명 2줄
    const desc2 = s.add.text(0, 44, cardData.desc2, {
      fontSize: '13px',
      fontFamily: 'sans-serif',
      color: '#cccccc',
    }).setOrigin(0.5);
    container.add(desc2);

    // "클릭하여 계속" 안내
    const hint = s.add.text(0, 78, '클릭하여 계속', {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#888888',
    }).setOrigin(0.5).setAlpha(0);
    container.add(hint);

    // ── 슬라이드 등장 애니메이션 ──
    s.tweens.add({
      targets: container,
      y: cardY,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // 안내 텍스트 페이드인
        s.tweens.add({ targets: hint, alpha: 1, duration: 400 });
      },
    });

    // ── 골드 테두리 glow pulse ──
    this._glowTween = s.tweens.add({
      targets: cardBg,
      alpha: { from: 1, to: 0.7 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ── 닫기 입력 바인딩 ──
    // 클릭 영역 (dim 전체)
    dim.setInteractive({ useHandCursor: true });
    dim.on('pointerdown', () => this._closeSkillCard());

    // 스페이스바
    this._cardSpaceKey = s.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this._cardSpaceHandler = () => {
      if (this.isCardShowing) this._closeSkillCard();
    };
    this._cardSpaceKey.on('down', this._cardSpaceHandler);
  }

  /** 스킬카드 UI 닫기 + 정리 */
  _closeSkillCard() {
    if (!this.isCardShowing) return;
    this.isCardShowing = false;

    const s = this.scene;

    // glow 트윈 정지
    if (this._glowTween) {
      this._glowTween.stop();
      this._glowTween = null;
    }

    // 스페이스바 해제
    if (this._cardSpaceKey && this._cardSpaceHandler) {
      this._cardSpaceKey.off('down', this._cardSpaceHandler);
      this._cardSpaceHandler = null;
    }

    // 페이드아웃 후 제거
    const elements = this._cardElements;
    s.tweens.add({
      targets: elements,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        elements.forEach((el) => { if (el && el.destroy) el.destroy(); });
        this._cardElements = [];

        // 콜백 실행
        if (this._cardCloseCallback) {
          const cb = this._cardCloseCallback;
          this._cardCloseCallback = null;
          cb();
        }
      },
    });
  }
}
