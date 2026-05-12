// ============================================================
// scripts.js — 전체 대사 및 미션 데이터 v11.2
// 컨셉: 회의 / AI 보고서 / 뉴스 큐레이션 + 6월 코워크 예고
// 모든 대사·선택지·이미지 슬롯 트리거를 여기서만 관리
// 다단계 미션 지원: stage{N}_missions 배열, 미션마다 nextLines로 분기 대사 흡수
// ============================================================

export const SCRIPTS = {

  // ────────────────────────────────────────────────────────
  // 프롤로그: 로비
  // 도토리 혼자 독백. 플레이어가 직접 내 자리로 이동.
  // ────────────────────────────────────────────────────────
  prologue: [
    { speaker: 'dotori', name: '', italic: true,  text: '(드디어 첫 출근이다... 긴장돼서 어제 잠도 못 잤어.)' },
    { speaker: 'dotori', name: '', italic: true,  text: '(에이닷 비즈? 들어보긴 했는데... 그게 뭐였더라.)' },
    { speaker: 'dotori', name: '', italic: false, text: '...일단 자리부터 찾아 가보자!' },
  ],

  // ────────────────────────────────────────────────────────
  // 스테이지 1: 내 자리 — 회의 (회의록 자동화)
  // 정선배가 처음부터 내 자리에 대기.
  // 미션 2개: 어떻게 시작? → (모바일은 분기 대사로 흡수) → 회의록 정리
  // ────────────────────────────────────────────────────────
  stage1_intro: [
    { speaker: 'jung_sunbae', name: '정선배', text: '오! 신입 도토리. 첫 출근 축하해.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '근데 도토리야, 이따가 임원회의가 있는데 회의록 작성이 필요해.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '... 어떻게 시작하면 좋을까?' },
  ],

  stage1_missions: [
    // ── 미션 1: 어떻게 시작하면 좋을까? ──
    {
      type: 'choice',
      choices: [
        { label: 'A', text: '회의 끝나고 기억나는 대로 메모장에 정리한다',  correct: false },
        { label: 'B', text: '에이닷 비즈 회의록으로 회의 시작 시 녹음한다', correct: true  },
        { label: 'C', text: '동료한테 부탁한다',                             correct: false },
      ],
      feedback: {
        A: [
          { speaker: 'jung_sunbae', name: '정선배', text: '나 오늘 점심도 기억이 안나... 다른 방법 있을까?' },
        ],
        B: [
          { speaker: 'jung_sunbae', name: '정선배', text: '정답! LLM이 오인식·문맥까지 보정해줘서 정확도가 진짜 높아.' },
        ],
        C: [
          { speaker: 'jung_sunbae', name: '정선배', text: '걔도 자기 회의 있어... 다시 해볼까?' },
        ],
      },
      // 정답 후 분기 대사 — 모바일 기능 흡수 + 다음 미션 유도
      nextLines: [
        { speaker: 'jung_sunbae', name: '정선배', text: '참고로 모바일 앱도 이제 지원하니까 편리해졌지!' },
        { speaker: 'jung_sunbae', name: '정선배', text: '자, 그럼 이걸 정리해야지. 임원 회의니까 격식 있게.' },
      ],
    },

    // ── 미션 2: 회의록 정리 방식 ──
    {
      type: 'choice',
      choices: [
        { label: 'A', text: '워드 켜서 처음부터 손으로 정리한다',                correct: false },
        { label: 'B', text: '"임원 회의록" 템플릿 골라서 자동 정리한다',         correct: true  },
        { label: 'C', text: 'AI한테 그냥 "정리해줘"라고 한다',                    correct: false },
      ],
      feedback: {
        A: [
          { speaker: 'jung_sunbae', name: '정선배', text: '그러다 야근하는 거야. 다시 해보자.' },
        ],
        B: [
          { speaker: 'jung_sunbae', name: '정선배', text: '맞아. 임원회의용, 팀미팅용, 요점 정리... 템플릿이 종류별로 있어서 클릭 한 번이면 돼.' },
        ],
        C: [
          { speaker: 'jung_sunbae', name: '정선배', text: '되긴 하는데, 템플릿 쓰면 일관성이 살아. 다른 사람이 봐도 익숙하잖아.' },
        ],
      },
    },
  ],

  stage1_clear: [
    { speaker: 'system',      name: '',       text: '', showScreen: 'screen_2' },
    { speaker: 'jung_sunbae', name: '정선배', text: '회의록 정리하느라 야근하던 시대는 끝이야.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '에이닷 노트랑 통합돼서 받아쓰기·정리·공유까지 한 번에 돼. 다음은 자료실, 박주임님.' },
  ],

  // ────────────────────────────────────────────────────────
  // 스테이지 2: 자료실 — AI 보고서
  // 미션 2개: 자료 수집(딥리서치) → 슬라이드 구성(비주얼)
  // SK 템플릿은 클리어 대사로 흡수
  // ────────────────────────────────────────────────────────
  stage2_intro: [
    { speaker: 'park_juim', name: '박주임', text: '어, 도토리 왔구나? 잘 왔어, 마침 시장 동향 보고서 쓰는 중이었거든.' },
    { speaker: 'park_juim', name: '박주임', text: '나 처음 입사했을 땐 이거 만드는 데 이틀 꼬박 걸렸어. 진짜로.' },
    { speaker: 'park_juim', name: '박주임', text: '근데 지금은 에이닷 비즈 AI 보고서가 다 해줘! 자료수집부터 시작해볼까?' },
  ],

  stage2_missions: [
    // ── 미션 1: 자료 수집 ──
    {
      type: 'choice',
      choices: [
        { label: 'A', text: 'AI보고서에서 딥리서치 모드를 켜고 참고 문서를 첨부한다', correct: true  },
        { label: 'B', text: '네이버 검색 결과 복사해서 붙여 넣는다',                  correct: false },
        { label: 'C', text: '작년 보고서 그대로 갖다 쓴다',                           correct: false },
      ],
      feedback: {
        A: [
          { speaker: 'park_juim', name: '박주임', text: '정답! 딥리서치는 첨부파일을 넘어서 더 넓은 데이터 소스에서 근거를 가져와. 인사이트가 깊어지지.' },
        ],
        B: [
          { speaker: 'park_juim', name: '박주임', text: '출처도 없고 깊이도 없잖아. 다시 해보자.' },
        ],
        C: [
          { speaker: 'park_juim', name: '박주임', text: '도토리... 첫 보고서부터 그러면 안 돼. 다시.' },
        ],
      },
      nextLines: [
        { speaker: 'park_juim', name: '박주임', text: '자료는 모았고, 이제 슬라이드. 임원분들이 뭘 좋아할까?' },
      ],
    },

    // ── 미션 2: 슬라이드 구성 ──
    {
      type: 'choice',
      choices: [
        { label: 'A', text: '텍스트로 페이지 가득 채운다',                          correct: false },
        { label: 'B', text: '비주얼 슬라이드로 차트·표·다이어그램을 자동 생성한다', correct: true  },
        { label: 'C', text: '직접 PPT 켜서 차트를 그린다',                          correct: false },
      ],
      feedback: {
        A: [
          { speaker: 'park_juim', name: '박주임', text: '임원분들이 안 읽으셔... 다시.' },
        ],
        B: [
          { speaker: 'park_juim', name: '박주임', text: '맞아. AI가 슬라이드 자체를 직관적인 비주얼 중심으로 만들어줘. 차트, 표, 다이어그램까지.' },
        ],
        C: [
          { speaker: 'park_juim', name: '박주임', text: '그러다 새벽 돼. 다시 해보자.' },
        ],
      },
    },
  ],

  stage2_clear: [
    { speaker: 'system',    name: '',       text: '', showScreen: 'screen_4' },
    { speaker: 'park_juim', name: '박주임', text: '마지막으로 SK 그룹 템플릿 입혀서 마무리하면 끝. 톤이랑 디자인이 통일되거든.' },
    { speaker: 'park_juim', name: '박주임', text: '30분이면 보고서 한 편 나와. 다음은 회의실, 최과장님.' },
  ],

  // ────────────────────────────────────────────────────────
  // 스테이지 3: 회의실 — 뉴스 큐레이션
  // 미션 2개: 비즈 나우(핫이슈) → 뉴스레터(정기 수신)
  // AI 검색 / 비즈 토픽은 분기 대사로 흡수
  // ────────────────────────────────────────────────────────
  stage3_intro: [
    { speaker: 'choi_gwajang', name: '최과장', text: '오, 도토리. 내일 임원 보고에 업계 주요 이슈 정리해와.' },
    { speaker: 'choi_gwajang', name: '최과장', text: '...라고 시키던 시절은 옛날 얘기야. 지금은 에이닷 비즈 뉴스 큐레이션이 다 해줘.' },
    { speaker: 'choi_gwajang', name: '최과장', text: '근데 상황마다 쓰는 기능이 달라. 일단 한번 해보자.' },
  ],

  stage3_missions: [
    // ── 미션 1: 출근 직후 핫이슈 ──
    {
      type: 'choice',
      questionLine: { speaker: 'choi_gwajang', name: '최과장', text: '출근하자마자 오늘 시장 핫이슈를 30초 안에 파악하고 싶어. 어떻게 할래?' },
      choices: [
        { label: 'A', text: '네이버 뉴스 헤드라인을 쭉 훑는다',                              correct: false },
        { label: 'B', text: '에이닷 비즈 뉴스 큐레이션에서 "오늘의 주요 이슈" 카드를 본다', correct: true  },
        { label: 'C', text: '단톡방에서 누가 공유해주길 기다린다',                          correct: false },
      ],
      feedback: {
        A: [
          { speaker: 'choi_gwajang', name: '최과장', text: '연예 뉴스까지 다 떠. 30초는 무리야. 다시.' },
        ],
        B: [
          { speaker: 'choi_gwajang', name: '최과장', text: '정답! 비즈 나우가 실시간으로 골라서 카드로 보여줘. 출근길에 폰으로 슥 보면 끝.' },
        ],
        C: [
          { speaker: 'choi_gwajang', name: '최과장', text: '...운에 맡기는 거잖아. 다시 해보자.' },
        ],
      },
      nextLines: [
        { speaker: 'choi_gwajang', name: '최과장', text: '특정 이슈 깊게 보고 싶으면 AI 검색으로 의도 기반 검색하면 돼. 키워드 매칭이 아니라 진짜 연관된 기사를 찾아서 핵심만 요약해줘.' },
        { speaker: 'choi_gwajang', name: '최과장', text: '관심 주제가 정해져 있으면 비즈 토픽으로 등록해서 자동 추적·북마크도 되고.' },
        { speaker: 'choi_gwajang', name: '최과장', text: '근데 매일 직접 들어가서 보는 거 귀찮잖아. 마지막 한 가지.' },
      ],
    },

    // ── 미션 2: 정기 수신 ──
    {
      type: 'choice',
      questionLine: { speaker: 'choi_gwajang', name: '최과장', text: '나는 매주 월요일 오전 9시에 텔레그램으로 받고 싶어. 어떻게 설정할래?' },
      choices: [
        { label: 'A', text: '매주 월요일 알람 맞춰놓고 직접 들어간다',                  correct: false },
        { label: 'B', text: '매일 받아서 월요일 거만 골라 본다',                        correct: false },
        { label: 'C', text: '에이닷 비즈 뉴스레터 — 토픽·요일·시간·채널을 설정한다',   correct: true  },
      ],
      feedback: {
        A: [
          { speaker: 'choi_gwajang', name: '최과장', text: '도토리야 솔직히 알람 끄고 딴거 하잖아. 다시.' },
        ],
        B: [
          { speaker: 'choi_gwajang', name: '최과장', text: '메일함이 복잡해서 찾을수가 없어 ㅠ 다시.' },
        ],
        C: [
          { speaker: 'choi_gwajang', name: '최과장', text: '정답! 메일이든 텔레그램이든, 원하는 요일·시간·수신자 조건으로 정기 발송돼.' },
        ],
      },
    },
  ],

  stage3_clear: [
    { speaker: 'system',       name: '',       text: '', showScreen: 'screen_6' },
    { speaker: 'choi_gwajang', name: '최과장', text: '비즈 나우, AI 검색, 비즈 토픽, 뉴스레터. 이 4개 같이 쓰는 게 진짜 강력해.' },
    { speaker: 'choi_gwajang', name: '최과장', text: '자, 정선배한테 가서 인사하고 와.' },
  ],

  // ────────────────────────────────────────────────────────
  // 엔딩: 내 자리 (정선배)
  // 코워크 컷씬 없음 — 김대리·이스터에그로 일임
  // ────────────────────────────────────────────────────────
  ending_intro: [
    { speaker: 'jung_sunbae', name: '정선배', text: '도토리, 벌써 다 돌아봤어? 역시 신입 중 최고다.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '오늘 배운 거 정리해볼까?' },
  ],

  ending_after_cards: [
    { speaker: 'jung_sunbae', name: '정선배', text: '회의도, 보고서도, 뉴스도 이제 AI가 같이 해주잖아.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '도토리도 이제 에이닷 비즈 마스터야.' },
    { speaker: 'jung_sunbae', name: '정선배', text: '자, 이제 진짜 첫 출근 시작이다. 화이팅!' },
  ],

  // ────────────────────────────────────────────────────────
  // 김대리 — 휴게실 코워크 정보통
  // S3 클리어 후 등장. 말 걸면 5줄 자동 재생 후 ✅로 변경 (선택지 없음)
  // ────────────────────────────────────────────────────────
  kim_daeri_lines: [
    { speaker: 'kim_daeri', name: '김대리', text: '어, 도토리? 나 김대리. 휴게실에서 자주 보게 될 거야.' },
    { speaker: 'kim_daeri', name: '김대리', text: '한 바퀴 돌고 왔지? 근데 야, 진짜 재밌는 건 6월이라니까.' },
    { speaker: 'kim_daeri', name: '김대리', text: 'Co-Work라고 곧 나오는데... 업무 절차와 기준을 스킬로 저장하면 에이전트가 스스로 파악해서 일을 처리해.' },
    { speaker: 'kim_daeri', name: '김대리', text: '발신 시점도 알아서 정하고, 문서·스킬 같은 영역까지 다 잡아.' },
    { speaker: 'kim_daeri', name: '김대리', text: '야 이거 진짜 게임체인저야. 나는 매일 출시 D-day 세고 있어. ...물론 커피 타기는 안 된다고 했지만...' },
  ],

  // ────────────────────────────────────────────────────────
  // 이스터에그 (✦ 오브젝트 조사 시)
  // ────────────────────────────────────────────────────────
  easter_eggs: {
    // 자료실 박스 → AI 보고서
    easter_box: [
      { speaker: 'system', name: '[시스템]', italic: true, text: '먼지 쌓인 종이박스에 누렇게 변한 라벨이 붙어있다.' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '"2019년 1분기 보고서 (출력본 500부)"' },
      { speaker: 'system', name: '[시스템]', italic: true, text: 'AI 보고서가 있었으면 이거 한 시간이면 끝났을 텐데...' },
    ],
    // 회의실 화이트보드 → 회의록
    easter_whiteboard: [
      { speaker: 'system', name: '[시스템]', italic: true, text: '화이트보드에 지우다 만 글씨가 남아있다.' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '"회의록 정리 — 새벽 2시 완료"' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '그 밑에 다른 필체로: "이제 받아쓰기 자동으로 된다고요? 진작 좀..."' },
    ],
    // 휴게실 커피머신 → 코워크 떡밥
    easter_coffee: [
      { speaker: 'system', name: '[시스템]', italic: true, text: '커피머신에 포스트잇이 붙어있다.' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '"에이전트한테 커피 타달라고 하지 마세요. 아직 미지원입니다. - IT팀"' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '그 밑에 다른 포스트잇: "근데 6월에 코워크 나오면... 가능?"' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '또 다른 포스트잇: "물리적인 건 무리예요. - IT팀"' },
    ],
    // 휴게실 냉장고 → 비즈 토픽 / 뉴스레터 농담
    easter_fridge: [
      { speaker: 'system', name: '[시스템]', italic: true, text: '냉장고에 포스트잇 두 장이 나란히 붙어있다.' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '"내 푸딩 가져간 사람을 비즈 토픽으로 등록했습니다"' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '"월요일 9시마다 텔레그램으로 알려줄 거예요. 잡힐 때까지."' },
    ],
    // 휴게실 탁자 → 6월 코워크 종합 안내 (B-3안)
    easter_table: [
      { speaker: 'system', name: '[시스템]', italic: true, text: '탁자 위에 사내 뉴스레터가 놓여있다.' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '「6월 출시 — Co-Work, 시키지 않아도 일하는 AI」' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '업무 절차를 스스로 파악·실행. 발신 시점까지 자동 처리.' },
      { speaker: 'system', name: '[시스템]', italic: true, text: '문서, 스킬 등 다양한 업무 영역 지원. ※ 커피는 못 탑니다.' },
    ],
  },

  // ────────────────────────────────────────────────────────
  // 잠긴 구역 안내 메시지
  // ────────────────────────────────────────────────────────
  locked_messages: {
    barrier_jaryosil: '아직 갈 수 없는 것 같다. 먼저 회의록 미션을 완료하자.',
    barrier_hoeuisil: '아직 갈 수 없는 것 같다. 먼저 AI 보고서 미션을 완료하자.',
  },

  // ────────────────────────────────────────────────────────
  // 로비 문 특별 대사 (자동 트리거)
  // ────────────────────────────────────────────────────────
  lobby_door: [
    { speaker: 'dotori', name: '', italic: true,  text: '(출근했는데 퇴근 생각을?)' },
    { speaker: 'dotori', name: '', italic: false, text: '힘을 내자..!' },
  ],
};

// ────────────────────────────────────────────────────────
// 스킬카드 데이터 (엔딩에서 표시)
// ID 변경: chat_builder/auto_rag/mcp_connect → meeting/report/news
// ────────────────────────────────────────────────────────
export const SKILL_CARDS = [
  {
    id:    'meeting',
    icon:  '📝',
    title: '회의록 자동화',
    desc1: '받아쓰기부터 정리까지 한 번에!',
    desc2: '에이닷 노트 통합 + 모바일 + 회의 템플릿.',
  },
  {
    id:    'report',
    icon:  '📊',
    title: 'AI 보고서',
    desc1: '딥리서치로 자료 모아 슬라이드까지!',
    desc2: '비주얼 차트·다이어그램 + SK 그룹 템플릿.',
  },
  {
    id:    'news',
    icon:  '📰',
    title: '뉴스 큐레이션',
    desc1: '핫이슈부터 정기 수신까지 개인화!',
    desc2: '비즈 나우 / AI 검색 / 비즈 토픽 / 뉴스레터.',
  },
];

// ────────────────────────────────────────────────────────
// 미션 상태 초기값 (HUD/MissionSystem에서 사용)
// ────────────────────────────────────────────────────────
export const MISSION_INITIAL = {
  meeting: false,
  report:  false,
  news:    false,
};

// ────────────────────────────────────────────────────────
// NPC 이모지 매핑 (DialogSystem에서 이름 옆에 표시)
// ────────────────────────────────────────────────────────
export const NPC_EMOJI = {
  dotori:       '🧑‍💼',
  jung_sunbae:  '🧑‍💼',
  park_juim:    '👩‍💼',
  choi_gwajang: '👩‍💼',
  kim_daeri:    '🧑‍💻',
  system:       '',
};