// ============================================================
// GameScene.js — 메인 게임 씬
// 배경맵(AI이미지) + 플레이어 + NPC를 여기서 관리
// ============================================================

import DialogSystem from '../systems/DialogSystem.js';
import MissionSystem from '../systems/MissionSystem.js';
import EffectSystem from '../systems/EffectSystem.js';
import { SCRIPTS } from '../data/scripts.js';

/** 게임 설정 상수 */
const CONFIG = {
  WIDTH: 1280,
  HEIGHT: 720,

  PLAYER_SPEED: 270,
  PLAYER_DISPLAY: 48,
  FRAME_SIZE: 32,

  // 도토리 시작 위치 (로비 정가운데)
  PLAYER_START_X: 208,
  PLAYER_START_Y: 176,

  // NPC 배치 좌표
  NPC_POS: {
    jung_sunbae:  { x: 580,  y: 200 },
    park_juim:    { x: 200,  y: 520 },
    choi_gwajang: { x: 620,  y: 520 },
    kim_daeri:    { x: 900, y: 160 },
  },

  INTERACT_DIST: 60,
};

/** 충돌 마스크 설정 */
const MASK_CONFIG = {
  CELL: 8,         // 픽셀을 묶는 단위 (8×8px)
  RED_MIN: 200,    // R 최소값
  GREEN_MAX: 50,   // G 최대값
  BLUE_MAX: 50,    // B 최대값
};

const PLAYER_SCALE = CONFIG.PLAYER_DISPLAY / CONFIG.FRAME_SIZE;

const FRAME = {
  DOWN:  { start: 0,  end: 3  },
  LEFT:  { start: 4,  end: 7  },
  RIGHT: { start: 8,  end: 11 },
  UP:    { start: 12, end: 15 },
};

const IDLE_FRAME = { DOWN: 0, LEFT: 4, RIGHT: 8, UP: 12 };

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.facing = 'DOWN';
    this.prologuePlayed = false;
    this.npcs = {};
    this.npcMarkers = {};
    this.barriers = {};
    /** 이스터에그 오브젝트 참조 { key: { marker, x, y } } */
    this.easterEggs = {};
    /** 김대리 FAQ 완료 여부 */
    this.kimFaqDone = false;
    /** 현재 대화 중인 NPC 키 (ESC 종료 대사용) */
    this.talkingNpc = null;
    /** 대화 종료 직후 입력 차단 쿨다운 (프레임 수) */
    this._dialogCooldown = 0;
    /** 로비 문 대사 트리거 상태 (근접 시 true, 멀어지면 false) */
    this._doorTriggered = false;
  }

  create() {
    // ── 배경 맵 이미지 ──
    this.add.image(0, 0, 'office_map')
      .setOrigin(0, 0)
      .setDisplaySize(CONFIG.WIDTH, CONFIG.HEIGHT);

    // ── 걷기 애니메이션 ──
    this.createAnimations();

    // ── 도토리 배치 ──
    this.player = this.physics.add.sprite(
      CONFIG.PLAYER_START_X, CONFIG.PLAYER_START_Y,
      'dotori', IDLE_FRAME.DOWN
    );
    this.player.setScale(PLAYER_SCALE);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(20, 16);
    this.player.body.setOffset(6, 16);
    this.player.setDepth(100);

    // ── NPC 배치 ──
    this._createNPCs();

    // ── 이스터에그 오브젝트 배치 ──
    this._createEasterEggs();

    // ── 충돌 영역 생성 ──
    this._createCollisionZones();

    // ── 대화 / 미션 / 이펙트 시스템 ──
    this.dialog = new DialogSystem(this);
    this.effects = new EffectSystem(this);
    this.mission = new MissionSystem(this, this.dialog);
    this.events.on('stageCleared', (stage) => this._onStageCleared(stage));

    // ── 키 입력 ──
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // ── 게임 시작 시간 기록 ──
    this.gameStartTime = Date.now();

    // ── 프롤로그 ──
    this.time.delayedCall(300, () => {
      this.dialog.startDialog(SCRIPTS.prologue, () => {
        this.prologuePlayed = true;
      });
    });
  }

  // ─────────────────────────────────────────────────────────
  // 충돌 영역 (collision_mask.png 기반)
  // ─────────────────────────────────────────────────────────

  /** collision_mask.png에서 빨간 픽셀을 읽어 충돌 벽 생성 */
  _createCollisionZones() {
    this.wallGroup = this.physics.add.staticGroup();

    // 마스크 이미지를 캔버스에 그려서 픽셀 데이터 추출
    const maskTex = this.textures.get('collision_mask');
    if (!maskTex || maskTex.key === '__MISSING') return;

    const source = maskTex.getSourceImage();
    const imgW = source.width;
    const imgH = source.height;

    const canvas = document.createElement('canvas');
    canvas.width = imgW;
    canvas.height = imgH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(source, 0, 0);
    const imageData = ctx.getImageData(0, 0, imgW, imgH);
    const data = imageData.data;

    // 게임 화면과 마스크 이미지의 스케일 비율
    const scaleX = CONFIG.WIDTH / imgW;
    const scaleY = CONFIG.HEIGHT / imgH;

    // 마스크 이미지를 CELL 단위로 순회하면서 빨간 셀 탐지
    const cell = MASK_CONFIG.CELL;
    const colsInMask = Math.ceil(imgW / cell);
    const rowsInMask = Math.ceil(imgH / cell);

    // 빨간 셀 여부를 2D 배열로 기록
    const grid = [];
    for (let gy = 0; gy < rowsInMask; gy++) {
      grid[gy] = [];
      for (let gx = 0; gx < colsInMask; gx++) {
        grid[gy][gx] = this._isCellRed(data, imgW, imgH, gx * cell, gy * cell, cell);
      }
    }

    // 그리디 병합: 인접한 빨간 셀을 가로 방향으로 최대한 묶어서 Rectangle 수 줄이기
    const visited = [];
    for (let gy = 0; gy < rowsInMask; gy++) {
      visited[gy] = new Array(colsInMask).fill(false);
    }

    for (let gy = 0; gy < rowsInMask; gy++) {
      for (let gx = 0; gx < colsInMask; gx++) {
        if (!grid[gy][gx] || visited[gy][gx]) continue;

        // 가로로 최대한 확장
        let endX = gx;
        while (endX + 1 < colsInMask && grid[gy][endX + 1] && !visited[gy][endX + 1]) {
          endX++;
        }

        // 세로로 최대한 확장 (같은 가로 범위가 모두 빨간 셀인 동안)
        let endY = gy;
        let canExpand = true;
        while (canExpand && endY + 1 < rowsInMask) {
          for (let cx = gx; cx <= endX; cx++) {
            if (!grid[endY + 1][cx] || visited[endY + 1][cx]) {
              canExpand = false;
              break;
            }
          }
          if (canExpand) endY++;
        }

        // 방문 표시
        for (let cy = gy; cy <= endY; cy++) {
          for (let cx = gx; cx <= endX; cx++) {
            visited[cy][cx] = true;
          }
        }

        // 마스크 좌표 → 게임 화면 좌표로 변환
        const rx = gx * cell * scaleX;
        const ry = gy * cell * scaleY;
        const rw = (endX - gx + 1) * cell * scaleX;
        const rh = (endY - gy + 1) * cell * scaleY;

        // 충돌 Rectangle 추가
        const wall = this.add.rectangle(rx + rw / 2, ry + rh / 2, rw, rh).setVisible(false);
        this.physics.add.existing(wall, true);
        this.wallGroup.add(wall);
      }
    }

    // 플레이어 ↔ 벽 충돌
    this.physics.add.collider(this.player, this.wallGroup);
  }

  /** 셀 영역 내 빨간 픽셀 비율이 50% 이상인지 판정 */
  _isCellRed(data, imgW, imgH, sx, sy, cellSize) {
    let redCount = 0;
    let totalCount = 0;
    const { RED_MIN, GREEN_MAX, BLUE_MAX } = MASK_CONFIG;

    for (let py = sy; py < sy + cellSize && py < imgH; py++) {
      for (let px = sx; px < sx + cellSize && px < imgW; px++) {
        const idx = (py * imgW + px) * 4;
        totalCount++;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        if (r > RED_MIN && g < GREEN_MAX && b < BLUE_MAX) {
          redCount++;
        }
      }
    }

    // 셀의 50% 이상이 빨간이면 충돌 셀로 판정
    return totalCount > 0 && (redCount / totalCount) >= 0.5;
  }

  /** 잠금 벽 제거 */
  _removeBarrier(barrierKey) {
    const wall = this.barriers[barrierKey];
    if (wall) {
      wall.destroy();
      delete this.barriers[barrierKey];
    }
  }

  // ─────────────────────────────────────────────────────────
  // NPC 생성 및 마커
  // ─────────────────────────────────────────────────────────

  _createNPCs() {
    const npcList = [
      { key: 'jung_sunbae',  visible: true,  marker: '❗' },
      { key: 'park_juim',    visible: false, marker: null  },
      { key: 'choi_gwajang', visible: false, marker: null  },
      { key: 'kim_daeri',    visible: false, marker: null  },
    ];

    npcList.forEach(({ key, visible, marker }) => {
      const pos = CONFIG.NPC_POS[key];
      const npc = this.add.sprite(pos.x, pos.y, key, 0);
      npc.setScale(PLAYER_SCALE);
      npc.setDepth(90);
      npc.setVisible(visible);
      this.npcs[key] = npc;

      const markerText = this.add.text(pos.x, pos.y - 32, marker || '', {
        fontSize: '20px', fontFamily: 'sans-serif',
      }).setOrigin(0.5).setDepth(200).setVisible(visible && !!marker);

      if (marker === '❗') {
        this.tweens.add({
          targets: markerText, y: pos.y - 38,
          duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
      }
      this.npcMarkers[key] = markerText;
    });
  }

  _setNpcMarker(npcKey, marker) {
    const m = this.npcMarkers[npcKey];
    if (!m) return;
    this.tweens.killTweensOf(m);
    m.setText(marker || '');
    m.setVisible(!!marker);
    const pos = CONFIG.NPC_POS[npcKey];
    m.setY(pos.y - 32);
    if (marker === '❗') {
      this.tweens.add({
        targets: m, y: pos.y - 38,
        duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }
  }

  _showNpc(npcKey, show) {
    const npc = this.npcs[npcKey];
    if (npc) npc.setVisible(show);
  }

  // ─────────────────────────────────────────────────────────
  // 스테이지 클리어
  // ─────────────────────────────────────────────────────────

  _onStageCleared(stage) {
    if (stage === 1) {
      this._removeBarrier('jaryosil');
      this._showNpc('park_juim', true);
      this._setNpcMarker('park_juim', '❗');
      this._setNpcMarker('jung_sunbae', '✅');
    } else if (stage === 2) {
      this._removeBarrier('hoeuisil');
      this._showNpc('choi_gwajang', true);
      this._setNpcMarker('choi_gwajang', '❗');
      this._setNpcMarker('park_juim', '✅');
    } else if (stage === 3) {
      this._setNpcMarker('jung_sunbae', '❗');
      this._showNpc('kim_daeri', true);
      this._setNpcMarker('kim_daeri', '❗');
      this._setNpcMarker('choi_gwajang', '✅');
    }
  }

  // ─────────────────────────────────────────────────────────
  // 이스터에그 오브젝트
  // ─────────────────────────────────────────────────────────

  /** 이스터에그 ✦ 마커 배치 */
  _createEasterEggs() {
    /** 이스터에그 위치 데이터 */
    const EGGS = [
      { key: 'easter_box',        x: 150,  y: 620 },
      { key: 'easter_whiteboard', x: 730,  y: 455 },
      { key: 'easter_coffee',     x: 900,  y: 130 },
      { key: 'easter_fridge',     x: 1065, y: 120 },
      { key: 'easter_table',      x: 1150, y: 430 },
    ];

    EGGS.forEach(({ key, x, y }) => {
      // ✦ 마커 텍스트
      const marker = this.add.text(x, y - 16, '✦', {
        fontSize: '18px',
        fontFamily: 'sans-serif',
        color: '#FFD700',
      }).setOrigin(0.5).setDepth(180).setAlpha(0.5);

      // 기본 반짝임 트윈 (느린 펄스)
      const baseTween = this.tweens.add({
        targets: marker,
        alpha: { from: 0.3, to: 0.7 },
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.easterEggs[key] = { marker, x, y, baseTween };
    });
  }

  /** 매 프레임: 이스터에그 근접 시 밝게 반짝임 */
  _updateEasterEggGlow() {
    const px = this.player.x;
    const py = this.player.y;

    for (const egg of Object.values(this.easterEggs)) {
      const dist = Phaser.Math.Distance.Between(px, py, egg.x, egg.y);
      const near = dist < 50;

      // 근접 시 더 밝게 + 빠르게
      if (near && !egg._glowing) {
        egg._glowing = true;
        egg.baseTween.stop();
        egg.marker.setAlpha(1);
        egg._nearTween = this.tweens.add({
          targets: egg.marker,
          alpha: { from: 0.7, to: 1 },
          scale: { from: 1, to: 1.3 },
          duration: 400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      } else if (!near && egg._glowing) {
        egg._glowing = false;
        if (egg._nearTween) { egg._nearTween.stop(); egg._nearTween = null; }
        egg.marker.setScale(1);
        egg.baseTween = this.tweens.add({
          targets: egg.marker,
          alpha: { from: 0.3, to: 0.7 },
          duration: 1200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    }
  }

  /** 가장 가까운 이스터에그 찾기 (50px 이내) */
  _findNearbyEasterEgg() {
    const px = this.player.x;
    const py = this.player.y;
    let closest = null;
    let minDist = 50;

    for (const [key, egg] of Object.entries(this.easterEggs)) {
      const dist = Phaser.Math.Distance.Between(px, py, egg.x, egg.y);
      if (dist < minDist) {
        minDist = dist;
        closest = key;
      }
    }
    return closest;
  }

  /** 이스터에그 조사 (대사 재생) */
  _interactWithEasterEgg(eggKey) {
    const lines = SCRIPTS.easter_eggs[eggKey];
    if (!lines) return;
    this.talkingNpc = null; // 이스터에그는 NPC가 아님
    this.dialog.startDialog(lines);
  }

  // ─────────────────────────────────────────────────────────
  // NPC 상호작용
  // ─────────────────────────────────────────────────────────

  _findNearbyNpc() {
    let closest = null;
    let minDist = CONFIG.INTERACT_DIST;
    for (const [key, npc] of Object.entries(this.npcs)) {
      if (!npc.visible) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (dist < minDist) { minDist = dist; closest = key; }
    }
    return closest;
  }

  _interactWithNpc(npcKey) {
    const mission = this.mission;
    this.talkingNpc = npcKey;

    if (npcKey === 'jung_sunbae') {
      if (!mission.isCompleted('chat_builder')) mission.startStage(1);
      else if (mission.allCompleted) {
        this.dialog.startDialog(SCRIPTS.ending_intro, () => {
          this.talkingNpc = null;
          this._setNpcMarker('jung_sunbae', '✅');
          // 플레이타임 계산 후 EndingScene으로 전달
          const elapsed = Date.now() - this.gameStartTime;
          this.scene.stop('UIScene');
          this.scene.start('EndingScene', { playTime: elapsed });
        });
      }
      return;
    }
    if (npcKey === 'park_juim') {
      if (!mission.isCompleted('auto_rag')) mission.startStage(2);
      return;
    }
    if (npcKey === 'choi_gwajang') {
      if (!mission.isCompleted('mcp_connect')) mission.startStage(3);
      return;
    }
    if (npcKey === 'kim_daeri') {
      // FAQ 이미 완료 → 아무 반응 없음
      if (this.kimFaqDone) {
        this.talkingNpc = null;
        return;
      }
      // FAQ 시작: 인트로 대사 → FAQ 선택지
      this.dialog.startDialog(SCRIPTS.kimdarei_intro, () => {
        this._showFaq();
      });
      return;
    }
  }

  /** 김대리 FAQ 선택지 표시 */
  _showFaq() {
    // 혹시라도 이미 완료 상태면 즉시 종료
    if (this.kimFaqDone) {
      this.talkingNpc = null;
      this.dialog.close();
      return;
    }

    const faq = SCRIPTS.kimdarei_faq;
    const choices = faq.questions.map((q, i) => ({
      label: String(i),
      text: q.label,
    }));

    this.dialog.showChoices(choices, (selectedLabel) => {
      const idx = Number(selectedLabel);
      const q = faq.questions[idx];

      if (q && q.isExit) {
        // ── FAQ 종료 ──
        // 1. 즉시 완료 플래그 설정 (콜백 전에!)
        this.kimFaqDone = true;
        // 2. 종료 대사 출력
        this.dialog.startDialog(q.answer, () => {
          // 3. 대사 끝난 후 마커 변경 + 정리
          this._setNpcMarker('kim_daeri', '✅');
          this.talkingNpc = null;
        });
      } else if (q) {
        // ── 일반 답변 → 다시 FAQ 선택지 ──
        this.dialog.startDialog(q.answer, () => {
          this._showFaq();
        });
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  // 로비 문 특별 대사 (자동 트리거)
  // ─────────────────────────────────────────────────────────

  /** 로비 문 근처 접근 시 대사 자동 재생 (영역: x:80-220, y:10-130) */
  _checkLobbyDoor() {
    const px = this.player.x;
    const py = this.player.y;

    // 영역 판정 (충돌 벽 바로 앞까지 포함)
    const inRange = px >= 80 && px <= 220 && py >= 10 && py <= 130;

    // 근접 시 대사 트리거 (대화 중이 아닐 때만)
    if (inRange && !this._doorTriggered && !this.dialog.isActive) {
      this._doorTriggered = true;
      this.dialog.startDialog(SCRIPTS.lobby_door);
    }

    // 영역 밖으로 나가면 다시 트리거 가능
    if (!inRange) {
      this._doorTriggered = false;
    }
  }

  // ─────────────────────────────────────────────────────────
  // ESC 키 대화 종료 (update 루프에서 JustDown 체크)
  // ─────────────────────────────────────────────────────────

  /** ESC 처리 — 미션 중 차단, 일반 대화만 종료 */
  _handleEsc() {
    if (!this.dialog.isActive) return;

    // 미션 퀴즈/매칭 진행 중이면 ESC 무시
    if (this.mission.currentStage > 0) return;

    // NPC별 종료 대사
    const ESC_LINES = {
      jung_sunbae:  '궁금한 거 있으면 언제든 말해!',
      park_juim:    '또 물어보고 싶은 거 있으면 와!',
      choi_gwajang: '더 궁금한 거 있으면 찾아와.',
      kim_daeri:    '궁금한 거 있으면 찾아와~',
    };

    const npcKey = this.talkingNpc;
    this.talkingNpc = null;

    // 현재 대화 강제 종료 (콜백 실행 안 함)
    this.dialog.forceClose();

    // NPC 종료 대사가 있으면 출력
    if (npcKey && ESC_LINES[npcKey]) {
      const NPC_NAMES = {
        jung_sunbae: '정선배', park_juim: '박주임',
        choi_gwajang: '최과장', kim_daeri: '김대리',
      };
      this.dialog.startDialog([
        { speaker: npcKey, name: NPC_NAMES[npcKey], text: ESC_LINES[npcKey] },
      ]);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 애니메이션
  // ─────────────────────────────────────────────────────────

  createAnimations() {
    ['DOWN', 'LEFT', 'RIGHT', 'UP'].forEach((dir) => {
      const f = FRAME[dir];
      this.anims.create({
        key: `dotori_walk_${dir}`,
        frames: this.anims.generateFrameNumbers('dotori', {
          frames: [f.start, f.start + 1, f.start + 2, f.start + 3],
        }),
        frameRate: 8, repeat: -1,
      });
    });
  }

  // ─────────────────────────────────────────────────────────
  // 업데이트 루프
  // ─────────────────────────────────────────────────────────

  update() {
    const { player, cursors, wasd } = this;

    // ESC 키 체크 (대화 중일 때만, JustDown으로 한 번만)
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this._handleEsc();
    }

    // 대화 종료 직후 쿨다운 (스페이스가 즉시 NPC 상호작용으로 전달되는 것 방지)
    if (this._dialogCooldown > 0) {
      this._dialogCooldown--;
    }

    if (this.dialog.isActive) {
      player.setVelocity(0);
      player.anims.stop();
      player.setFrame(IDLE_FRAME[this.facing]);
      // 대화 중이면 쿨다운 리셋 (대화 끝나는 시점에 자동 적용)
      this._dialogCooldown = 6;
      return;
    }

    // 이스터에그 근접 반짝임 업데이트
    this._updateEasterEggGlow();

    // 로비 문 근처 자동 대사 트리거
    this._checkLobbyDoor();

    // 쿨다운 중이면 상호작용 무시
    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this._dialogCooldown === 0) {
      // NPC 우선, 없으면 이스터에그 체크
      const nearbyNpc = this._findNearbyNpc();
      if (nearbyNpc) { this._interactWithNpc(nearbyNpc); return; }
      const nearbyEgg = this._findNearbyEasterEgg();
      if (nearbyEgg) { this._interactWithEasterEgg(nearbyEgg); return; }
    }

    player.setVelocity(0);
    let moving = false;
    let dir = this.facing;

    if (cursors.left.isDown || wasd.left.isDown) {
      player.setVelocityX(-CONFIG.PLAYER_SPEED); dir = 'LEFT'; moving = true;
    } else if (cursors.right.isDown || wasd.right.isDown) {
      player.setVelocityX(CONFIG.PLAYER_SPEED); dir = 'RIGHT'; moving = true;
    }
    if (cursors.up.isDown || wasd.up.isDown) {
      player.setVelocityY(-CONFIG.PLAYER_SPEED); dir = 'UP'; moving = true;
    } else if (cursors.down.isDown || wasd.down.isDown) {
      player.setVelocityY(CONFIG.PLAYER_SPEED); dir = 'DOWN'; moving = true;
    }

    if (player.body.velocity.length() > 0) {
      player.body.velocity.normalize().scale(CONFIG.PLAYER_SPEED);
    }

    if (moving) {
      this.facing = dir;
      const animKey = `dotori_walk_${dir}`;
      if (player.anims.currentAnim?.key !== animKey) player.anims.play(animKey, true);
    } else {
      player.anims.stop();
      player.setFrame(IDLE_FRAME[this.facing]);
    }
  }
}
