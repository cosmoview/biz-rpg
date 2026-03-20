// ============================================================
// MissionSystem.js — 미션 상태 관리, 잠금 해제 트리거
// 선택지 퀴즈(stage1/2) + 매칭 미션(stage3) + 클리어 처리
// 모든 대사는 scripts.js에서만 가져옴 — 하드코딩 금지
// ============================================================

import { SCRIPTS, MISSION_INITIAL, SKILL_CARDS } from '../data/scripts.js';

/** 스테이지 → 미션ID 매핑 */
const STAGE_MISSION_MAP = {
  1: 'vibe_coding',
  2: 'teams_sync',
  3: 'mcp_connect',
};

/** 스테이지 → 스킬카드 인덱스 매핑 */
const STAGE_SKILL_INDEX = {
  1: 0,  // 바이브코딩
  2: 1,  // 팀즈 연동
  3: 2,  // MCP 연결
};

export default class MissionSystem {
  /**
   * @param {Phaser.Scene} scene — 게임 씬 (GameScene)
   * @param {import('./DialogSystem.js').default} dialog — 대화 시스템
   */
  constructor(scene, dialog) {
    /** 게임 씬 참조 */
    this.scene = scene;

    /** 대화 시스템 참조 */
    this.dialog = dialog;

    /** 미션 완료 상태 (vibe_coding / teams_sync / mcp_connect) */
    this.missionState = { ...MISSION_INITIAL };

    /** 현재 진행 중인 스테이지 (0=없음, 1~3) */
    this.currentStage = 0;

    /** 스테이지 3 매칭 결과 임시 저장 */
    this._matchingAnswers = {};
  }

  // ─────────────────────────────────────────────────────────
  // 공개 API
  // ─────────────────────────────────────────────────────────

  /** 완료된 미션 수 */
  get completedCount() {
    return Object.values(this.missionState).filter(Boolean).length;
  }

  /** 특정 미션이 완료되었는지 확인 */
  isCompleted(missionId) {
    return this.missionState[missionId] === true;
  }

  /** 모든 미션 완료 여부 */
  get allCompleted() {
    return this.completedCount === 3;
  }

  /**
   * 스테이지 시작 (인트로 대사 → 미션 출제)
   * @param {number} stage — 1, 2, 3
   * @param {Function} [onStageComplete] — 스테이지 클리어 후 콜백
   */
  startStage(stage, onStageComplete) {
    this.currentStage = stage;
    const introKey = `stage${stage}_intro`;
    const introLines = SCRIPTS[introKey];

    if (!introLines) return;

    // 인트로 대사 재생 → 완료 후 미션 출제
    this.dialog.startDialog(introLines, () => {
      this._presentMission(stage, onStageComplete);
    });
  }

  // ─────────────────────────────────────────────────────────
  // 미션 출제
  // ─────────────────────────────────────────────────────────

  /** 스테이지에 맞는 미션 출제 */
  _presentMission(stage, onStageComplete) {
    const missionKey = `stage${stage}_mission`;
    const mission = SCRIPTS[missionKey];

    if (!mission) return;

    if (mission.type === 'choice') {
      this._presentChoiceMission(stage, mission, onStageComplete);
    } else if (mission.type === 'matching') {
      this._presentMatchingMission(stage, mission, onStageComplete);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 선택지 퀴즈 (stage1, stage2)
  // ─────────────────────────────────────────────────────────

  /** 선택지 퀴즈 표시 */
  _presentChoiceMission(stage, mission, onStageComplete) {
    // 인트로 마지막 대사를 질문 텍스트로 사용
    const introKey = `stage${stage}_intro`;
    const introLines = SCRIPTS[introKey];
    const lastIntroLine = introLines ? introLines[introLines.length - 1] : null;
    // showScreen이 아닌 실제 대사만 질문으로 표시
    const questionLine = (lastIntroLine && !lastIntroLine.showScreen) ? lastIntroLine : null;

    // 대화창에 질문 텍스트 + 선택지 표시
    this.dialog.showChoices(mission.choices, (selectedLabel) => {
      // 선택된 항목 찾기
      const selected = mission.choices.find((c) => c.label === selectedLabel);

      if (selected && selected.correct) {
        // ── 정답 ──
        this._onCorrectAnswer(stage, mission, selectedLabel, onStageComplete);
      } else {
        // ── 오답 ──
        this._onWrongAnswer(stage, mission, selectedLabel, onStageComplete);
      }
    }, questionLine);
  }

  /** 정답 처리 (선택지) */
  _onCorrectAnswer(stage, mission, label, onStageComplete) {
    // 초록 반짝임 이펙트
    this._flashCorrect();

    // 정답 피드백 대사 재생
    const feedbackLines = mission.feedback[label];
    if (feedbackLines) {
      this.dialog.startDialog(feedbackLines, () => {
        // 클리어 대사 → 클리어 처리
        this._playClearDialog(stage, onStageComplete);
      });
    } else {
      this._playClearDialog(stage, onStageComplete);
    }
  }

  /** 오답 처리 (선택지) */
  _onWrongAnswer(stage, mission, label, onStageComplete) {
    // 화면 쉐이크 이펙트
    this._shakeScreen();

    // 오답 피드백 대사 재생 → 재시도
    const feedbackLines = mission.feedback[label];
    if (feedbackLines) {
      this.dialog.startDialog(feedbackLines, () => {
        // 재시도: 다시 선택지 표시
        this._presentChoiceMission(stage, mission, onStageComplete);
      });
    } else {
      this._presentChoiceMission(stage, mission, onStageComplete);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 매칭 미션 (stage3)
  // ─────────────────────────────────────────────────────────

  /** 매칭 미션 표시 (업무 하나씩 순서대로 출제) */
  _presentMatchingMission(stage, mission, onStageComplete) {
    this._matchingAnswers = {};
    this._presentMatchingStep(stage, mission, 0, onStageComplete);
  }

  /** 매칭 미션 한 단계 출제 */
  _presentMatchingStep(stage, mission, taskIndex, onStageComplete) {
    if (taskIndex >= mission.tasks.length) {
      // 모든 매칭 완료 → 전부 맞았는지 검증
      this._checkMatchingResult(stage, mission, onStageComplete);
      return;
    }

    const task = mission.tasks[taskIndex];

    // 업무 내용을 대사로 표시
    this.dialog.startDialog(
      [{ speaker: 'choi_gwajang', name: '최과장', text: task.label }],
      () => {
        // 도구 선택지 표시
        const toolChoices = mission.tools.map((t) => ({
          label: t.id,
          text: t.label,
        }));

        this.dialog.showChoices(toolChoices, (selectedToolId) => {
          // 선택 결과 저장
          this._matchingAnswers[task.id] = selectedToolId;
          // 다음 업무로
          this._presentMatchingStep(stage, mission, taskIndex + 1, onStageComplete);
        });
      }
    );
  }

  /** 매칭 결과 검증 */
  _checkMatchingResult(stage, mission, onStageComplete) {
    // 모든 답이 맞는지 확인
    const allCorrect = mission.tasks.every(
      (task) => this._matchingAnswers[task.id] === task.answer
    );

    if (allCorrect) {
      // ── 전부 정답 ──
      this._flashCorrect();
      const feedbackLines = mission.correctFeedback;
      this.dialog.startDialog(feedbackLines, () => {
        this._playClearDialog(stage, onStageComplete);
      });
    } else {
      // ── 하나라도 오답 ──
      this._shakeScreen();
      const feedbackLines = mission.wrongFeedback;
      this.dialog.startDialog(feedbackLines, () => {
        // 재시도: 처음부터 다시
        this._presentMatchingMission(stage, mission, onStageComplete);
      });
    }
  }

  // ─────────────────────────────────────────────────────────
  // 클리어 처리
  // ─────────────────────────────────────────────────────────

  /** 클리어 대사 재생 → 미션 상태 업데이트 → 잠금 해제 */
  _playClearDialog(stage, onStageComplete) {
    const clearKey = `stage${stage}_clear`;
    const clearLines = SCRIPTS[clearKey];

    if (clearLines) {
      this.dialog.startDialog(clearLines, () => {
        this._completeMission(stage, onStageComplete);
      });
    } else {
      this._completeMission(stage, onStageComplete);
    }
  }

  /** 미션 완료 상태 반영 + 잠금 해제 이벤트 발행 */
  _completeMission(stage, onStageComplete) {
    // 미션 상태 업데이트
    const missionId = STAGE_MISSION_MAP[stage];
    this.missionState[missionId] = true;
    this.currentStage = 0;

    // 미션 클리어 별 파티클 버스트
    if (this.scene.effects) this.scene.effects.starBurst();

    // 스킬카드 획득 이벤트 발행 (EffectSystem에서 수신)
    const skillCard = SKILL_CARDS[STAGE_SKILL_INDEX[stage]];
    this.scene.events.emit('skillCardAcquired', skillCard);

    // 잠금 해제 이벤트 발행 (GameScene에서 수신하여 NPC 마커 업데이트)
    this.scene.events.emit('stageCleared', stage);

    // 미션 상태 변경 이벤트 (UIScene HUD 업데이트용)
    this.scene.events.emit('missionStateChanged', { ...this.missionState });

    // 콜백 실행
    if (onStageComplete) onStageComplete(stage);
  }

  // ─────────────────────────────────────────────────────────
  // 이펙트 (EffectSystem 위임)
  // ─────────────────────────────────────────────────────────

  /** 정답 시 초록 반짝임 + 체크 이펙트 */
  _flashCorrect() {
    if (this.scene.effects) this.scene.effects.flashCorrect();
  }

  /** 오답 시 화면 쉐이크 */
  _shakeScreen() {
    if (this.scene.effects) this.scene.effects.shakeScreen();
  }
}
