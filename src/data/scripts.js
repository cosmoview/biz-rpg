// ============================================================
// scripts.js — 전체 대사 및 미션 데이터 v9
// 모든 대사, 선택지, 정오답, 이미지 슬롯 트리거를 여기서만 관리
// GameScene/DialogSystem에 대사 직접 하드코딩 금지
// 구글시트 → CSV → 이 파일로 자동 변환됨
// ============================================================

export const SCRIPTS = {

  // ────────────────────────────────────────────────────────
  // 프롤로그: 로비
  // 도토리 혼자 독백. NPC 없음. 플레이어가 직접 내 자리로 이동.
  // ────────────────────────────────────────────────────────
  prologue: [
    { speaker: 'dotori', name: '', italic: true,  text: '(드디어 첫 출근이다... 긴장되는데.)' },
    { speaker: 'dotori', name: '', italic: true,  text: '(에이닷 비즈라는 AI 플랫폼 쓴다고 했는데, 어떤 건지 모르겠어.)' },
    { speaker: 'dotori', name: '', italic: false, text: '일단 자리부터 찾아가야지.' },
  ],

  // ────────────────────────────────────────────────────────
  // 스테이지 1: 내 자리 — 바이브코딩
  // 정선배가 처음부터 내 자리에 대기. 말 걸면 인트로 시작.
  // ────────────────────────────────────────────────────────
  stage1_intro: [
    { speaker: 'jung_sunbae', name: '정선배', text: '어, 도토리 왔구나! 첫 출근 축하해.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '여기가 네 자리야. 우리 팀은 에이닷 비즈 2.0으로 일해.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '에이전트가 뭐냐면... 나 대신 일해주는 AI 비서야.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '코딩 안 해도 돼. 그냥 말로 하면 돼.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '예전엔 프롬프트 쓰다가 점심시간 다 갔거든... 지금 생각하면 눈물 나.' },
    { speaker: 'system',      name: '',       text: '', showScreen: 'screen_1' },
    { speaker: 'jung_sunbae', name: '정선배', text: '온보딩 에이전트 한번 만들어볼까?' },
  ],

  stage1_mission: {
    type: 'choice',
    choices: [
      { label: 'A', text: '"온보딩 안내를 도와주는 에이전트를 만들어줘"', correct: true  },
      { label: 'B', text: '"구글에서 \'신입사원 온보딩 체크리스트\' 검색해줘"', correct: false },
      { label: 'C', text: '"내일부터 출근 안 해도 되는 에이전트 만들어줘"', correct: false },
    ],
    feedback: {
      A: [
        { speaker: 'jung_sunbae', name: '정선배', text: '딩동댕! 바로 그거야. 이렇게 자연스럽게 말하면 돼.' },
        { speaker: 'system',      name: '',       text: '', showScreen: 'screen_2' },
        { speaker: 'jung_sunbae', name: '정선배', text: '봐봐, 프롬프트 구성, 에이전트 이름, 태그, 소개 문구까지 한 번에 만들어졌지?' },
        { speaker: 'jung_sunbae', name: '정선배', text: '말만 하면 AI가 알아서 설계해주는 거야. 이게 바이브코딩이야.' },
      ],
      B: [
        { speaker: 'jung_sunbae', name: '정선배', text: '구글 검색은 네가 직접 해도 되잖아. 지금은 에이전트를 \'만드는\' 거야! 다시 해볼까?' },
      ],
      C: [
        { speaker: 'jung_sunbae', name: '정선배', text: '하하... 그 마음은 이해하는데, 그런 에이전트는 아직 세상에 없어. 업무용으로 다시 해볼까?' },
      ],
    },
  },

  stage1_clear: [
    { speaker: 'jung_sunbae', name: '정선배', text: '이제 \'어떻게 만들지?\'가 아니라 \'무엇을 만들지?\'만 고민하면 돼.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '다음은 자료실. 박주임님이 기다리고 있어.' },
  ],

  // ────────────────────────────────────────────────────────
  // 스테이지 2: 자료실 — 팀즈 연동
  // 스테이지 1 클리어 후 자료실 잠금 해제. 박주임 ❗ 등장.
  // ────────────────────────────────────────────────────────
  stage2_intro: [
    { speaker: 'park_juim', name: '박주임', text: '어머, 새로 온 도토리구나? 반가워!' },
    { speaker: 'park_juim', name: '박주임', text: '에이전트한테 자료를 넣어줘야 똑똑해져. 빈 머리론 아무것도 못 하거든.' },
    { speaker: 'park_juim', name: '박주임', text: '파일 하나하나 올릴 필요 없어. 팀즈 폴더 연결하면 끝이야.' },
    { speaker: 'park_juim', name: '박주임', text: '내가 처음 알았을 때 허무했어 진짜.' },
    { speaker: 'system',    name: '',       text: '', showScreen: 'screen_3' },
    { speaker: 'park_juim', name: '박주임', text: '어떤 폴더를 연결해야 할까?' },
  ],

  stage2_mission: {
    type: 'choice',
    choices: [
      { label: 'A', text: '📁 내 개인 메모',          correct: false },
      { label: 'B', text: '📁 팀 공유 - 온보딩 자료', correct: true  },
      { label: 'C', text: '📁 점심 맛집 리스트',       correct: false },
    ],
    feedback: {
      A: [
        { speaker: 'park_juim', name: '박주임', text: '그건 네 일기장이야 도토리... 개인 메모 말고 팀 전체가 쓰는 공유 폴더를 골라봐.' },
      ],
      B: [
        { speaker: 'park_juim', name: '박주임', text: '정답! 팀 공유 폴더를 연결하면 거기 있는 자료를 에이전트가 바로 참고할 수 있어.' },
        { speaker: 'system',    name: '',       text: '', showScreen: 'screen_4' },
        { speaker: 'park_juim', name: '박주임', text: '팀즈에 자료 업데이트하면 에이전트도 자동으로 최신 상태가 돼.' },
        { speaker: 'park_juim', name: '박주임', text: '일을 두 번 안 해도 되는 거지. 편한 세상이야 정말.' },
      ],
      C: [
        { speaker: 'park_juim', name: '박주임', text: '맛집 에이전트는 나중에 만들자! 지금은 업무용 폴더를 골라봐.' },
      ],
    },
  },

  stage2_clear: [
    { speaker: 'park_juim', name: '박주임', text: '다음은 회의실. 최과장님이 기다리고 있어.' },
  ],

  // ────────────────────────────────────────────────────────
  // 스테이지 3: 회의실 — MCP 연결
  // 스테이지 2 클리어 후 회의실 잠금 해제. 최과장 ❗ 등장.
  // ────────────────────────────────────────────────────────
  stage3_intro: [
    { speaker: 'choi_gwajang', name: '최과장', text: '오, 도토리? 들어와.' },
    { speaker: 'choi_gwajang', name: '최과장', text: '에이전트 만들고 자료도 연결했다며? 근데 아직 반쪽짜리야.' },
    { speaker: 'choi_gwajang', name: '최과장', text: 'MCP가 뭐냐고? USB 같은 건데, AI용이야. 꽂으면 바로 쓰는 거.' },
    { speaker: 'choi_gwajang', name: '최과장', text: '한 번 만들어두면 여러 에이전트에서 재사용도 되고.' },
    { speaker: 'system',       name: '',       text: '', showScreen: 'screen_5' },
    { speaker: 'choi_gwajang', name: '최과장', text: '업무 요청마다 어떤 도구를 연결해야 할까?' },
  ],

  stage3_mission: {
    type: 'matching',
    tasks: [
      { id: 'mail',  label: '어제 온 메일 중 중요한 거 요약해줘', answer: 'outlook'  },
      { id: 'pdf',   label: '이 견적서 PDF에서 금액 뽑아줘',       answer: 'azure_di' },
      { id: 'chart', label: '뽑은 데이터를 차트로 보여줘',         answer: 'plotly'   },
    ],
    tools: [
      { id: 'outlook',  label: '📧 아웃룩 메일' },
      { id: 'azure_di', label: '📄 문서 추출 (Azure DI)' },
      { id: 'plotly',   label: '📊 시각화 (Plotly)' },
    ],
    wrongFeedback: [
      { speaker: 'choi_gwajang', name: '최과장', text: '음, 그건 좀 다른데? 다시 생각해봐. 메일 관련이면 메일 도구, 문서 분석이면 추출 도구, 그래프면 시각화 도구야.' },
    ],
    correctFeedback: [
      { speaker: 'choi_gwajang', name: '최과장', text: '완벽해! 센스 있는데?' },
      { speaker: 'system',       name: '',       text: '', showScreen: 'screen_6' },
      { speaker: 'choi_gwajang', name: '최과장', text: 'MCP 연결하면 에이전트가 직접 메일 읽고, 문서 분석하고, 차트까지 만들어.' },
      { speaker: 'choi_gwajang', name: '최과장', text: '답변만 하는 챗봇이 아니라 진짜 업무 파트너가 되는 거지.' },
    ],
  },

  stage3_clear: [
    { speaker: 'choi_gwajang', name: '최과장', text: '자, 이제 네 자리로 돌아가서 일을 시작해봐!' },
  ],
  // 스테이지 3 클리어 후:
  // - 정선배 ✅ → ❗ 재등장 (내 자리)
  // - 김대리 없음 → ❗ 등장 (휴게실)

  // ────────────────────────────────────────────────────────
  // 엔딩: 내 자리
  // 플레이어가 직접 걸어서 내 자리 복귀 후 정선배 ❗ 에게 말 걸기
  // ────────────────────────────────────────────────────────
  ending_intro: [
    { speaker: 'jung_sunbae', name: '정선배', text: '도토리, 벌써 다 돌아봤어? 역시 신입 중 최고다.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '오늘 배운 거 정리해볼까?' },
  ],
  // 위 대사 완료 → 스킬카드 3장 연출 (EndingScene 처리)
  // 스킬카드 합체 → 마스터 뱃지 변환 → 아래 후속 대사

  ending_after_cards: [
    { speaker: 'jung_sunbae', name: '정선배', text: 'AI가 질문에 답해주는 도구가 아니라, 업무를 함께 수행하는 파트너가 된 거지.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '이제 도토리도 에이닷 비즈 마스터야.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '점심 뭐 먹을지 에이전트한테... 아 그건 아직 안 된다고 했지.' },
  ],
  // 대사 완료 → 🎉 첫 출근 완료! + 플레이타임 + [다시 하기] 버튼

  // ────────────────────────────────────────────────────────
  // 히든 FAQ: 휴게실 — 김대리
  // 스테이지 3 클리어 후 ❗ 등장. 선택사항. 반복 선택 가능.
  // ────────────────────────────────────────────────────────
  kimdarei_intro: [
    { speaker: 'kim_daeri', name: '김대리', text: '아, 도토리? 나 김대리. 여기서 이것저것 물어보는 사람들이 많아서, 에이닷 비즈 FAQ 담당이 됐어. 비공식적으로.' },
    { speaker: 'kim_daeri', name: '김대리', text: '뭐 궁금한 거 있어?' },
  ],

  kimdarei_faq: {
    type: 'faq',
    questions: [
      {
        label: '기존 에이전트는 유지되나요?',
        answer: [{ speaker: 'kim_daeri', name: '김대리', text: '걱정 마, 기존에 만든 에이전트 다 유지돼. 2.0으로 업데이트돼도 리셋 같은 거 없어!' }],
      },
      {
        label: '개발자 모드는 쓸 수 있나요?',
        answer: [{ speaker: 'kim_daeri', name: '김대리', text: '응, 고급 사용자용으로 개발자 모드도 그대로 있어. 프롬프트 직접 수정하고 싶은 사람은 그쪽으로 가면 돼.' }],
      },
      {
        label: 'MCP 추가 요청은 어떻게 하나요?',
        answer: [{ speaker: 'kim_daeri', name: '김대리', text: '필요한 MCP가 있으면 요청할 수 있어. 요청하면 검토 후에 추가해준대. 적극적으로 활용해봐!' }],
      },
      {
        label: '만들다 오류가 나면요?',
        answer: [{ speaker: 'kim_daeri', name: '김대리', text: '당황하지 말고 다시 시도해봐. 그래도 안 되면 관리자한테 문의하면 돼. 다들 처음엔 그래.' }],
      },
      {
        label: '그만 물어볼게',
        isExit: true,
        answer: [{ speaker: 'kim_daeri', name: '김대리', text: '또 궁금한 거 있으면 언제든 와. 나 여기 항상 있어. ...커피가 맛있어서 그런 거야.' }],
      },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 이스터에그 (✦ 오브젝트 조사 시)
  // ────────────────────────────────────────────────────────
  easter_eggs: {
    easter_box: [
      { speaker: 'system', name: '[시스템]', italic: true, text: '먼지 쌓인 상자에 \'USB 3,000개 (2019년 교육자료)\' 라벨이 붙어있다.' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '팀즈 연동이 있었으면...' },
    ],
    easter_whiteboard: [
      { speaker: 'system', name: '[시스템]', italic: true, text: '화이트보드에 누군가 그린 그림이 있다.' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '[에이전트 1.0] → 질문 → 대답 → 끝' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '[에이전트 2.0] → 질문 → 메일 확인 → 문서 분석 → 차트 생성 → 보고서 작성 → 커피 타기(예정)' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '밑에 작은 글씨: \'커피는 아직 안 됩니다 - IT팀\'' },
    ],
    easter_coffee: [
      { speaker: 'system', name: '[시스템]', italic: true, text: '커피머신에 포스트잇이 붙어있다.' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '\'에이전트한테 커피 타달라고 하지 마세요. 아직 MCP 미지원입니다. - IT팀\'' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '그 밑에 또 다른 포스트잇: \'빨리 지원해주세요 - 전 직원 일동\'' },
    ],
    easter_fridge: [
      { speaker: 'system', name: '[시스템]', italic: true, text: '냉장고에 메모가 붙어있다.' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '\'내 푸딩 가져간 사람 에이전트로 찾겠습니다\'' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '밑에 \'진심임\' 이라고 추가되어있다.' },
    ],
    easter_table: [
      { speaker: 'system', name: '[시스템]', italic: true, text: '탁자 위에 신문이 놓여있다.' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '「에이닷 비즈 회의록이 업그레이드 된다!」' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '에이닷 노트의 특장점을 모두 흡수~ 5월 예정' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 잠긴 구역 안내 메시지
  // ────────────────────────────────────────────────────────
  locked_messages: {
    barrier_jaryosil: '아직 갈 수 없는 것 같다. 먼저 바이브코딩을 완료하자.',
    barrier_hoeuisil: '아직 갈 수 없는 것 같다. 먼저 팀즈 연동을 완료하자.',
  },

  // ────────────────────────────────────────────────────────
  // 로비 문 특별 대사
  // ────────────────────────────────────────────────────────
  lobby_door: [
    { speaker: 'dotori', name: '', italic: true, text: '(출근했는데 퇴근 생각을?)' },
    { speaker: 'dotori', name: '', italic: false, text: '힘을 내자..!' },
  ],
};

// ────────────────────────────────────────────────────────
// 스킬카드 데이터
// ────────────────────────────────────────────────────────
export const SKILL_CARDS = [
  {
    id:    'vibe_coding',
    icon:  '🗣️',
    title: '바이브코딩',
    desc1: '자연어로 말하면 AI 에이전트가 자동 생성!',
    desc2: '프롬프트, 이름, 태그, 소개문구까지 한 번에.',
  },
  {
    id:    'teams_sync',
    icon:  '📂',
    title: '팀즈 연동',
    desc1: '팀즈 공유 폴더를 지식베이스로 바로 연결!',
    desc2: '자료가 업데이트되면 에이전트도 자동 반영.',
  },
  {
    id:    'mcp_connect',
    icon:  '🔌',
    title: 'MCP 연결',
    desc1: '메일, 문서, 시각화 등 외부 도구를 에이전트에 연결!',
    desc2: 'AI가 대답만 하는 게 아니라, 직접 실행까지.',
  },
];

// ────────────────────────────────────────────────────────
// 미션 상태 초기값
// ────────────────────────────────────────────────────────
export const MISSION_INITIAL = {
  vibe_coding: false,
  teams_sync:  false,
  mcp_connect: false,
};

// ────────────────────────────────────────────────────────
// NPC 이모지 매핑
// ────────────────────────────────────────────────────────
export const NPC_EMOJI = {
  dotori:       '🧑‍💼',
  jung_sunbae:  '🧑‍💼',
  park_juim:    '👩‍💼',
  choi_gwajang: '👩‍💼',
  kim_daeri:    '🧑‍💻',
  system:       '',
};
