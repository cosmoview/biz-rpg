// ============================================================
// EndingScene.js — 엔딩 연출 씬
// 스킬카드 3장 순차 등장 → 합체 → 마스터 뱃지 → 후속 대사 → 엔딩 화면
// ============================================================

import DialogSystem from '../systems/DialogSystem.js';
import { SCRIPTS, SKILL_CARDS } from '../data/scripts.js';

/** 엔딩 연출 설정 */
const END = {
  CX: 640,
  CY: 360,
  W: 1280,
  H: 720,
  // 스킬카드 UI
  CARD_W: 280,
  CARD_H: 160,
  CARD_BG: 0x1e2140,
  CARD_BORDER: 0xFFD700,
  CARD_RADIUS: 12,
  CARD_GAP: 40,
  // 뱃지
  BADGE_SIZE: 140,
  // 공통
  DIM_ALPHA: 0.7,
  DEPTH: 500,
};

export default class EndingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndingScene' });
  }

  /** @param {{ playTime: number }} data — GameScene에서 전달한 플레이타임(ms) */
  init(data) {
    this.playTime = data.playTime || 0;
  }

  create() {
    // 배경: 이전 GameScene 위에 검정 dimming
    this.add.rectangle(END.CX, END.CY, END.W, END.H, 0x000000, 1).setDepth(0);

    // 대화 시스템 (후속 대사용)
    this.dialog = new DialogSystem(this);

    // 입력 키 등록
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // ── 스킬카드 연출 시작 ──
    this._startCardSequence();
  }

  // ─────────────────────────────────────────────────────────
  // 스킬카드 3장 순차 등장
  // ─────────────────────────────────────────────────────────

  /** 카드 3장을 한 장씩 보여주는 연출 시작 */
  _startCardSequence() {
    // dimming 배경
    this.dimBg = this.add.rectangle(END.CX, END.CY, END.W, END.H, 0x000000, 0)
      .setDepth(END.DEPTH);
    this.tweens.add({
      targets: this.dimBg,
      fillAlpha: END.DIM_ALPHA,
      duration: 500,
    });

    // 카드 컨테이너 배열
    this.cardContainers = [];
    this._currentCardIndex = 0;

    // 첫 번째 카드 표시 (500ms 딜레이)
    this.time.delayedCall(600, () => {
      this._showNextCard();
    });
  }

  /** 다음 카드 1장 표시 (아래→위 슬라이드) */
  _showNextCard() {
    const idx = this._currentCardIndex;
    if (idx >= SKILL_CARDS.length) {
      // 3장 모두 표시 완료 → 합체 연출
      this.time.delayedCall(500, () => this._mergeCards());
      return;
    }

    const card = SKILL_CARDS[idx];
    const container = this._createCardUI(card, idx);
    this.cardContainers.push(container);

    // 카드 최종 위치 (가로 나란히 배치)
    const totalW = SKILL_CARDS.length * END.CARD_W + (SKILL_CARDS.length - 1) * END.CARD_GAP;
    const startX = END.CX - totalW / 2 + END.CARD_W / 2;
    const targetX = startX + idx * (END.CARD_W + END.CARD_GAP);
    const targetY = END.CY;

    // 아래에서 슬라이드 등장
    container.setPosition(targetX, END.H + 120);
    this.tweens.add({
      targets: container,
      y: targetY,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // 클릭 or 스페이스로 다음 카드
        this._waitForInput(() => {
          this._currentCardIndex++;
          this._showNextCard();
        });
      },
    });
  }

  /** 스킬카드 UI 컨테이너 생성 */
  _createCardUI(cardData, index) {
    const container = this.add.container(0, 0).setDepth(END.DEPTH + 10);

    // 카드 배경
    const bg = this.add.graphics();
    bg.fillStyle(END.CARD_BG, 1);
    bg.fillRoundedRect(-END.CARD_W / 2, -END.CARD_H / 2, END.CARD_W, END.CARD_H, END.CARD_RADIUS);
    bg.lineStyle(2, END.CARD_BORDER, 1);
    bg.strokeRoundedRect(-END.CARD_W / 2, -END.CARD_H / 2, END.CARD_W, END.CARD_H, END.CARD_RADIUS);
    container.add(bg);

    // 골드 테두리 glow
    this.tweens.add({
      targets: bg,
      alpha: { from: 1, to: 0.7 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 아이콘
    const icon = this.add.text(0, -45, cardData.icon, { fontSize: '40px' }).setOrigin(0.5);
    container.add(icon);

    // 타이틀
    const title = this.add.text(0, -5, cardData.title, {
      fontSize: '18px', fontFamily: 'sans-serif', color: '#FFD700', fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(title);

    // 설명
    const d1 = this.add.text(0, 22, cardData.desc1, {
      fontSize: '12px', fontFamily: 'sans-serif', color: '#ffffff',
    }).setOrigin(0.5);
    container.add(d1);

    const d2 = this.add.text(0, 40, cardData.desc2, {
      fontSize: '11px', fontFamily: 'sans-serif', color: '#cccccc',
    }).setOrigin(0.5);
    container.add(d2);

    // 안내
    const hint = this.add.text(0, 65, '클릭 또는 SPACE ▶', {
      fontSize: '10px', fontFamily: 'sans-serif', color: '#888888',
    }).setOrigin(0.5);
    container.add(hint);

    return container;
  }

  // ─────────────────────────────────────────────────────────
  // 카드 합체 → 마스터 뱃지
  // ─────────────────────────────────────────────────────────

  /** 3장을 중앙으로 모아 합체 */
  _mergeCards() {
    const mergePromises = this.cardContainers.map((container, i) => {
      return new Promise((resolve) => {
        this.tweens.add({
          targets: container,
          x: END.CX,
          y: END.CY,
          scaleX: 0.5,
          scaleY: 0.5,
          alpha: 0.6,
          duration: 600,
          delay: i * 100,
          ease: 'Power2',
          onComplete: resolve,
        });
      });
    });

    // 모든 카드 합체 완료 후
    Promise.all(mergePromises).then(() => {
      // 카드 제거
      this.cardContainers.forEach((c) => c.destroy());
      this.cardContainers = [];

      // 플래시 효과
      const flash = this.add.rectangle(END.CX, END.CY, END.W, END.H, 0xFFD700, 0.4)
        .setDepth(END.DEPTH + 20);
      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 500,
        onComplete: () => flash.destroy(),
      });

      // 마스터 뱃지 등장
      this.time.delayedCall(200, () => this._showBadge());
    });
  }

  /** 에이닷 비즈 마스터 뱃지 표시 + 골드 파티클 */
  _showBadge() {
    // 뱃지 컨테이너
    const badge = this.add.container(END.CX, END.CY).setDepth(END.DEPTH + 25).setScale(0);

    // 뱃지 배경 원형
    const circle = this.add.graphics();
    circle.fillStyle(0x1e2140, 1);
    circle.fillCircle(0, 0, END.BADGE_SIZE / 2);
    circle.lineStyle(3, END.CARD_BORDER, 1);
    circle.strokeCircle(0, 0, END.BADGE_SIZE / 2);
    badge.add(circle);

    // 뱃지 아이콘
    const icon = this.add.text(0, -20, '🏆', { fontSize: '40px' }).setOrigin(0.5);
    badge.add(icon);

    // 뱃지 텍스트
    const label = this.add.text(0, 22, '에이닷 비즈\n마스터', {
      fontSize: '14px', fontFamily: 'sans-serif', color: '#FFD700',
      fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5);
    badge.add(label);

    // 스케일 팝업 등장
    this.tweens.add({
      targets: badge,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // 골드 테두리 glow
    this.tweens.add({
      targets: circle,
      alpha: { from: 1, to: 0.7 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // ── 골드 파티클 버스트 ──
    this._goldParticleBurst();

    // 클릭/스페이스로 후속 대사 진행
    this.time.delayedCall(1500, () => {
      this._waitForInput(() => {
        // 뱃지 페이드아웃
        this.tweens.add({
          targets: badge,
          alpha: 0,
          scale: 0.5,
          duration: 400,
          onComplete: () => {
            badge.destroy();
            // dimming 해제
            this.tweens.add({
              targets: this.dimBg,
              fillAlpha: 0,
              duration: 300,
              onComplete: () => {
                this.dimBg.destroy();
                this._playAfterCardsDialog();
              },
            });
          },
        });
      });
    });
  }

  /** 골드 ⭐ 파티클 방출 */
  _goldParticleBurst() {
    const count = 30;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
      const dist = 80 + Math.random() * 120;
      const tx = END.CX + Math.cos(angle) * dist;
      const ty = END.CY + Math.sin(angle) * dist;

      const star = this.add.text(END.CX, END.CY, '✦', {
        fontSize: `${12 + Math.random() * 14}px`,
        color: '#FFD700',
      }).setOrigin(0.5).setDepth(END.DEPTH + 30).setAlpha(0);

      this.tweens.add({
        targets: star,
        x: tx,
        y: ty,
        alpha: { from: 0, to: 1 },
        scale: { from: 0.3, to: 1 },
        duration: 400 + Math.random() * 200,
        delay: Math.random() * 300,
        ease: 'Power2',
        onComplete: () => {
          this.tweens.add({
            targets: star,
            alpha: 0,
            duration: 500,
            onComplete: () => star.destroy(),
          });
        },
      });
    }
  }

  // ─────────────────────────────────────────────────────────
  // 후속 대사 → 엔딩 화면
  // ─────────────────────────────────────────────────────────

  /** ending_after_cards 대사 재생 */
  _playAfterCardsDialog() {
    this.dialog.startDialog(SCRIPTS.ending_after_cards, () => {
      this._showEndScreen();
    });
  }

  /** 최종 엔딩 화면: 🎉 + 플레이타임 + [다시 하기] */
  _showEndScreen() {
    // 배경 페이드
    const bg = this.add.rectangle(END.CX, END.CY, END.W, END.H, 0x1a1a2e, 0)
      .setDepth(END.DEPTH + 50);
    this.tweens.add({ targets: bg, fillAlpha: 1, duration: 800 });

    // 컨테이너
    const ui = this.add.container(END.CX, END.CY).setDepth(END.DEPTH + 60).setAlpha(0);

    // 🎉 타이틀
    const title = this.add.text(0, -80, '🎉 첫 출근 완료!', {
      fontSize: '42px', fontFamily: 'sans-serif', color: '#FFD700', fontStyle: 'bold',
    }).setOrigin(0.5);
    ui.add(title);

    // 플레이타임
    const mins = Math.floor(this.playTime / 60000);
    const secs = Math.floor((this.playTime % 60000) / 1000);
    const timeStr = `플레이타임: ${mins}분 ${secs}초`;
    const timeText = this.add.text(0, -20, timeStr, {
      fontSize: '18px', fontFamily: 'sans-serif', color: '#ffffff',
    }).setOrigin(0.5);
    ui.add(timeText);

    // 부제
    const sub = this.add.text(0, 20, '도토리는 에이닷 비즈 마스터가 되었습니다!', {
      fontSize: '16px', fontFamily: 'sans-serif', color: '#cccccc',
    }).setOrigin(0.5);
    ui.add(sub);

    // [다시 하기] 버튼
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x222244, 1);
    btnBg.fillRoundedRect(-100, 55, 200, 50, 10);
    btnBg.lineStyle(2, 0xFFD700, 1);
    btnBg.strokeRoundedRect(-100, 55, 200, 50, 10);
    ui.add(btnBg);

    const btnText = this.add.text(0, 80, '다시 하기', {
      fontSize: '20px', fontFamily: 'sans-serif', color: '#FFD700', fontStyle: 'bold',
    }).setOrigin(0.5);
    ui.add(btnText);

    // 버튼 히트 영역
    const btnZone = this.add.zone(END.CX, END.CY + 80, 200, 50)
      .setInteractive({ useHandCursor: true })
      .setDepth(END.DEPTH + 70);

    btnZone.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0x333366, 1);
      btnBg.fillRoundedRect(-100, 55, 200, 50, 10);
      btnBg.lineStyle(2, 0xFFD700, 1);
      btnBg.strokeRoundedRect(-100, 55, 200, 50, 10);
    });
    btnZone.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0x222244, 1);
      btnBg.fillRoundedRect(-100, 55, 200, 50, 10);
      btnBg.lineStyle(2, 0xFFD700, 1);
      btnBg.strokeRoundedRect(-100, 55, 200, 50, 10);
    });
    btnZone.on('pointerdown', () => this._restartGame());

    // 페이드인
    this.time.delayedCall(800, () => {
      this.tweens.add({ targets: ui, alpha: 1, duration: 600 });
    });
  }

  /** 게임 처음부터 재시작 */
  _restartGame() {
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }

  // ─────────────────────────────────────────────────────────
  // 입력 대기 헬퍼
  // ─────────────────────────────────────────────────────────

  /** 클릭 또는 스페이스바 한 번 입력 대기 → 콜백 실행 */
  _waitForInput(callback) {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      this.input.off('pointerdown', onPointer);
      this.spaceKey.off('down', onSpace);
      callback();
    };
    const onPointer = () => finish();
    const onSpace = () => finish();
    this.input.on('pointerdown', onPointer);
    this.spaceKey.on('down', onSpace);
  }
}
