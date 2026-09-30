const QUIZZES = {
  ch7: [
    {
      id: 'c7q1',
      type: 'mc',
      title: '7-1. 자석을 잘랐을 때',
      question: '막대자석을 가운데서 자르면?',
      choices: [
        'N극만 있는 조각과 S극만 있는 조각',
        '각각 N·S를 가진 작은 자석 두 개',
        '자극이 모두 사라진 철조각 두 개'
      ],
      answer: 1,
      explain: '자하는 홀로 존재할 수 없어, 잘라도 작은 자석 두 개가 됩니다.'
    },
    {
      id: 'c7q2',
      type: 'mc',
      title: '7-2. 가우스 정리',
      question: '∮_S B · dS 의 값은?',
      choices: [
        'N극 세기 m에 비례하는 양수',
        '항상 0',
        '자석 길이에 비례'
      ],
      answer: 1,
      explain: '고립자극이 없으므로 ∇ · B = 0, ∮ B · dS = 0 입니다.'
    },
    {
      id: 'c7q3',
      type: 'mc',
      title: '7-3. 쿨롱 자기력 (개념)',
      question: '동종 점자극 사이의 자기력 방향은?',
      choices: ['흡인력', '반발력', '힘이 0'],
      answer: 1,
      explain: '동종극은 반발, 이종극은 흡인입니다. F = m₁m₂ / (4πμ₀r²)'
    },
    {
      id: 'c7q4',
      type: 'text',
      title: '7-4. B와 H 관계',
      question: '진공에서 B와 H의 관계식을 쓰세요. (예: B = μ₀H)',
      answer: 'B=μ0H',
      accept: ['B=μ₀H', 'B=μ0H', 'B=mu0H', 'B=μ₀·H', 'B = μ₀ H'],
      explain: '진공에서는 B = μ₀H 입니다. 매질이 있으면 B = μH.'
    },
    {
      id: 'c7q5',
      type: 'mc',
      title: '7-5. 자속 계산',
      question: '균일 B가 면 S에 수직일 때 자속 φ는?',
      choices: ['φ = B + S', 'φ = BS', 'φ = B / S'],
      answer: 1,
      explain: 'θ = 0°이면 φ = BS cos0° = BS.'
    },
    {
      id: 'c7q6',
      type: 'mc',
      title: '7-6. H vs B',
      question: '철심을 넣으면 보통 무엇이 커지나?',
      choices: ['H만 커진다', 'B와 φ가 커진다', 'μ₀가 커진다'],
      answer: 1,
      explain: '같은 전류·기하면 H는 비슷하고, μ 증가로 B와 φ가 커집니다.'
    }
  ],
  ch8: [
    {
      id: 'c8q1',
      type: 'mc',
      title: '8-1. 오른손 법칙',
      question: '전류가 지면에서 나오는 방향(⊙)일 때, 도선 오른쪽에서 H 방향은?',
      choices: ['위쪽', '아래쪽', '왼쪽', '오른쪽'],
      answer: 0,
      explain: '나오는 전류는 반시계 방향 자계 → 오른쪽에서는 위쪽.'
    },
    {
      id: 'c8q2',
      type: 'mc',
      title: '8-2. 암페어 법칙',
      question: 'I₁=3A(⊙), I₂=5A(⊗), I₃=2A(⊙)를 감싼 폐곡선에서 ∮ H · dℓ 는?',
      choices: ['10 A', '0 A', '4 A', '-2 A'],
      answer: 1,
      explain: '알짜 전류 = 3 − 5 + 2 = 0 → 선적분도 0.'
    },
    {
      id: 'c8q3',
      type: 'mc',
      title: '8-3. 무한장 직선',
      question: '무한장 직선 전류의 H는?',
      choices: ['H = I / (2πr)', 'H = 2πr / I', 'H = I · 2πr', 'H = I / r²'],
      answer: 0,
      explain: '암페어 법칙으로 H = I / (2πr). 거리에 반비례합니다.'
    },
    {
      id: 'c8q4',
      type: 'mc',
      title: '8-4. 원주도체 외부 그래프',
      question: '원주도체 외부(r > a)에서 H와 r의 관계는?',
      choices: ['H ∝ r (직선)', 'H ∝ 1/r (반비례)', 'H ∝ r² (이차함수)', 'H = 0'],
      answer: 1,
      explain: '외부는 H = I/(2πr) 이라 반비례입니다. 이차함수가 아닙니다.'
    },
    {
      id: 'c8q5',
      type: 'mc',
      title: '8-5. 솔레노이드',
      question: '이상적인 무한장 솔레노이드 외부의 H는?',
      choices: ['nI', 'NI/ℓ', '0', 'I/(2πr)'],
      answer: 2,
      explain: '이상적 무한장 솔레노이드 외부 H = 0, 내부 H = nI = NI/ℓ.'
    },
    {
      id: 'c8q6',
      type: 'mc',
      title: '8-6. 평행도선',
      question: '두 평행도선에 같은 방향 전류가 흐르면?',
      choices: ['서로 반발', '서로 흡인', '힘 없음'],
      answer: 1,
      explain: '같은 방향 → 사이 자속 감소 → 흡인. 반대 방향 → 반발.'
    },
    {
      id: 'c8q7',
      type: 'text',
      title: '8-7. 전자력 크기',
      question: 'B=0.5 T, I=10 A, ℓ=0.2 m, θ=30°일 때 F(N)의 숫자만 입력 (예: 0.5)',
      answer: '0.5',
      accept: ['0.5', '0.50', '1/2'],
      explain: 'F = BIl sinθ = 0.5·10·0.2·0.5 = 0.5 N'
    },
    {
      id: 'c8q8',
      type: 'mc',
      title: '8-8. 로렌츠 힘',
      question: '전계와 자계가 함께 있을 때 운동전하가 받는 힘(플랑크 아님)은?',
      choices: [
        'F = qE',
        'F = q(v × B)',
        'F = q(E + v × B)',
        'F = BIl'
      ],
      answer: 2,
      explain: '로렌츠 힘: F = q(E + v × B)'
    }
  ]
};

function normalizeText(s) {
  return String(s || '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/μ₀|μ0|mu_0|mu0/gi, 'μ0')
    .replace(/·/g, '')
    .replace(/=/g, '=');
}

function renderQuiz(chapterKey, mountId) {
  const list = QUIZZES[chapterKey] || [];
  const root = document.getElementById(mountId);
  if (!root) return;

  root.innerHTML = `
    <div class="scorebar">
      <div><strong id="scoreText">아직 채점 전</strong><div id="scoreDetail" style="color:var(--ink-soft);font-size:0.92rem;">각 문제에서 정답 확인을 눌러보세요.</div></div>
      <div class="quiz-actions">
        <button type="button" class="btn-check" id="checkAll">전체 채점</button>
        <button type="button" class="btn-reset" id="resetAll">다시 풀기</button>
      </div>
    </div>
    <div id="quizList"></div>
  `;

  const quizList = root.querySelector('#quizList');
  list.forEach((q, idx) => {
    const card = document.createElement('div');
    card.className = 'quiz-card section';
    card.dataset.id = q.id;
    card.style.marginBottom = '1rem';

    let body = '';
    if (q.type === 'mc') {
      body = `<div class="choices">` + q.choices.map((c, i) => `
        <label class="choice">
          <input type="radio" name="${q.id}" value="${i}" />
          <span>${i + 1}. ${c}</span>
        </label>
      `).join('') + `</div>`;
    } else {
      body = `<div class="input-row"><input type="text" name="${q.id}" placeholder="답을 입력하세요" autocomplete="off" /></div>`;
    }

    card.innerHTML = `
      <h3>${q.title}</h3>
      <p class="quiz-q">${q.question}</p>
      ${body}
      <div class="quiz-actions">
        <button type="button" class="btn-check" data-check="${q.id}">정답 확인</button>
      </div>
      <div class="feedback" data-fb="${q.id}"></div>
    `;
    quizList.appendChild(card);
  });

  // choice highlight
  root.querySelectorAll('.choice input').forEach((input) => {
    input.addEventListener('change', () => {
      const name = input.name;
      root.querySelectorAll(`input[name="${name}"]`).forEach((el) => {
        el.closest('.choice')?.classList.remove('selected');
      });
      input.closest('.choice')?.classList.add('selected');
    });
  });

  function gradeOne(q) {
    const fb = root.querySelector(`[data-fb="${q.id}"]`);
    const card = root.querySelector(`.quiz-card[data-id="${q.id}"]`);
    let ok = false;
    let userMsg = '';

    if (q.type === 'mc') {
      card.querySelectorAll('.choice').forEach((el) => el.classList.remove('correct', 'wrong'));
      const selected = root.querySelector(`input[name="${q.id}"]:checked`);
      if (!selected) {
        fb.className = 'feedback show bad';
        fb.innerHTML = '아직 선택하지 않았습니다. 보기를 고른 뒤 다시 눌러주세요.';
        return null;
      }
      const val = Number(selected.value);
      ok = val === q.answer;
      const chosenLabel = selected.closest('.choice');
      if (ok) {
        chosenLabel?.classList.add('correct');
      } else {
        chosenLabel?.classList.add('wrong');
        const right = root.querySelector(`input[name="${q.id}"][value="${q.answer}"]`);
        right?.closest('.choice')?.classList.add('correct');
      }
      userMsg = ok
        ? `<strong>정답입니다!</strong><br>${q.explain}`
        : `<strong>틀렸습니다.</strong> 정답은 <strong>${q.answer + 1}번</strong>입니다.<br>${q.explain}`;
    } else {
      const input = root.querySelector(`input[name="${q.id}"]`);
      const raw = input?.value || '';
      if (!raw.trim()) {
        fb.className = 'feedback show bad';
        fb.innerHTML = '답을 입력한 뒤 다시 눌러주세요.';
        return null;
      }
      const norm = normalizeText(raw);
      const accepts = (q.accept || [q.answer]).map(normalizeText);
      ok = accepts.includes(norm);
      userMsg = ok
        ? `<strong>정답입니다!</strong><br>${q.explain}`
        : `<strong>틀렸습니다.</strong> 정답 예: <strong>${q.answer}</strong><br>${q.explain}`;
      input.style.borderColor = ok ? '#2f7a4b' : '#b04a3a';
    }

    fb.className = `feedback show ${ok ? 'ok' : 'bad'}`;
    fb.innerHTML = userMsg;
    return ok;
  }

  function updateScore() {
    let graded = 0, correct = 0;
    list.forEach((q) => {
      const fb = root.querySelector(`[data-fb="${q.id}"]`);
      if (fb && fb.classList.contains('show') && (fb.classList.contains('ok') || fb.classList.contains('bad'))) {
        // only count if actually graded (not "not selected")
        if (fb.classList.contains('ok')) { graded++; correct++; }
        else if (fb.textContent.includes('틀렸습니다')) { graded++; }
      }
    });
    const scoreText = document.getElementById('scoreText');
    const scoreDetail = document.getElementById('scoreDetail');
    if (!graded) {
      scoreText.textContent = '아직 채점 전';
      scoreDetail.textContent = '각 문제에서 정답 확인을 눌러보세요.';
    } else {
      scoreText.textContent = `${correct} / ${graded} 맞음`;
      scoreDetail.textContent = `채점한 문제 ${graded}개 중 ${correct}개 정답 (전체 ${list.length}문항)`;
    }
  }

  root.querySelectorAll('[data-check]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-check');
      const q = list.find((x) => x.id === id);
      if (!q) return;
      gradeOne(q);
      updateScore();
    });
  });

  document.getElementById('checkAll')?.addEventListener('click', () => {
    list.forEach((q) => gradeOne(q));
    updateScore();
  });

  document.getElementById('resetAll')?.addEventListener('click', () => {
    renderQuiz(chapterKey, mountId);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const mount = document.getElementById('quiz-root');
  if (mount && mount.dataset.chapter) {
    renderQuiz(mount.dataset.chapter, 'quiz-root');
  }
});
