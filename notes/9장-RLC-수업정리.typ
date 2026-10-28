#set page(paper: "a4", margin: (x: 1.6cm, y: 1.45cm))
#set text(font: "WenQuanYi Micro Hei", size: 10.5pt, lang: "ko")
#set par(leading: 0.55em, spacing: 0.58em)
#show math.equation: set text(font: ("New Computer Modern Math", "WenQuanYi Micro Hei"))
#set heading(numbering: none)
#show heading.where(level: 1): it => {
  set text(size: 15pt, weight: "bold")
  block(below: 0.55em, it.body)
}
#show heading.where(level: 2): it => {
  set text(size: 12.5pt, weight: "bold")
  block(above: 0.95em, below: 0.4em, it.body)
}

= 9장 RLC 수업 정리

== Ex 9-1 직렬 RLC

#align(center)[#image("series-rlc.png", width: 58%)]

$R = 50 Omega$, $L = 10 "mH"$, $C = 1 mu "F"$, $V_0 = 1 "V"$.
전류 $i$는 시계방향. 스위치는 $t = 0$에서 닫힌다.

커패시터 관계.

$ i_C = C frac(d v_C, d t) $
$ frac(d v_C, d t) = frac(1, C) i_C $
$ v_C = frac(1, C) integral i_C thin d t $

*KVL.*

$ V_0 = i R + L frac(d i, d t) + frac(1, C) integral i d t quad (1) $

*양변을 미분.* $V_0$는 상수라 사라진다.

$ L frac(d^2 i, d t^2) + R frac(d i, d t) + frac(1, C) i = 0 $

*양변을 $L$로 나누면.*

$ frac(d^2 i, d t^2) + frac(R, L) frac(d i, d t) + frac(1, L C) i = 0 quad (2) $

*$i(t) = A e^(s t)$ 를 (2)에 대입.*

$ i' = A s e^(s t), quad i'' = A s^2 e^(s t) $

$ A s^2 e^(s t) + frac(R, L) A s e^(s t) + frac(1, L C) A e^(s t) = 0 $

$ A e^(s t) (s^2 + frac(R, L) s + frac(1, L C)) = 0 $

$A e^(s t) != 0$ 이므로 특성방정식은

$ s^2 + frac(R, L) s + frac(1, L C) = 0 $

$ s = - frac(R, 2 L) plus.minus sqrt( (frac(R, 2 L))^2 - frac(1, L C) ) $

감쇠상수와 공진주파수.

$ alpha = frac(R, 2 L), quad omega_0 = frac(1, sqrt(L C)) $

$ s = - alpha plus.minus sqrt(alpha^2 - omega_0^2) $

#block(breakable: false)[
*수치.*

$ tau = frac(L, R) = frac(10 times 10^(-3), 50) = 2 times 10^(-4) "s" $
]

$ frac(1, tau) = frac(50, 10 times 10^(-3)) = 5000, quad alpha = frac(1, 2 tau) = 2500 $

$ omega_0^2 = frac(1, L C) = frac(1, 10 times 10^(-3) dot 1 times 10^(-6)) = frac(1, 10^(-8)) = 10^8 $

$ s = -2500 plus.minus sqrt(2500^2 - 10^8) = -2500 plus.minus sqrt(6\,250\,000 - 100\,000\,000) $

$ = -2500 plus.minus sqrt(-93\,750\,000) = -2500 plus.minus j 9682.5 $

$ s_1 = -2500 + j 9682.5, quad s_2 = -2500 - j 9682.5 $

*실수 꼴.* 응답은 실수여야 하므로 계수 $A_1$, $A_2$는 켤레로 둔다.

$ i(t) = A_1 e^(s_1 t) + A_2 e^(s_2 t) = e^(-2500 t) ( A_1 e^(j 9682.5 t) + A_2 e^(-j 9682.5 t) ) $

이렇게 두면

$ A_1 = |A| e^(j phi), quad A_2 = |A| e^(-j phi) $

$ i(t) = |A| e^(-2500 t) [ e^(j (9682.5 t + phi)) + e^(-j (9682.5 t + phi)) ] $

오일러 공식 $e^(plus.minus j theta) = cos theta plus.minus j sin theta$ 에서

$ cos theta = frac(e^(j theta) + e^(-j theta), 2) $

$ i(t) = 2 |A| e^(-2500 t) cos(9682.5 t + phi) $

같은 식을 미정계수 두 개로 쓰면

$ i(t) = e^(-2500 t) ( D_1 cos 9682.5 t + D_2 sin 9682.5 t ) $

#text(fill: rgb("#9f1d1d"))[
  $phi$ 또는 $D_1$, $D_2$는 초기조건이 없어 아직 정하지 못했다.
  칠판의 $-75.5 degree$는 $tan^(-1)(9682.5 \/ (-2500))$이다. 이 값은 $s_1$의 편각이 아니고, 응답의 위상도 아니다.
  실부가 음수이므로 $s_1$의 편각은 $180 degree - 75.5 degree = 104.5 degree$이다.
]

#v(0.4em)
#grid(
  columns: (1.15fr, 0.85fr),
  gutter: 12pt,
  [
    켤레복소수. 실부가 같고 허부의 부호만 반대이다.

    $ e^(j theta) = cos theta + j sin theta $

    $ sin theta = frac(e^(j theta) - e^(-j theta), j 2) $
  ],
  align(center)[#image("conjugate.png", width: 78%)],
)

== 무전원회로

$ y'' + a y' + b = 0 $

$ y = y_h + y_p $

무전원이면 특수해 $i_p = 0$ 이므로 $i = i_h$ 만 남고, 이것이 과도응답이다.
입력이 있으면

$ i = i_h + i_p = A_1 e^(s t) + K e^(alpha t) $

두 번째 항의 지수는 입력의 지수를 따라간다.

#text(fill: rgb("#9f1d1d"))[
  칠판의 $y'(0) = 3$, $y''(0) = 5$는 $a$, $b$가 없어 여기서 풀지 않았다.
]

== Ex 9-2 병렬 RLC

$t > 0$ 에서 $i_s (t) = 8 e^(-2 t)$, $i_L (t) = i(t) = ?$

#align(center)[#image("parallel-rlc.png", width: 46%)]

$R = 6 Omega$, $L = 7 "H"$, $C = frac(1, 42) "F"$.
병렬이라 $v_R = v_L = v_C$. $i$는 인덕터를 위에서 아래로 흐른다.

*회로 방정식.*

$ i_s u(t) = frac(v_R, R) + i + C frac(d v_C, d t) quad (1) $

$v_L = L frac(d i, d t)$ 를 (1)에 대입.

$ i_s u(t) = frac(L, R) frac(d i, d t) + i + L C frac(d^2 i, d t^2) $

*양변을 $L C$로 나누면.*

$ frac(d^2 i, d t^2) + frac(1, R C) frac(d i, d t) + frac(1, L C) i = frac(i_s u(t), L C) quad (2) $

$ R C = 6 times frac(1, 42) = frac(1, 7), quad frac(1, R C) = 7 $

$ L C = 7 times frac(1, 42) = frac(1, 6), quad frac(1, L C) = 6 $

*특성방정식.* 우변을 0으로 두고 $i = A e^(s t)$ 를 대입하면

$ s^2 + 7 s + 6 = 0 $

$ (s + 1)(s + 6) = 0 $

$ s_1 = -1, quad s_2 = -6 $

과도응답.

$ i_T (t) = A_1 e^(-t) + A_2 e^(-6 t) $

*특수해.* 입력이 $8 e^(-2 t)$ 이므로

$ i_(s s)(t) = B e^(-2 t) $

$ i_(s s)' = -2 B e^(-2 t), quad i_(s s)'' = 4 B e^(-2 t) $

(2)에 대입. 우변은 $8 e^(-2 t) times 6 = 48 e^(-2 t)$.

$ 4 B + 7 (-2 B) + 6 B = 48 $

$ 4 B - 14 B + 6 B = 48 $

$ -4 B = 48, quad B = -12 $

$ i(t) = A_1 e^(-t) + A_2 e^(-6 t) - 12 e^(-2 t) $

*초기조건.*

$ i(0) = 0, quad v_C (0) = 56 "V" = L i'(0) $

$ i'(0) = frac(56, 7) = 8 $

$ i(0) = A_1 + A_2 - 12 = 0 $ 이므로

$ A_1 + A_2 = 12 quad (a) $

$ i'(t) = - A_1 e^(-t) - 6 A_2 e^(-6 t) + 24 e^(-2 t) $

$ i'(0) = - A_1 - 6 A_2 + 24 = 8 $

$ A_1 + 6 A_2 = 16 quad (b) $

(b)에서 (a)를 빼면 $5 A_2 = 4$.

$ A_2 = frac(4, 5) = 0.8, quad A_1 = 12 - 0.8 = 11.2 $

#v(0.35em)
#align(center)[
  #box(stroke: (bottom: 0.9pt), inset: (x: 4pt, bottom: 2pt))[
    $ i(t) = 11.2 e^(-t) + 0.8 e^(-6 t) - 12 e^(-2 t) quad [A] $
  ]
]

검산. $i(0) = 11.2 + 0.8 - 12 = 0$,
$i'(0) = -11.2 - 6 times 0.8 + 24 = 8$.
