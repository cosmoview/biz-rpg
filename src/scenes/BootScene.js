// ============================================================
// BootScene.js — 에셋 프리로드 전용 씬
// 배경맵 + 캐릭터 스프라이트 5개 로드 후 GameScene 전환
// ============================================================

/** 스프라이트 시트 설정 — 모든 캐릭터: 128×128px, 4열×4행, 프레임 32×32px */
const SPRITE_SHEETS = {
  dotori:       'assets/sprites/dotori.png',
  jung_sunbae:  'assets/sprites/jung_sunbae.png',
  park_juim:    'assets/sprites/park_juim.png',
  choi_gwajang: 'assets/sprites/choi_gwajang.png',
  kim_daeri:    'assets/sprites/kim_daeri.png',
};

/** 공통 프레임 크기 */
const FRAME_SIZE = 32;

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 로딩 텍스트 표시 (화면 중앙)
    const loadingText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      '로딩 중...',
      { fontSize: '32px', fontFamily: 'sans-serif', color: '#ffffff' }
    ).setOrigin(0.5);

    // 로드 진행률 업데이트
    this.load.on('progress', (value) => {
      loadingText.setText(`로딩 중... ${Math.floor(value * 100)}%`);
    });

    // 캐시 무효화용 타임스탬프
    const v = `?v=${Date.now()}`;

    // ── 배경 맵 이미지 로드 ──
    this.load.image('office_map', 'assets/maps/office_map.png' + v);

    // ── 충돌 마스크 이미지 로드 ──
    this.load.image('collision_mask', 'assets/maps/collision_mask.png' + v);

    // ── 캐릭터 스프라이트 시트 로드 (공통 32×32 프레임) ──
    for (const [key, path] of Object.entries(SPRITE_SHEETS)) {
      this.load.spritesheet(key, path + v, {
        frameWidth: FRAME_SIZE,
        frameHeight: FRAME_SIZE,
      });
    }

    // ── 스크린 이미지 로드 (미션 클리어 시 표시) ──
    this.load.image('screen_2', 'assets/screens/screen_2.jpg' + v);
    this.load.image('screen_4', 'assets/screens/screen_4.jpg' + v);
    this.load.image('screen_6', 'assets/screens/screen_6.jpg' + v);
  }

  create() {
    // ── 스프라이트 체크무늬 배경 → 투명 처리 ──
    // PNG에 알파 채널 대신 체크무늬가 포함된 경우 런타임에서 제거
    this._removeCheckerboard();

    // 로드 완료 → GameScene 전환 + UIScene 병렬 실행
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }

  /**
   * 스프라이트 시트의 체크무늬 배경을 투명으로 변환
   * 이미지 모서리 픽셀을 샘플링하여 배경색 자동 감지
   */
  _removeCheckerboard() {
    const keys = Object.keys(SPRITE_SHEETS);

    keys.forEach((key) => {
      const texture = this.textures.get(key);
      if (!texture || texture.key === '__MISSING') return;

      const source = texture.getSourceImage();

      // 임시 캔버스에 원본 그리기
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = source.width;
      tmpCanvas.height = source.height;
      const ctx = tmpCanvas.getContext('2d');
      ctx.drawImage(source, 0, 0);

      const imageData = ctx.getImageData(0, 0, source.width, source.height);
      const data = imageData.data;
      const w = source.width;

      // 모서리 4개 픽셀에서 배경색 샘플링 (체크무늬의 두 색상)
      const bgColors = this._sampleCornerColors(data, w);

      // 감지된 배경색과 일치하는 픽셀을 투명으로 처리 (허용오차 15)
      const tolerance = 15;
      for (let i = 0; i < data.length; i += 4) {
        // 이미 투명한 픽셀은 건너뛰기
        if (data[i + 3] === 0) continue;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        for (const bg of bgColors) {
          if (Math.abs(r - bg.r) <= tolerance &&
              Math.abs(g - bg.g) <= tolerance &&
              Math.abs(b - bg.b) <= tolerance) {
            data[i + 3] = 0; // 투명으로 설정
            break;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // 기존 텍스처 제거 후 정리된 캔버스로 교체
      this.textures.remove(key);

      // 새 텍스처를 스프라이트시트로 등록 (프레임 자동 분할)
      const newTex = this.textures.addSpriteSheet(key, tmpCanvas, {
        frameWidth: FRAME_SIZE,
        frameHeight: FRAME_SIZE,
      });
    });
  }

  /**
   * 이미지 모서리 픽셀에서 체크무늬 배경색 2색 추출
   * @param {Uint8ClampedArray} data — 이미지 픽셀 데이터
   * @param {number} w — 이미지 너비
   * @returns {Array<{r,g,b}>} 배경색 배열 (1~2개)
   */
  _sampleCornerColors(data, w) {
    /** 좌표 → 색상 추출 헬퍼 */
    const getPixel = (x, y) => {
      const idx = (y * w + x) * 4;
      return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
    };

    // 네 모서리 + 인접 픽셀 샘플링 (체크무늬의 두 색상 모두 잡기)
    const samples = [
      getPixel(0, 0), getPixel(1, 0),
      getPixel(0, 1), getPixel(1, 1),
    ];

    // 고유 색상만 추출 (허용오차 20 이내는 같은 색으로 판정)
    const unique = [];
    const tol = 20;
    for (const s of samples) {
      // 이미 투명한 픽셀이면 건너뛰기 (PNG에 알파가 있는 경우)
      if (s.a === 0) continue;
      const isDup = unique.some(
        (u) => Math.abs(u.r - s.r) <= tol && Math.abs(u.g - s.g) <= tol && Math.abs(u.b - s.b) <= tol
      );
      if (!isDup) unique.push({ r: s.r, g: s.g, b: s.b });
    }

    return unique;
  }
}
