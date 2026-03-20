// ============================================================
// UIScene.js — HUD 오버레이 씬
// 항상 GameScene 위에 실행되는 UI 레이어
// 미션 상태창 표시 + GameScene 이벤트 수신
// ============================================================

import { MISSION_INITIAL } from '../data/scripts.js';

/** HUD 설정 상수 */
const HUD_CONFIG = {
  X: 10,   // 좌측 상단
  Y: 10,
  BOX_W: 180,
  BG_COLOR: 0x000000,
  BG_ALPHA: 0.35,       // 투명도 높임 (0.5 → 0.35)
  PAD: 10,
  LINE_HEIGHT: 22,
  TITLE_SIZE: '14px',
  ITEM_SIZE: '13px',
  TITLE_COLOR: '#FFD700',
  ITEM_COLOR: '#ffffff',
  COMPLETE_COLOR: '#00ff00',
};

/** 미션 ID → 한글 이름 매핑 */
const MISSION_NAMES = {
  vibe_coding: '바이브코딩',
  teams_sync:  '팀즈 연동',
  mcp_connect: 'MCP 연결',
};

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    /** 현재 미션 상태 */
    this.missionState = { ...MISSION_INITIAL };

    // HUD 컨테이너
    this.hudContainer = this.add.container(HUD_CONFIG.X, HUD_CONFIG.Y);

    // 배경 박스
    this.hudBg = this.add.graphics();
    this.hudContainer.add(this.hudBg);

    // 타이틀
    this.titleText = this.add.text(HUD_CONFIG.PAD, HUD_CONFIG.PAD, '🌰 도토리의 첫 출근', {
      fontSize: HUD_CONFIG.TITLE_SIZE,
      fontFamily: 'sans-serif',
      color: HUD_CONFIG.TITLE_COLOR,
      fontStyle: 'bold',
    });
    this.hudContainer.add(this.titleText);

    // 미션 항목 텍스트
    this.missionTexts = {};
    const missionIds = Object.keys(MISSION_INITIAL);
    missionIds.forEach((id, i) => {
      const y = HUD_CONFIG.PAD + HUD_CONFIG.LINE_HEIGHT * (i + 1) + 8;
      const text = this.add.text(HUD_CONFIG.PAD, y, `🔒 ${MISSION_NAMES[id]}`, {
        fontSize: HUD_CONFIG.ITEM_SIZE,
        fontFamily: 'sans-serif',
        color: HUD_CONFIG.ITEM_COLOR,
      });
      this.hudContainer.add(text);
      this.missionTexts[id] = text;
    });

    // 완료 카운터
    const counterY = HUD_CONFIG.PAD + HUD_CONFIG.LINE_HEIGHT * (missionIds.length + 1) + 16;
    this.counterText = this.add.text(HUD_CONFIG.PAD, counterY, '⭐ 0/3 완료', {
      fontSize: HUD_CONFIG.ITEM_SIZE,
      fontFamily: 'sans-serif',
      color: HUD_CONFIG.ITEM_COLOR,
    });
    this.hudContainer.add(this.counterText);

    // 배경 그리기
    this._drawHudBg(counterY + HUD_CONFIG.LINE_HEIGHT + HUD_CONFIG.PAD);

    // ── GameScene 이벤트 수신 ──
    const gameScene = this.scene.get('GameScene');
    if (gameScene) {
      gameScene.events.on('missionStateChanged', (state) => {
        this._updateHud(state);
      });
    }
  }

  /** HUD 배경 박스 그리기 */
  _drawHudBg(height) {
    const c = HUD_CONFIG;
    this.hudBg.clear();
    this.hudBg.fillStyle(c.BG_COLOR, c.BG_ALPHA);
    this.hudBg.fillRoundedRect(0, 0, c.BOX_W, height, 8);
  }

  /** 미션 상태 업데이트 */
  _updateHud(state) {
    this.missionState = { ...state };
    let completed = 0;

    for (const [id, done] of Object.entries(state)) {
      const text = this.missionTexts[id];
      if (!text) continue;

      if (done) {
        text.setText(`✅ ${MISSION_NAMES[id]}`);
        text.setColor(HUD_CONFIG.COMPLETE_COLOR);
        completed++;

        // 별 반짝 애니메이션 (최초 완료 시)
        if (text.getData('animated') !== true) {
          text.setData('animated', true);
          this.tweens.add({
            targets: text,
            scale: 1.2,
            duration: 200,
            yoyo: true,
            ease: 'Back.easeOut',
          });
        }
      } else {
        text.setText(`🔒 ${MISSION_NAMES[id]}`);
        text.setColor(HUD_CONFIG.ITEM_COLOR);
      }
    }

    this.counterText.setText(`⭐ ${completed}/3 완료`);
  }
}
