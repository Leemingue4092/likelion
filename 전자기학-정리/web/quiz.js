const QUIZZES = {
  ch7: [
    {
      id: 'c7q1',
      type: 'mc',
      title: '7-1. 자석을 잘랐을 때',
      question: '막대자석을 가운데서 자르면?',
      choices: [
        '각각 N극·S극을 가진 작은 자석 두 개',
        'N극만 있는 조각과 S극만 있는 조각',
        '자극이 모두 사라진 철조각 두 개'
      ],
      answer: 0,
      explain: '자하는 홀로 존재할 수 없습니다. 잘라도 작은 자석 두 개가 됩니다.'
    },
    {
      id: 'c7q2',
      type: 'mc',
      title: '7-2. 가우스 정리',
      question: '임의의 폐곡면에 대한 자속 ∮ B · dS 의 값은?',
      choices: [
        '자극의 세기 m에 비례하는 양수',
        '자석 길이에 비례',
        '항상 0'
      ],
      answer: 2,
      explain: '고립자극이 없으므로 ∮ B · dS = 0, ∇ · B = 0 입니다.'
    },
    {
      id: 'c7q3',
      type: 'mc',
      title: '7-3. 쿨롱 자기력',
      question: '같은 종류의 점자극 사이에 작용하는 자기력은?',
      choices: ['흡인력', '반발력', '힘이 0'],
      answer: 1,
      explain: '동종 자극은 반발, 이종 자극은 흡인합니다.'
    },
    {
      id: 'c7q4',
      type: 'mc',
      title: '7-4. B와 H의 관계',
      question: '진공에서 자속밀도 B와 자계의 세기 H의 관계식은?',
      choicesHtml: [
        'B = μ₀ H',
        'B = ε₀ E',
        'B = H / μ₀',
        'D = μ₀ H'
      ],
      answer: 0,
      explain: '진공에서는 B = μ₀ H 입니다. 매질이 있으면 B = μ H 입니다.'
    },
    {
      id: 'c7q5',
      type: 'mc',
      title: '7-5. 자속',
      question: '균일한 자속밀도 B가 면적 S에 수직일 때 자속 Φ는?',
      choicesHtml: [
        'Φ = B + S',
        'Φ = B / S',
        'Φ = μ₀ B',
        'Φ = B S'
      ],
      answer: 3,
      explain: '면에 수직이면 Φ = B S 입니다.'
    },
    {
      id: 'c7q6',
      type: 'mc',
      title: '7-6. 철심을 넣었을 때',
      question: '환상 솔레노이드에 철심을 넣으면 어떻게 되나?',
      choices: [
        '자계의 세기 H가 크게 증가한다',
        '진공의 투자율 μ₀가 커진다',
        '자속밀도 B와 자속 Φ가 커진다',
        '전류 I가 자동으로 커진다'
      ],
      answer: 2,
      explain: 'H는 전류·권수·기하에 의해 정해지고, 철심(μ 증가)으로 B와 Φ가 커집니다.'
    },
    {
      id: 'c7q7',
      type: 'mc',
      title: '7-7. 쿨롱 법칙 식',
      question: '두 점자극 m₁, m₂ 사이 거리 r에서 힘 F의 크기는? (진공)',
      choicesHtml: [
        'F = <span class="frac"><span class="num">m₁ m₂</span><span class="den">4π ε₀ r²</span></span>',
        'F = <span class="frac"><span class="num">m₁ m₂</span><span class="den">4π μ₀ r²</span></span>',
        'F = <span class="frac"><span class="num">m₁ + m₂</span><span class="den">4π μ₀ r</span></span>',
        'F = m₁ m₂ r²'
      ],
      answer: 1,
      explain: '자기 쿨롱 법칙은 F = m₁ m₂ / (4π μ₀ r²) 입니다.'
    }
  ],
  ch8: [
    {
      id: 'c8q1',
      type: 'mc',
      title: '8-1. 오른손 법칙',
      question: '전류가 지면에서 나오는 방향(⊙)일 때, 도선 오른쪽에서 자계 H의 방향은?',
      choices: ['위쪽', '아래쪽', '왼쪽', '오른쪽'],
      answer: 0,
      explain: '나오는 전류의 자계는 반시계 방향이므로, 오른쪽에서는 위쪽입니다.'
    },
    {
      id: 'c8q2',
      type: 'mc',
      title: '8-2. 암페어 법칙',
      question: '폐곡선이 I₁ = 3 A(⊙), I₂ = 5 A(⊗), I₃ = 2 A(⊙)를 감쌀 때 ∮ H · dl 의 값은?',
      choices: ['10 A', '0 A', '4 A', '−2 A'],
      answer: 1,
      explain: '알짜 전류 = 3 − 5 + 2 = 0 이므로 선적분도 0입니다.'
    },
    {
      id: 'c8q3',
      type: 'mc',
      title: '8-3. 무한장 직선 전류',
      question: '무한장 직선 전류 I로부터 거리 r인 점의 자계의 세기 H는?',
      choicesHtml: [
        'H = <span class="frac"><span class="num">I</span><span class="den">2π r</span></span>',
        'H = <span class="frac"><span class="num">2π r</span><span class="den">I</span></span>',
        'H = I · 2π r',
        'H = <span class="frac"><span class="num">I</span><span class="den">r²</span></span>'
      ],
      answer: 0,
      explain: '암페어 법칙으로 H = I / (2π r) 이고, 거리에 반비례합니다.'
    },
    {
      id: 'c8q4',
      type: 'mc',
      title: '8-4. 원주도체 외부',
      question: '원주도체 외부(r > a)에서 H와 r의 관계는?',
      choices: [
        'H는 r에 비례한다',
        'H는 1/r에 비례한다 (반비례)',
        'H는 r²에 비례한다 (이차함수)',
        'H = 0'
      ],
      answer: 1,
      explain: '외부는 H = I / (2π r) 이므로 반비례입니다. 이차함수가 아닙니다.'
    },
    {
      id: 'c8q5',
      type: 'mc',
      title: '8-5. 무한장 솔레노이드',
      question: '이상적인 무한장 솔레노이드 외부의 자계의 세기 H는?',
      choicesHtml: [
        'H = n I',
        'H = <span class="frac"><span class="num">N I</span><span class="den">l</span></span>',
        'H = 0',
        'H = <span class="frac"><span class="num">I</span><span class="den">2π r</span></span>'
      ],
      answer: 2,
      explain: '이상적인 무한장 솔레노이드 외부는 H = 0, 내부는 H = n I = N I / l 입니다.'
    },
    {
      id: 'c8q6',
      type: 'mc',
      title: '8-6. 평행 도선',
      question: '두 평행 도선에 같은 방향의 전류가 흐르면?',
      choices: ['서로 반발한다', '서로 흡인한다', '힘이 작용하지 않는다'],
      answer: 1,
      explain: '같은 방향이면 흡인, 반대 방향이면 반발합니다.'
    },
    {
      id: 'c8q7',
      type: 'mc',
      title: '8-7. 전자력의 크기',
      question: 'B = 0.5 T, I = 10 A, l = 0.2 m, θ = 30°일 때 전자력 F의 크기는?',
      choices: ['0.25 N', '0.5 N', '1 N', '2 N'],
      answer: 1,
      explain: 'F = B I l sin θ = 0.5 × 10 × 0.2 × sin 30° = 0.5 N'
    },
    {
      id: 'c8q8',
      type: 'mc',
      title: '8-8. 로렌츠 힘',
      question: '전계 E와 자계 B가 함께 있을 때, 운동전하 q가 받는 힘은?',
      choicesHtml: [
        'F = q E',
        'F = q (v × B)',
        'F = q (E + v × B)',
        'F = B I l'
      ],
      answer: 2,
      explain: '로렌츠 힘은 F = q (E + v × B) 입니다.'
    },
    {
      id: 'c8q9',
      type: 'mc',
      title: '8-9. 환상 솔레노이드',
      question: '환상 솔레노이드 내부의 자계의 세기 H는? (권수 N, 전류 I, 평균 반지름 r)',
      choicesHtml: [
        'H = <span class="frac"><span class="num">I</span><span class="den">2π r</span></span>',
        'H = <span class="frac"><span class="num">N I</span><span class="den">2π r</span></span>',
        'H = n I (외부도 동일)',
        'H = μ₀ N I'
      ],
      answer: 1,
      explain: '환상 솔레노이드는 H = N I / (2π r) = N I / l 이고, 외부는 거의 0입니다.'
    }
  ]
};

function choiceLabel(q, i) {
  if (q.choicesHtml) return q.choicesHtml[i];
  return q.choices[i];
}

function renderQuiz(chapterKey, mountId) {
  const list = QUIZZES[chapterKey] || [];
  const root = document.getElementById(mountId);
  if (!root) return;

  root.innerHTML = `
    <div class="scorebar">
      <div>
        <strong id="scoreText">아직 채점 전</strong>
        <div id="scoreDetail" style="color:var(--ink-soft);font-size:0.92rem;">
          각 문제에서 정답 확인을 눌러보세요.
        </div>
      </div>
      <div class="quiz-actions">
        <button type="button" class="btn-check" id="checkAll">전체 채점</button>
        <button type="button" class="btn-reset" id="resetAll">다시 풀기</button>
      </div>
    </div>
    <div id="quizList"></div>
  `;

  const quizList = root.querySelector('#quizList');
  list.forEach((q) => {
    const card = document.createElement('div');
    card.className = 'quiz-card section';
    card.dataset.id = q.id;
    card.style.marginBottom = '1rem';

    const n = q.choicesHtml ? q.choicesHtml.length : q.choices.length;
    let choices = '';
    for (let i = 0; i < n; i += 1) {
      choices += `
        <label class="choice">
          <input type="radio" name="${q.id}" value="${i}" />
          <span>${i + 1}. ${choiceLabel(q, i)}</span>
        </label>
      `;
    }

    card.innerHTML = `
      <h3>${q.title}</h3>
      <p class="quiz-q">${q.question}</p>
      <div class="choices">${choices}</div>
      <div class="quiz-actions">
        <button type="button" class="btn-check" data-check="${q.id}">정답 확인</button>
      </div>
      <div class="feedback" data-fb="${q.id}"></div>
    `;
    quizList.appendChild(card);
  });

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
    card.querySelectorAll('.choice').forEach((el) => el.classList.remove('correct', 'wrong'));

    const selected = root.querySelector(`input[name="${q.id}"]:checked`);
    if (!selected) {
      fb.className = 'feedback show bad';
      fb.innerHTML = '아직 선택하지 않았습니다. 보기를 고른 뒤 다시 눌러주세요.';
      return null;
    }

    const val = Number(selected.value);
    const ok = val === q.answer;
    const chosenLabel = selected.closest('.choice');
    if (ok) {
      chosenLabel?.classList.add('correct');
    } else {
      chosenLabel?.classList.add('wrong');
      const right = root.querySelector(`input[name="${q.id}"][value="${q.answer}"]`);
      right?.closest('.choice')?.classList.add('correct');
    }

    fb.className = `feedback show ${ok ? 'ok' : 'bad'}`;
    fb.innerHTML = ok
      ? `<strong>정답입니다!</strong><br>${q.explain}`
      : `<strong>틀렸습니다.</strong> 정답은 <strong>${q.answer + 1}번</strong>입니다.<br>${q.explain}`;
    return ok;
  }

  function updateScore() {
    let graded = 0;
    let correct = 0;
    list.forEach((q) => {
      const fb = root.querySelector(`[data-fb="${q.id}"]`);
      if (!fb || !fb.classList.contains('show')) return;
      if (fb.classList.contains('ok')) {
        graded += 1;
        correct += 1;
      } else if (fb.textContent.includes('틀렸습니다')) {
        graded += 1;
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
