// ============================================================
// MissionSystem.js — 미션 상태 관리, 잠금 해제 트리거 v11
// 다단계 미션 지원: stage{N}_missions 배열을 순차 진행
// 미션마다 nextLines로 분기 대사 흡수, 마지막 정답 후 clear → 잠금 해제
// 모든 대사는 scripts.js에서만 가져옴 — 하드코딩 금지
// ============================================================

import { SCRIPTS, MISSION_INITIAL, SKILL_CARDS } from '../data/scripts.js';

/** 스테이지 → 미션ID 매핑 */
const STAGE_MISSION_MAP = {
  1: 'meeting',
  2: 'report',
  3: 'news',
};

/** 스테이지 → 스킬카드 인덱스 매핑 (SKILL_CARDS 배열 순서와 동일) */
const STAGE_SKILL_INDEX = {
  1: 0,  // 회의록 자동화
  2: 1,  // AI 보고서
  3: 2,  // 뉴스 큐레이션
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

    /** 미션 완료 상태 (meeting / report / news) */
    this.missionState = { ...MISSION_INITIAL };

    /** 현재 진행 중인 스테이지 (0=없음, 1~3) */
    this.currentStage = 0;

    /** 현재 진행 중인 미션 인덱스 (스테이지 내 몇 번째 미션) */
    this._currentMissionIndex = 0;
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
   * 스테이지 시작 (인트로 대사 → 첫 미션 출제)
   * @param {number} stage — 1, 2, 3
   * @param {Function} [onStageComplete] — 스테이지 클리어 후 콜백
   */
  startStage(stage, onStageComplete) {
    this.currentStage = stage;
    this._currentMissionIndex = 0;

    const introKey = `stage${stage}_intro`;
    const introLines = SCRIPTS[introKey];

    if (!introLines) return;

    // 인트로 대사 재생 → 완료 후 첫 미션 출제
    this.dialog.startDialog(introLines, () => {
      this._presentCurrentMission(stage, onStageComplete);
    });
  }

  // ─────────────────────────────────────────────────────────
  // 미션 출제 (다단계)
  // ─────────────────────────────────────────────────────────

  /**
   * 현재 인덱스의 미션을 출제
   * 마지막 미션을 넘어서면 stage{N}_clear 재생 → 미션 완료 처리
   */
  _presentCurrentMission(stage, onStageComplete) {
    const missionsKey = `stage${stage}_missions`;
    const missions = SCRIPTS[missionsKey];

    if (!missions || missions.length === 0) {
      // 미션 데이터 없으면 즉시 클리어 처리
      this._playClearDialog(stage, onStageComplete);
      return;
    }

    const idx = this._currentMissionIndex;

    // 모든 미션 완료 → 클리어 대사 → 완료 처리
    if (idx >= missions.length) {
      this._playClearDialog(stage, onStageComplete);
      return;
    }

    const mission = missions[idx];

    if (mission.type === 'choice') {
      this._presentChoiceMission(stage, mission, onStageComplete);
    }
    // 추후 다른 미션 타입 추가 시 여기에 분기 추가
  }

  // ─────────────────────────────────────────────────────────
  // 선택지 퀴즈
  // ─────────────────────────────────────────────────────────

  /** 선택지 퀴즈 표시 (질문 + 선택지) */
  _presentChoiceMission(stage, mission, onStageComplete) {
    // 질문 텍스트 결정 우선순위:
    // 1) mission.questionLine (각 미션이 직접 지정한 질문)
    // 2) 첫 번째 미션이면 인트로 마지막 대사를 질문으로 재활용
    // 3) 없으면 질문 없이 선택지만 표시
    let questionLine = mission.questionLine || null;

    if (!questionLine && this._currentMissionIndex === 0) {
      const introLines = SCRIPTS[`stage${stage}_intro`];
      const lastIntro = introLines ? introLines[introLines.length - 1] : null;
      // showScreen 트리거가 아닌 실제 대사만 질문으로 사용
      if (lastIntro && !lastIntro.showScreen) {
        questionLine = lastIntro;
      }
    }

    // 대화창에 질문 + 선택지 표시
    this.dialog.showChoices(mission.choices, (selectedLabel) => {
      const selected = mission.choices.find((c) => c.label === selectedLabel);

      if (selected && selected.correct) {
        this._onCorrectAnswer(stage, mission, selectedLabel, onStageComplete);
      } else {
        this._onWrongAnswer(stage, mission, selectedLabel, onStageComplete);
      }
    }, questionLine);
  }

  /** 정답 처리 — 피드백 → nextLines(있으면) → 다음 미션 */
  _onCorrectAnswer(stage, mission, label, onStageComplete) {
    // 정답 이펙트
    this._flashCorrect();

    // 정답 피드백 대사 재생
    const feedbackLines = mission.feedback ? mission.feedback[label] : null;

    const afterFeedback = () => {
      // nextLines가 있으면 분기 대사 재생 후 다음 미션으로
      if (mission.nextLines && mission.nextLines.length > 0) {
        this.dialog.startDialog(mission.nextLines, () => {
          this._advanceToNextMission(stage, onStageComplete);
        });
      } else {
        this._advanceToNextMission(stage, onStageComplete);
      }
    };

    if (feedbackLines && feedbackLines.length > 0) {
      this.dialog.startDialog(feedbackLines, afterFeedback);
    } else {
      afterFeedback();
    }
  }

  /** 오답 처리 — 피드백 → 같은 미션 재시도 */
  _onWrongAnswer(stage, mission, label, onStageComplete) {
    // 오답 이펙트
    this._shakeScreen();

    // 오답 피드백 대사 재생 → 재시도
    const feedbackLines = mission.feedback ? mission.feedback[label] : null;
    if (feedbackLines && feedbackLines.length > 0) {
      this.dialog.startDialog(feedbackLines, () => {
        // 같은 미션 다시 출제 (인덱스 변경 없음)
        this._presentChoiceMission(stage, mission, onStageComplete);
      });
    } else {
      this._presentChoiceMission(stage, mission, onStageComplete);
    }
  }

  /** 다음 미션으로 진행 (인덱스 증가 후 출제) */
  _advanceToNextMission(stage, onStageComplete) {
    this._currentMissionIndex++;
    this._presentCurrentMission(stage, onStageComplete);
  }

  // ─────────────────────────────────────────────────────────
  // 클리어 처리
  // ─────────────────────────────────────────────────────────

  /** 클리어 대사 재생 → 미션 상태 업데이트 → 잠금 해제 */
  _playClearDialog(stage, onStageComplete) {
    const clearKey = `stage${stage}_clear`;
    const clearLines = SCRIPTS[clearKey];

    if (clearLines && clearLines.length > 0) {
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
    this._currentMissionIndex = 0;

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