// ============================================================
// scripts.js — 전체 대사 및 미션 데이터 v10
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
  // 스테이지 1: 내 자리 — 챗빌더 (Chat Builder)
  // 정선배가 처음부터 내 자리에 대기. 말 걸면 인트로 시작.
  // ────────────────────────────────────────────────────────
  stage1_intro: [
    { speaker: 'jung_sunbae', name: '정선배', text: '어, 도토리 왔구나! 첫 출근 축하해.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '여기가 네 자리야. 우리 팀은 에이닷 비즈 2.0으로 일해.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '에이전트가 뭐냐면... 나 대신 일해주는 AI 비서야.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '예전엔 에이전트 하나 만들려면 프롬프트 쓰다 점심시간 다 갔는데...' },
    { speaker: 'jung_sunbae', name: '정선배', text: '지금은 그냥 대화하듯 말하면 돼. 이게 Chat Builder야.' },
    { speaker: 'system',      name: '',       text: '', showScreen: 'screen_1' },
    { speaker: 'jung_sunbae', name: '정선배', text: '온보딩 에이전트 한번 만들어볼까? 그냥 말로 해봐.' },
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
        { speaker: 'jung_sunbae', name: '정선배', text: '딩동댕! 바로 그거야. Chat Builder는 이렇게 자연스러운 대화만으로 에이전트를 만들 수 있어.' },
        { speaker: 'system',      name: '',       text: '', showScreen: 'screen_2' },
        { speaker: 'jung_sunbae', name: '정선배', text: '봐봐, 프롬프트 구성, 이름, 태그, 소개 문구까지 자동 생성됐지?' },
        { speaker: 'jung_sunbae', name: '정선배', text: '고급 설정이 필요하면 시스템 프롬프트도 직접 수정할 수 있고, 테스트 후 바로 배포까지 돼.' },
        { speaker: 'jung_sunbae', name: '정선배', text: '말 한마디로 시작해서 배포까지. 이게 Chat Builder의 힘이야.' },
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
  // 스테이지 2: 자료실 — Auto-RAG
  // 스테이지 1 클리어 후 자료실 잠금 해제. 박주임 ❗ 등장.
  // ────────────────────────────────────────────────────────
  stage2_intro: [
    { speaker: 'park_juim', name: '박주임', text: '어머, 새로 온 도토리구나? 반가워!' },
    { speaker: 'park_juim', name: '박주임', text: '에이전트가 똑똑하려면 자료가 있어야 해. 빈 머리론 아무것도 못 하거든.' },
    { speaker: 'park_juim', name: '박주임', text: '근데 파일 하나하나 올리고 있으면 그게 일이잖아?' },
    { speaker: 'park_juim', name: '박주임', text: '그래서 Auto-RAG가 있는 거야.' },
    { speaker: 'park_juim', name: '박주임', text: 'Teams나 SharePoint 문서를 자동으로 연결해서, 에이전트가 알아서 참조해.' },
    { speaker: 'system',    name: '',       text: '', showScreen: 'screen_3' },
    { speaker: 'park_juim', name: '박주임', text: '자, 어떤 자료를 연결해볼까?' },
  ],

  stage2_mission: {
    type: 'choice',
    choices: [
      { label: 'A', text: '📁 내 일기장',             correct: false },
      { label: 'B', text: '📁 팀 공유 - 온보딩 자료', correct: true  },
      { label: 'C', text: '📁 점심 맛집 리스트',       correct: false },
    ],
    feedback: {
      A: [
        { speaker: 'park_juim', name: '박주임', text: '그건 네 일기장이야 도토리... 팀 전체가 쓰는 공유 자료를 골라봐.' },
      ],
      B: [
        { speaker: 'park_juim', name: '박주임', text: '정답! Teams 공유 폴더를 연결하면 에이전트가 바로 참고할 수 있어.' },
        { speaker: 'system',    name: '',       text: '', showScreen: 'screen_4' },
        { speaker: 'park_juim', name: '박주임', text: 'Auto-RAG는 파일만 되는 게 아니야. Teams, SharePoint 문서까지 직접 활용할 수 있어.' },
        { speaker: 'park_juim', name: '박주임', text: '자료가 업데이트되면 에이전트도 자동으로 최신 상태가 되고.' },
        { speaker: 'park_juim', name: '박주임', text: '일일이 업로드 안 해도 되는 세상이 온 거야. 편하지?' },
      ],
      C: [
        { speaker: 'park_juim', name: '박주임', text: '맛집 에이전트는 나중에 만들자! 지금은 업무용 자료를 골라봐.' },
      ],
    },
  },

  stage2_clear: [
    { speaker: 'park_juim', name: '박주임', text: '다음은 회의실. 최과장님이 기다리고 있어.' },
  ],

  // ────────────────────────────────────────────────────────
  // 스테이지 3: 회의실 — MCP 기반 기능 확장
  // 스테이지 2 클리어 후 회의실 잠금 해제. 최과장 ❗ 등장.
  // ────────────────────────────────────────────────────────
  stage3_intro: [
    { speaker: 'choi_gwajang', name: '최과장', text: '오, 도토리? 들어와.' },
    { speaker: 'choi_gwajang', name: '최과장', text: '에이전트 만들고 자료도 연결했다며? 근데 아직 반쪽짜리야.' },
    { speaker: 'choi_gwajang', name: '최과장', text: '진짜 일을 하려면 외부 도구가 필요해. 여기서 MCP가 등장하는 거야.' },
    { speaker: 'choi_gwajang', name: '최과장', text: 'MCP는 Model Context Protocol. 쉽게 말하면 AI용 USB야. 꽂으면 바로 쓰는 거.' },
    { speaker: 'choi_gwajang', name: '최과장', text: '기업에서 MCP를 한 번 등록하면, 그 회사 누구든 에이전트 만들 때 가져다 쓸 수 있어.' },
    { speaker: 'system',       name: '',       text: '', showScreen: 'screen_5' },
    { speaker: 'choi_gwajang', name: '최과장', text: '자, 업무 요청마다 어떤 도구를 연결해야 할까?' },
  ],

  stage3_mission: {
    type: 'matching',
    tasks: [
      { id: 'calendar', label: '내일 오전 회의 일정 잡아줘',           answer: 'outlook'  },
      { id: 'pdf',      label: '이 견적서 PDF에서 금액 뽑아줘',       answer: 'azure_di' },
      { id: 'chart',    label: '뽑은 데이터를 차트로 보여줘',         answer: 'plotly'   },
      { id: 'ocr',      label: '이 주민등록등본에서 주소 읽어줘',     answer: 'gov_ocr'  },
    ],
    tools: [
      { id: 'outlook',  label: '📅 Outlook 일정 연동' },
      { id: 'azure_di', label: '📄 Azure DI (문서 추출)' },
      { id: 'plotly',   label: '📊 시각화 도구' },
      { id: 'gov_ocr',  label: '🏛️ 관공서 OCR' },
    ],
    wrongFeedback: [
      { speaker: 'choi_gwajang', name: '최과장', text: '음, 그건 좀 다른데? 다시 생각해봐. 일정이면 Outlook, 문서 분석이면 Azure DI, 그래프면 시각화 도구, 관공서 서류면 OCR이야.' },
    ],
    correctFeedback: [
      { speaker: 'choi_gwajang', name: '최과장', text: '완벽해! 센스 있는데?' },
      { speaker: 'system',       name: '',       text: '', showScreen: 'screen_6' },
      { speaker: 'choi_gwajang', name: '최과장', text: 'MCP 연결하면 에이전트가 직접 일정 잡고, 문서 분석하고, 차트까지 만들어.' },
      { speaker: 'choi_gwajang', name: '최과장', text: '관공서 서류도 OCR로 읽어내니까, 수작업으로 타이핑하던 시대는 끝난 거야.' },
      { speaker: 'choi_gwajang', name: '최과장', text: '답변만 하는 챗봇이 아니라 진짜 업무 파트너가 되는 거지.' },
    ],
  },

  stage3_clear: [
    { speaker: 'choi_gwajang', name: '최과장', text: '자, 이제 네 자리로 돌아가서 일을 시작해봐!' },
  ],

  // ────────────────────────────────────────────────────────
  // 엔딩: 내 자리
  // ────────────────────────────────────────────────────────
  ending_intro: [
    { speaker: 'jung_sunbae', name: '정선배', text: '도토리, 벌써 다 돌아봤어? 역시 신입 중 최고다.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '오늘 배운 거 정리해볼까?' },
  ],

  ending_after_cards: [
    { speaker: 'jung_sunbae', name: '정선배', text: 'AI가 질문에 답해주는 도구가 아니라, 업무를 함께 수행하는 파트너가 된 거지.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '이제 도토리도 에이닷 비즈 마스터야.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '자 이제 에이전트한테 밥도 먹여달라고... 아 그건 아직 안 된다고 했지.' },
  ],

  // ────────────────────────────────────────────────────────
  // 히든 FAQ: 휴게실 — 김대리
  // ────────────────────────────────────────────────────────
  kimdarei_intro: [
    { speaker: 'kim_daeri', name: '김대리', text: '아, 도토리? 나 김대리. 커피 마시러 왔다가 에이닷 비즈 5월 업데이트 소식 들었는데... 꽤 크더라고.' },
    { speaker: 'kim_daeri', name: '김대리', text: '뭐 궁금한 거 있어?' },
  ],

  kimdarei_faq: {
    type: 'faq',
    questions: [
      {
        label: '5월에 회의록도 바뀐다고요?',
        answer: [{ speaker: 'kim_daeri', name: '김대리', text: '회의록이 완전히 달라진대! 에이닷 노트처럼 모바일도 지원하고 강력해진다고 하던데!' }],
      },
      {
        label: '에이닷 비즈 뉴스랑 보고서는요?',
        answer: [{ speaker: 'kim_daeri', name: '김대리', text: '5월에 뉴스랑 보고서도 업그레이드 된다고 하더라. 외부 데이터 활용을 더 잘할 수 있을 거 같아!' }],
      },
      {
        label: '6월엔요?',
        answer: [{ speaker: 'kim_daeri', name: '김대리', text: '오 이건 나도 최근에 들었는데! 스킬 기반 AI 툴이 나온다던데? 에이전트가 더 다양한 걸 할 수 있게 된다는 것 같더라고!!' }],
      },
      {
        label: '기대되는 거 있어요?',
        answer: [{ speaker: 'kim_daeri', name: '김대리', text: '솔직히? 커피 타주는 MCP... 아 그건 아직 미지원이라고 했지.' }],
      },
      {
        label: '그만 물어볼게요',
        isExit: true,
        answer: [{ speaker: 'kim_daeri', name: '김대리', text: '또 궁금한 거 생기면 와. 나 어차피 여기 맨날 있어. ...커피가 진짜 맛있어서 그런 거야. 진짜로.' }],
      },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 이스터에그 (✦ 오브젝트 조사 시)
  // ────────────────────────────────────────────────────────
  easter_eggs: {
    easter_box: [
      { speaker: 'system', name: '[시스템]', italic: true, text: '먼지 쌓인 상자에 \'USB 3,000개 (2019년 교육자료)\' 라벨이 붙어있다.' },
      { speaker: 'system', name: '[시스템]', italic: true, text: 'Auto-RAG가 있었으면...' },
    ],
    easter_whiteboard: [
      { speaker: 'system', name: '[시스템]', italic: true, text: '화이트보드에 누군가 적어놓은 메모가 있다.' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '\'사내에서도 클로드 스킬같이 되면 좋을 텐데...\'' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '그 밑에 다른 필체로: \'에이닷 비즈 cowork..???\'' },
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
      { speaker: 'system', name: '[시스템]', italic: true, text: '탁자 위에 사내 뉴스레터가 놓여있다.' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '「에이닷 비즈 더 강력해진다!」' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '4월 말 — MCP 확대 지원 (팀즈, 아웃룩 메일)' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '5월 말 — 회의록 기능 대폭 강화 (에이닷 노트 기능 통합)' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '6월 말 — 에이닷 비즈 cowork 도입 (클로드와 유사한 스킬 생성)' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '많은 관심 바랍니다!' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 잠긴 구역 안내 메시지
  // ────────────────────────────────────────────────────────
  locked_messages: {
    barrier_jaryosil: '아직 갈 수 없는 것 같다. 먼저 챗빌더를 완료하자.',
    barrier_hoeuisil: '아직 갈 수 없는 것 같다. 먼저 Auto-RAG를 완료하자.',
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
    id:    'chat_builder',
    icon:  '🗣️',
    title: '챗빌더',
    desc1: '대화만으로 에이전트를 만든다!',
    desc2: '프롬프트, 이름, 이미지까지 자동 생성. 테스트 후 바로 배포.',
  },
  {
    id:    'auto_rag',
    icon:  '📂',
    title: 'Auto-RAG',
    desc1: '사내 문서를 자동으로 연결·검색·활용!',
    desc2: 'Teams, SharePoint 문서까지 자동 반영.',
  },
  {
    id:    'mcp_connect',
    icon:  '🔌',
    title: 'MCP 연결',
    desc1: '외부 도구를 꽂아서 진짜 일을 한다!',
    desc2: 'Outlook 일정, Azure DI, 시각화, 관공서 OCR까지.',
  },
];

// ────────────────────────────────────────────────────────
// 미션 상태 초기값
// ────────────────────────────────────────────────────────
export const MISSION_INITIAL = {
  chat_builder: false,
  auto_rag:     false,
  mcp_connect:  false,
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
