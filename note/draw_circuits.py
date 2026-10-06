#!/usr/bin/env python3
"""수업 필기와 교재 예제의 회로도. 풀이 중 다시 그리는 회로를 포함한다."""

import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import schemdraw
import schemdraw.elements as elm

schemdraw.use("matplotlib")
plt.rcParams["font.family"] = "NanumGothic"
plt.rcParams["axes.unicode_minus"] = False

OUT = os.path.join(os.path.dirname(__file__), "figures")
os.makedirs(OUT, exist_ok=True)


FONT = "/usr/share/fonts/truetype/nanum/NanumGothic.ttf"


def D():
    d = schemdraw.Drawing()
    d.config(unit=2.15, fontsize=12, lw=1.5, font=FONT)
    return d


def save(d, name):
    path = os.path.join(OUT, name + ".png")
    d.save(path, dpi=150, transparent=False)
    plt.close("all")
    print(name)


def inv_amp():
    d = D()
    d += elm.Dot().label("vi", "left")
    d += elm.Resistor().right().label("R1")
    n = d.here
    op = d.add(elm.Opamp().anchor("in1"))
    d += elm.Line().at(op.out).right().length(1.4).label("vo", "right")
    d += elm.Line().at(op.out).up().length(1.5)
    d += elm.Resistor().left().label("Rf").tox(n)
    d += elm.Line().down().toy(n)
    d += elm.Line().at(op.in2).down().length(1.4)
    d += elm.Ground()
    save(d, "inv")


def noninv_amp():
    d = D()
    op = d.add(elm.Opamp())
    d += elm.Line().at(op.in2).left().length(1.5).label("vi", "left")
    n = (op.in1.x - 2.5, op.in1.y)
    d += elm.Line().at(op.in1).to(n)
    d += elm.Dot().at(n)
    d += elm.Resistor().at(n).down().label("R1").length(2.6)
    d += elm.Ground()
    d += elm.Line().at(op.out).right().length(1.4).label("vo", "right")
    top = (n[0], n[1] + 1.4)
    d += elm.Line().at(op.out).to((op.out.x, top[1]))
    d += elm.Resistor().at((op.out.x, top[1])).to(top).label("R2")
    d += elm.Line().at(top).to(n)
    save(d, "noninv")


def follower():
    d = D()
    op = d.add(elm.Opamp())
    d += elm.Line().at(op.in2).left().length(1.5).label("vi", "left")
    d += elm.Line().at(op.out).right().length(1.4).label("vo", "right")
    d += elm.Line().at(op.out).up().length(1.1)
    d += elm.Line().left().tox(op.in1)
    d += elm.Line().down().toy(op.in1)
    save(d, "follower")


def load_open():
    d = D()
    d += elm.SourceV().up().label("10 V")
    d += elm.Resistor().right().label("10 kΩ")
    d += elm.Dot()
    d += elm.Line().right().length(1.2).label("vi", "right")
    d += elm.Resistor().down().at(d.here).label("10 kΩ")
    # fix: redraw cleanly
    save(d, "load_open_tmp")


def load_before():
    d = D()
    d += elm.SourceV().label("10 V").up()
    d += elm.Resistor().right().label("10 kΩ")
    top = d.here
    d += elm.Dot()
    d += elm.Line().right().length(1.5).dot(open=True).label("무부하", "right")
    d += elm.Resistor().down().at(top).label("10 kΩ")
    bot = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    d += elm.Ground().at(bot)
    save(d, "load_before")


def load_after():
    d = D()
    d += elm.SourceV().label("10 V").up()
    d += elm.Resistor().right().label("10 kΩ")
    top = d.here
    d += elm.Dot()
    d += elm.Resistor().right().label("RL 10 kΩ")
    rend = d.here
    d += elm.Line().down().length(d.unit)
    d += elm.Line().left().tox(top)
    d += elm.Resistor().down().at(top).label("10 kΩ")
    bot = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    d += elm.Ground().at(bot)
    save(d, "load_after")


def buffer_load():
    d = D()
    d += elm.SourceV().label("vs").up()
    d += elm.Resistor().right().label("R1")
    mid = d.here
    d += elm.Dot()
    d += elm.Resistor().down().label("R2")
    gnd = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    d += elm.Ground().at(gnd)
    op = d.add(elm.Opamp().at(mid).anchor("in2").right())
    d += elm.Line().at(op.out).right().length(1.3)
    out = d.here
    d += elm.Dot()
    d += elm.Resistor().down().label("RL")
    d += elm.Ground()
    d += elm.Line().at(op.out).up().length(1.0)
    d += elm.Line().left().tox(op.in1)
    d += elm.Line().down().toy(op.in1)
    d += elm.Line().at(out).right().length(0.6).label("vo", "right")
    save(d, "buffer")


def summer():
    d = D()
    op = d.add(elm.Opamp().at((5.2, 0)))
    n = (op.in1.x - 1.5, op.in1.y)
    d += elm.Line().at(op.in1).to(n)
    d += elm.Dot().at(n)
    d += elm.Resistor().at(n).left().label("100 Ω")
    d += elm.Dot().label("v1", "left")
    d += elm.Line().at(n).down().length(1.45)
    d += elm.Dot()
    d += elm.Resistor().left().label("200 Ω")
    d += elm.Dot().label("v2", "left")
    d += elm.Line().at(n).down().length(2.9)
    d += elm.Dot()
    d += elm.Resistor().left().label("400 Ω")
    d += elm.Dot().label("v3", "left")
    d += elm.Line().at(op.out).right().length(1.2).label("vo", "right")
    top = (n[0], n[1] + 1.35)
    d += elm.Line().at(op.out).to((op.out.x, top[1]))
    d += elm.Resistor().at((op.out.x, top[1])).to(top).label("Rf 400 Ω")
    d += elm.Line().at(top).to(n)
    d += elm.Line().at(op.in2).down().length(1.6)
    d += elm.Ground()
    save(d, "summer")


def diff_amp():
    d = D()
    op = d.add(elm.Opamp().at((6.2, 0)))
    n1 = (op.in1.x - 1.3, op.in1.y)
    d += elm.Line().at(op.in1).to(n1)
    d += elm.Dot().at(n1)
    d += elm.Resistor().at(n1).left().label("10 kΩ")
    d += elm.SourceV().left().reverse().length(1.0).label("va", loc="top")
    d += elm.Ground()
    out = (op.out.x + 1.3, op.out.y)
    d += elm.Line().at(op.out).to(out)
    d += elm.Dot().at(out)
    d += elm.Line().at(out).right().length(0.9).label("vo", "right")
    top = (n1[0], n1[1] + 1.45)
    d += elm.Line().at(out).to((out[0], top[1]))
    d += elm.Resistor().at((out[0], top[1])).to(top).label("30 kΩ")
    d += elm.Line().at(top).to(n1)
    d += elm.Resistor().at(out).down().label("50 kΩ").length(3.5)
    d += elm.Ground()
    n2 = (op.in2.x - 1.3, op.in2.y)
    d += elm.Line().at(op.in2).to(n2)
    d += elm.Dot().at(n2)
    d += elm.Resistor().at(n2).left().label("10 kΩ")
    d += elm.SourceV().left().reverse().length(1.0).label("vb", loc="bottom")
    d += elm.Ground()
    d += elm.Resistor().at(n2).down().label("30 kΩ").length(1.7)
    d += elm.Ground()
    save(d, "diff")


def bridge():
    d = D()
    d += elm.Line().up().length(0.45)
    bot = d.elements[-1].start
    d += elm.SourceV().up().label("vs").length(1.7)
    d += elm.Line().up().length(0.45)
    d += elm.Line().right().length(1.7)
    left = d.here
    d += elm.Dot()
    d += elm.Resistor().right().label("R1")
    d += elm.Dot().label("a", "top")
    d += elm.Resistor().right().label("R2")
    right = d.here
    d += elm.Dot()
    d += elm.Line().down().toy(bot)
    d += elm.Line().left().tox(bot)
    d += elm.Resistor().at(left).down().label("R3").toy(bot)
    b = d.here
    d += elm.Dot().at(b).label("b", "bottom")
    d += elm.Resistor().at(b).right().label("R4").tox(right)
    save(d, "bridge")


def bridge_div():
    """개방전압. 위 분배와 아래 분배를 따로 본다."""
    d = D()
    d += elm.SourceV().label("vs").up()
    d += elm.Line().right().length(0.5)
    left = d.here
    d += elm.Resistor().right().label("R1")
    d += elm.Dot().label("Va", "top")
    d += elm.Resistor().right().label("R2")
    right = d.here
    d += elm.Line().down().length(d.unit * 2)
    bot = d.here
    d += elm.Line().left().tox(left)
    d += elm.Line().down().at(left).length(d.unit * 2 + 1.3)
    low = d.here
    d += elm.Resistor().right().label("R3")
    d += elm.Dot().label("Vb", "bottom")
    d += elm.Resistor().right().label("R4").tox(right)
    d += elm.Line().down().toy(low)
    d += elm.Line().left().tox(left)
    d += elm.Line().at(d.elements[0].start).right().tox(left)
    save(d, "bridge_div")


def bridge_rth():
    d = D()
    d += elm.Dot(open=True).label("a", "left")
    d += elm.Resistor().right().label("R1 ∥ R2")
    d += elm.Resistor().right().label("R3 ∥ R4")
    d += elm.Dot(open=True).label("b", "right")
    save(d, "bridge_rth_net")


def bridge_th():
    d = D()
    op = d.add(elm.Opamp().at((5.5, 0)))
    d += elm.Line().at(op.in2).left().length(0.35)
    d += elm.Line().down().length(1.55)
    d += elm.Line().left().length(2.3)
    d += elm.Resistor().left().label("Rth")
    d += elm.SourceV().down().reverse().label("Vth")
    d += elm.Ground()
    g = (op.in1.x - 0.9, op.in1.y)
    d += elm.Line().at(op.in1).to(g)
    d += elm.Dot().at(g)
    d += elm.Resistor().at(g).down().label("R5").length(0.55)
    d += elm.Ground()
    d += elm.Line().at(op.out).right().length(1.2).label("vo", "right")
    top = (g[0], g[1] + 1.4)
    d += elm.Line().at(op.out).to((op.out.x, top[1]))
    d += elm.Resistor().at((op.out.x, top[1])).to(top).label("R6")
    d += elm.Line().at(top).to(g)
    save(d, "bridge_th")


def rl_switch_full():
    d = D()
    d += elm.Resistor().up().label("5 Ω")
    top = d.here
    d += elm.Switch(action="close").right().label("t=0.4 s")
    sw = d.here
    d += elm.Line().right().length(1.2)
    d += elm.Dot()
    mid = d.here
    d += elm.Resistor().down().label("20 Ω")
    bot = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    d += elm.Inductor2().right().at(mid).label("8 H")
    d += elm.Line().down().toy(bot)
    d += elm.Line().left().tox(mid)
    save(d, "rl82")


def rl_early():
    d = D()
    d += elm.Resistor().right().label("20 Ω")
    d += elm.Inductor2().down().label("8 H")
    d += elm.Line().left()
    d += elm.Line().up()
    d += elm.CurrentLabelInline(direction="in").at(d.elements[0].start).label("10 A")
    save(d, "rl82_early")


def rl_late():
    d = D()
    d += elm.Resistor().right().label("4 Ω")
    d += elm.Inductor2().down().label("8 H")
    d += elm.Line().left()
    d += elm.Line().up()
    save(d, "rl82_late")


def y2022():
    d = D()
    d += elm.SourceI().up().label("10 A")
    d += elm.Switch(action="open").right().label("t=0")
    d += elm.Dot()
    n1 = d.here
    d += elm.Resistor().down().label("3 Ω")
    b1 = d.here
    d += elm.Line().right().at(n1).length(1.6)
    d += elm.Dot()
    n2 = d.here
    d += elm.Resistor().down().label("6 Ω").toy(b1)
    d += elm.Resistor().right().at(n2).label("3 Ω")
    n3 = d.here
    d += elm.Dot()
    d += elm.Resistor().down().label("9 Ω").toy(b1)
    d += elm.Inductor2().right().at(n3).label("2 H")
    d += elm.Line().down().toy(b1)
    d += elm.Line().left().tox(d.elements[0].start)
    save(d, "y2022")


def y2022_ic():
    d = D()
    d += elm.SourceI().up().label("10 A", loc="left")
    d += elm.Line().right().length(1.4)
    d += elm.Dot()
    n = d.here
    d += elm.Resistor().down().label("2 Ω", loc="left")
    b = d.here
    d += elm.Line().right().at(n).length(0.3)
    d += elm.Resistor().right().label("3 Ω")
    m = d.here
    d += elm.Dot()
    d += elm.Resistor().down().label("9 Ω").toy(b)
    d += elm.Line().right().at(m).length(2.0)
    d += elm.Label().at((m[0] + 1.0, m[1] + 0.45)).label("iL=4 A, L은 단락")
    d += elm.Line().down().toy(b)
    d += elm.Line().left().tox(d.elements[0].start)
    save(d, "y2022_ic")


def y2022_t():
    d = D()
    d += elm.Resistor().right().label("4.5 Ω")
    d += elm.Inductor2().down().label("2 H")
    d += elm.Line().left()
    d += elm.Line().up()
    save(d, "y2022_t")


def c_open_demo():
    d = D()
    d += elm.SourceV().label("DC").up()
    d += elm.Resistor().right().label("R")
    d += elm.Gap().down().label("C 개방")
    d += elm.Line().left()
    save(d, "dc_copen")


def l_short_demo():
    d = D()
    d += elm.SourceV().label("DC").up()
    d += elm.Resistor().right().label("R")
    d += elm.Line().down().label("L 단락")
    d += elm.Line().left()
    save(d, "dc_lshort")


def kill_v():
    d = D()
    d += elm.Line().up().label("전원 단락")
    d += elm.Resistor().right().label("Req")
    d += elm.Capacitor().down().label("C")
    d += elm.Line().left()
    save(d, "tau_v")


def ex62():
    d = D()
    d += elm.SourceV().label("20 V").up()
    d += elm.Resistor().right().label("6 kΩ")
    n = d.here
    d += elm.Dot()
    d += elm.Resistor().down().label("4 kΩ")
    b = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    d += elm.Resistor().right().at(n).label("1 kΩ")
    d += elm.Capacitor().down().label("C")
    d += elm.Line().left().tox(n)
    save(d, "ex62")


def ex62_open():
    d = D()
    d += elm.SourceV().label("20 V").up()
    d += elm.Resistor().right().label("6 kΩ")
    n = d.here
    d += elm.Dot().label("Vc = 8 V", "right")
    d += elm.Resistor().down().label("4 kΩ")
    b = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    save(d, "ex62_open")


def ex62_rth():
    d = D()
    d += elm.Line().up().label("20 V 단락", loc="left")
    d += elm.Resistor().right().label("6 kΩ")
    n = d.here
    d += elm.Dot()
    d += elm.Resistor().down().label("4 kΩ")
    b = d.here
    d += elm.Line().left()
    d += elm.Resistor().right().at(n).label("1 kΩ")
    c = d.here
    d += elm.Dot(open=True)
    d += elm.Gap().down().label("C 자리").toy(b)
    d += elm.Dot(open=True)
    d += elm.Line().left().tox(b)
    save(d, "ex62_rth")


def ex69():
    d = D()
    d += elm.Capacitor().up().label("5 mF")
    top = d.here
    d += elm.Line().left().length(1.8)
    d += elm.Dot()
    d += elm.Resistor().down().label("5 kΩ", loc="left")
    bot = d.here
    d += elm.Line().right().tox(d.elements[0].start)
    d += elm.Line().right().at(top).length(0.35)
    d += elm.Resistor().right().label("8 kΩ")
    n = d.here
    d += elm.Dot()
    d += elm.Resistor().down().label("12 kΩ", loc="right")
    d += elm.Line().left().tox(bot)
    save(d, "ex69")


def ex69_eq():
    d = D()
    d += elm.Capacitor().up().label("5 mF", loc="left")
    d += elm.Line().right().length(2.4)
    d += elm.Resistor().down().label("4 kΩ", loc="right")
    d += elm.Line().left()
    save(d, "ex69_eq")


def ex610():
    d = D()
    d += elm.SourceV().label("9 V").up()
    d += elm.Resistor().right().label("3 kΩ")
    d += elm.Switch(action="open").right().label("t=0")
    n = d.here
    d += elm.Dot()
    d += elm.Resistor().down().label("6 kΩ")
    b = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    d += elm.Resistor().right().at(n).label("4 kΩ")
    d += elm.Capacitor().down().label("C")
    d += elm.Line().left().tox(n)
    save(d, "ex610")


def ex610_t0():
    d = D()
    d += elm.SourceV().label("9 V").up()
    d += elm.Resistor().right().label("3 kΩ")
    n = d.here
    d += elm.Dot().label("6 V", "right")
    d += elm.Resistor().down().label("6 kΩ")
    b = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    save(d, "ex610_t0")


def ex610_t():
    d = D()
    d += elm.Resistor().right().label("4 kΩ").length(2.6)
    right = d.here
    left = d.elements[-1].start
    d += elm.Resistor().at(right).down().label("6 kΩ", loc="right").length(2.4)
    low = d.here
    d += elm.Capacitor().at(low).left().label("C").tox(left)
    d += elm.Line().up().toy(left)
    save(d, "ex610_t")


def ex64():
    d = D()
    d += elm.SourceV().label("12 V").up()
    d += elm.Resistor().right().label("8 kΩ")
    d += elm.Switch(action="close").right().label("t=0")
    n = d.here
    d += elm.Dot()
    d += elm.Resistor().down().label("6 kΩ").length(3.2)
    b = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    d += elm.Line().right().at(n).length(2.3)
    a = d.here
    d += elm.Dot().label("A", "top")
    d += elm.Resistor().down().label("1 kΩ").length(1.6)
    d += elm.Capacitor().down().label("20 mF").length(1.6)
    d += elm.Line().left().tox(b)
    d += elm.Resistor().right().at(a).label("12 kΩ")
    d += elm.Line().down().toy(b)
    d += elm.Line().left().tox(a)
    save(d, "ex64")


def ex64_t0():
    d = D()
    d += elm.SourceV().label("12 V").up()
    d += elm.Resistor().right().label("8 kΩ")
    n = d.here
    d += elm.Dot().label("A", "top")
    d += elm.Resistor().down().label("6 kΩ").length(2.5)
    b = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    d += elm.Resistor().right().at(n).label("12 kΩ")
    d += elm.Line().down().toy(b)
    d += elm.Line().left().tox(n)
    save(d, "ex64_t0")


def ex64_t():
    d = D()
    d += elm.Capacitor().up().label("20 mF")
    d += elm.Resistor().right().label("1 kΩ")
    n = d.here
    d += elm.Dot().label("A", "top")
    d += elm.Resistor().down().label("6 kΩ").length(2.4)
    b = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    d += elm.Resistor().right().at(n).label("12 kΩ")
    d += elm.Line().down().toy(b)
    d += elm.Line().left().tox(n)
    save(d, "ex64_t")


def ex611():
    d = D()
    d += elm.SourceV().label("12 V").up()
    d += elm.Resistor().right().label("4 kΩ")
    n = d.here
    d += elm.Dot().label("A", "top")
    d += elm.Resistor().down().label("4 kΩ").length(1.5)
    d += elm.Switch(action="open").down().label("t=0")
    b = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    d += elm.Capacitor().right().at(n).label("100 uF")
    d += elm.Line().down().toy(b)
    d += elm.Line().left().tox(n)
    save(d, "ex611")


def ex611_t0():
    d = D()
    d += elm.SourceV().label("12 V").up()
    d += elm.Resistor().right().label("4 kΩ")
    n = d.here
    d += elm.Dot().label("6 V", "right")
    d += elm.Resistor().down().label("4 kΩ")
    b = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    save(d, "ex611_t0")


def ex611_t():
    d = D()
    d += elm.Capacitor().up().label("100 μF")
    d += elm.Resistor().right().label("4 kΩ")
    d += elm.Line().down()
    d += elm.Line().left()
    save(d, "ex611_t")


def rc_charge():
    d = D()
    d += elm.SourceV().label("Vo").up()
    d += elm.Switch(action="close").right().label("충전")
    d += elm.Resistor().right().label("R")
    d += elm.Capacitor().down().label("C")
    d += elm.Line().left().tox(d.elements[0].start)
    save(d, "rc_charge")


def rc_free():
    d = D()
    d += elm.Capacitor().up().label("C, Vo")
    d += elm.Switch(action="close").right()
    d += elm.Resistor().down().label("R")
    d += elm.Line().left()
    save(d, "rc_free")


def series_rc(name, rlabel, clabel, vlabel="vs"):
    d = D()
    d += elm.SourceSin().label(vlabel).up()
    d += elm.Resistor().right().label(rlabel)
    d += elm.Capacitor().down().label(clabel)
    d += elm.Line().left()
    save(d, name)


def series_rl(name, rlabel, llabel, vlabel="vs"):
    d = D()
    d += elm.SourceSin().label(vlabel).up()
    d += elm.Resistor().right().label(rlabel)
    d += elm.Inductor2().down().label(llabel)
    d += elm.Line().left()
    save(d, name)


def series_rlc():
    d = D()
    d += elm.SourceSin().label("5 Vrms").up()
    d += elm.Resistor().right().label("820 Ω")
    d += elm.Inductor2().right().label("2 mH")
    d += elm.Capacitor().down().label("C")
    d += elm.Line().left().tox(d.elements[0].start)
    save(d, "ex129")


def zbox(name, parts, vlabel="V"):
    d = D()
    d += elm.SourceSin().label(vlabel).up()
    for label in parts:
        d += elm.RBox().right().label(label)
    d += elm.Line().down()
    d += elm.Line().left().tox(d.elements[0].start)
    save(d, name)


def nsummer():
    """세 입력은 양단자, 접지 저항 두 개. 양단자 선은 음단자 접지 기호 아래로 내려 그린다."""
    d = D()
    op = d.add(elm.Opamp().at((10.4, 0)))
    g = (op.in1.x - 1.15, op.in1.y)
    d += elm.Line().at(op.in1).to(g)
    d += elm.Dot().at(g)
    d += elm.Resistor().at(g).down().label("R", loc="left").length(0.55)
    d += elm.Ground()
    d += elm.Line().at(op.out).right().length(1.05).label("vo", "right")
    top = (g[0], g[1] + 1.25)
    d += elm.Line().at(op.out).to((op.out.x, top[1]))
    d += elm.Resistor().at((op.out.x, top[1])).to(top).label("2R")
    d += elm.Line().at(top).to(g)
    d += elm.Line().at(op.in2).down().length(1.85)
    low = d.here
    p = (op.in2.x - 3.3, low.y)
    d += elm.Line().to(p)
    d += elm.Dot().at(p)
    d += elm.Resistor().at(p).left().label("R").length(2.0)
    d += elm.Dot().label("Va", "left")
    up = (p[0], p[1] + 1.35)
    d += elm.Line().at(p).to(up)
    d += elm.Dot().at(up)
    d += elm.Resistor().at(up).left().label("R").length(2.0)
    d += elm.Dot().label("Vb", "left")
    dn = (p[0], p[1] - 1.35)
    d += elm.Line().at(p).to(dn)
    d += elm.Dot().at(dn)
    d += elm.Resistor().at(dn).left().label("R").length(2.0)
    d += elm.Dot().label("Vc", "left")
    g1 = (p[0] + 0.85, p[1])
    d += elm.Line().at(p).to(g1)
    d += elm.Resistor().at(g1).down().label("R").length(2.0)
    d += elm.Ground()
    g2 = (p[0] + 1.7, p[1])
    d += elm.Line().at(p).to(g2)
    d += elm.Resistor().at(g2).down().label("R").length(2.0)
    d += elm.Ground()
    save(d, "nsummer")


def nsummer_va():
    """Va만 살린 등가. 분배 전압 Va/4, 궤환 2R, 출력 3Va/4."""
    d = D()
    op = d.add(elm.Opamp().at((7.2, 0)))
    g = (op.in1.x - 1.2, op.in1.y)
    d += elm.Line().at(op.in1).to(g)
    d += elm.Dot().at(g)
    d += elm.Resistor().at(g).down().label("R", loc="left").length(0.55)
    d += elm.Ground()
    d += elm.Line().at(op.out).right().length(1.35).label("3Va/4", "right")
    top = (g[0], g[1] + 1.25)
    d += elm.Line().at(op.out).to((op.out.x, top[1]))
    d += elm.Resistor().at((op.out.x, top[1])).to(top).label("2R")
    d += elm.Line().at(top).to(g)
    d += elm.Line().at(op.in2).down().length(1.7)
    low = d.here
    n = (op.in2.x - 2.4, low.y)
    d += elm.Line().to(n)
    d += elm.Dot().at(n).label("Va/4", "top")
    d += elm.Resistor().at(n).left().label("R").length(2.2)
    d += elm.Dot().label("Va", "left")
    d += elm.Resistor().at(n).down().label("R/3").length(2.2)
    d += elm.Ground()
    save(d, "nsummer_va")


def ex81():
    d = D()
    d += elm.SourceI().up().label("is(t)", loc="left")
    d += elm.Line().right().length(1.8)
    n = d.here
    d += elm.Dot().label("a", "top")
    d += elm.Resistor().down().label("R")
    b = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    d += elm.Inductor2().right().at(n).label("L")
    d += elm.Line().down().toy(b)
    d += elm.Line().left().tox(n)
    save(d, "ex81")


def ex83():
    d = D()
    d += elm.SourceI().up().label("10 A")
    d += elm.Switch(action="open").right().label("t=0")
    n = d.here
    d += elm.Dot()
    d += elm.Resistor().down().label("2 Ω")
    b = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    d += elm.Line().right().at(n).length(1.6)
    m = d.here
    d += elm.Dot()
    d += elm.Inductor2().down().label("2 mH").toy(b)
    d += elm.Line().right().at(m).length(0.3)
    d += elm.Switch(action="close").right().label("t=1 ms")
    d += elm.Resistor().down().label("2 Ω").toy(b)
    d += elm.Line().left().tox(b)
    save(d, "ex83")


def ex83_t0():
    d = D()
    d += elm.SourceI().up().label("10 A", loc="left")
    d += elm.Line().right().length(2.2)
    n = d.here
    d += elm.Dot()
    d += elm.Resistor().down().label("2 Ω")
    b = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    d += elm.Line().right().at(n).length(1.6).label("L 단락", loc="top")
    d += elm.Line().down().toy(b)
    d += elm.Line().left().tox(n)
    save(d, "ex83_t0")


def ex83_early():
    d = D()
    d += elm.Inductor2().right().label("2 mH")
    d += elm.Resistor().down().label("2 Ω")
    d += elm.Line().left()
    d += elm.Line().up()
    save(d, "ex83_early")


def ex83_late():
    d = D()
    d += elm.Inductor2().right().label("2 mH")
    d += elm.Resistor().down().label("1 Ω")
    d += elm.Line().left()
    d += elm.Line().up()
    save(d, "ex83_late")


def ex71():
    d = D()
    d += elm.SourceI().up().label("I(t)")
    d += elm.Line().right().length(1.2)
    d += elm.Capacitor().down().label("C")
    d += elm.Line().left()
    save(d, "ex71")


def ex72():
    d = D()
    d += elm.SourceV().up().label("vL(t)")
    d += elm.Inductor2().right().label("0.5 H")
    d += elm.Line().down()
    d += elm.Line().left()
    save(d, "ex72")


def ex73():
    d = D()
    d += elm.Line().right().length(0.35)
    n = d.here
    d += elm.Dot()
    d += elm.Inductor2().down().label("6 H", loc="left").length(1.5)
    d += elm.Line().down().length(0.7)
    b = d.here
    d += elm.Inductor2().right().at(n).label("1.5 H")
    m = d.here
    d += elm.Dot()
    d += elm.Inductor2().down().label("1 H", loc="left").length(1.5)
    d += elm.Line().down().toy(b)
    d += elm.Line().right().at(m).length(1.7)
    d += elm.Inductor2().down().label("4 H", loc="right").length(1.5)
    d += elm.Line().down().toy(b)
    d += elm.Line().right().at(m).length(3.6)
    d += elm.Inductor2().right().label("5/6 H")
    d += elm.Inductor2().down().label("0.5 H", loc="right").length(1.5)
    d += elm.Line().down().toy(b)
    d += elm.Line().left().tox(b)
    save(d, "ex73")


def ex74():
    """교재 그림 7-15. 0.3, 0.25, 0.45는 병렬, 0.9 mF는 그 아래 직렬."""
    d = D()
    d += elm.Dot()
    d += elm.Capacitor().right().label("1.125 mF").length(2.2)
    n = d.here
    d += elm.Dot()
    c03 = d.add(elm.Capacitor().at(n).down().length(2.2))
    d += elm.Label().at(c03.center).label("0.3 mF", loc="left")
    b = d.here
    d += elm.Line().right().at(n).length(2.15)
    c25 = d.add(elm.Capacitor().down().length(2.2))
    d += elm.Label().at(c25.center).label("0.25 mF", loc="left")
    d += elm.Line().right().at(n).length(4.3)
    far = d.here
    c45 = d.add(elm.Capacitor().down().length(2.2))
    d += elm.Label().at(c45.center).label("0.45 mF", loc="left")
    d += elm.Line().at(b).right().tox(far)
    d += elm.Capacitor().at((n[0] + 2.15, b[1])).down().label("0.9 mF").length(1.8)
    end = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    d += elm.Dot()
    save(d, "ex74")


def ex102():
    series_rl("ex102", "3 Ω", "2 H", "10 sin 3t")


def ex102z():
    zbox("ex102z", ["3 Ω", "j6 Ω"], "10∠0")


def integ():
    d = D()
    d += elm.Dot().label("vin", "left")
    d += elm.Resistor().right().label("R1")
    n = d.here
    op = d.add(elm.Opamp().anchor("in1"))
    d += elm.Line().at(op.out).right().length(1.2).label("vout", "right")
    d += elm.Line().at(op.out).up().length(1.3)
    d += elm.Capacitor().left().label("C2").tox(n)
    d += elm.Line().down().toy(n)
    d += elm.Line().at(op.in2).down().length(1.2)
    d += elm.Ground()
    save(d, "integ")


def integz():
    d = D()
    d += elm.Dot().label("Vin", "left")
    d += elm.RBox().right().label("R1")
    n = d.here
    op = d.add(elm.Opamp().anchor("in1"))
    d += elm.Line().at(op.out).right().length(1.2).label("Vout", "right")
    d += elm.Line().at(op.out).up().length(1.3)
    d += elm.RBox().left().label("1/jωC2").tox(n)
    d += elm.Line().down().toy(n)
    d += elm.Line().at(op.in2).down().length(1.2)
    d += elm.Ground()
    save(d, "integz")


def ex107():
    d = D()
    d += elm.SourceI().up().label("cos 4t", loc="left")
    d += elm.Line().right().length(1.7)
    n = d.here
    d += elm.Dot()
    d += elm.Inductor2().down().label("0.25 H", loc="right")
    b = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    d += elm.SourceControlledV().right().at(n).label("0.25 ic")
    a = d.here
    d += elm.Dot().label("a", "top")
    d += elm.Capacitor().down().label("0.5 F").toy(b)
    d += elm.Resistor().right().at(a).label("1.2 Ω")
    d += elm.Line().down().toy(b)
    d += elm.Line().left().tox(b)
    save(d, "ex107")


def ex107z():
    d = D()
    d += elm.SourceI().up().label("1∠0", loc="left")
    d += elm.Line().right().length(1.7)
    n = d.here
    d += elm.Dot()
    d += elm.Inductor2().down().label("j1", loc="right")
    b = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    d += elm.SourceControlledV().right().at(n).label("0.25 Ic")
    a = d.here
    d += elm.Dot().label("a", "top")
    d += elm.Capacitor().down().label("-j0.5").toy(b)
    d += elm.Line().right().at(a).length(1.35)
    d += elm.Dot().label("개방", "right")
    save(d, "ex107z")


def ex107_sc():
    d = D()
    d += elm.SourceI().up().label("1∠0", loc="left")
    d += elm.Line().right().length(1.7)
    n = d.here
    d += elm.Dot()
    d += elm.Inductor2().down().label("j1", loc="right")
    b = d.here
    d += elm.Line().left().tox(d.elements[0].start)
    d += elm.SourceControlledV().right().at(n).label("0")
    a = d.here
    d += elm.Dot()
    d += elm.Capacitor().down().label("-j0.5").toy(b)
    d += elm.Line().right().at(a).length(1.35).label("Isc", loc="top")
    d += elm.Line().down().toy(b)
    d += elm.Line().left().tox(b)
    save(d, "ex107_sc")


def ex107_th():
    d = D()
    d += elm.SourceSin().up().label("0.894∠-63.4°")
    d += elm.RBox().right().label("0.4 Ω")
    d += elm.RBox().right().label("-j0.8 Ω")
    d += elm.Resistor().down().label("1.2 Ω")
    d += elm.Line().left().tox(d.elements[0].start)
    save(d, "ex107_th")


def main():
    inv_amp()
    noninv_amp()
    follower()
    load_before()
    load_after()
    buffer_load()
    summer()
    nsummer()
    nsummer_va()
    diff_amp()
    bridge()
    bridge_div()
    bridge_rth()
    bridge_th()
    rl_switch_full()
    rl_early()
    rl_late()
    y2022()
    y2022_ic()
    y2022_t()
    ex81()
    ex83()
    ex83_t0()
    ex83_early()
    ex83_late()
    ex71()
    ex72()
    ex73()
    ex74()
    c_open_demo()
    l_short_demo()
    kill_v()
    ex62()
    ex62_open()
    ex62_rth()
    ex69()
    ex69_eq()
    ex610()
    ex610_t0()
    ex610_t()
    ex64()
    ex64_t0()
    ex64_t()
    ex611()
    ex611_t0()
    ex611_t()
    rc_charge()
    rc_free()
    series_rc("ex123", "R", "C", "10 Vrms, 2.5 kHz")
    zbox("ex123z", ["R", "-jXc"], "10 Vrms")
    zbox("ex123eq", ["7.91 kΩ ∠-53.6°"], "10 Vrms")
    series_rl("ex124", "1 kΩ", "15 mH", "vs, 10 kHz")
    zbox("ex124z", ["1 kΩ", "j942.5 Ω"], "V")
    zbox("ex124eq", ["1374 Ω ∠43.3°"], "V")
    series_rc("ex125", "2.7 kΩ", "C", "10 Vrms, 2 kHz")
    zbox("ex125z", ["2.7 kΩ", "-j1.693 kΩ"], "10 Vrms")
    series_rl("ex127", "470 Ω", "1 mH", "5 Vrms, 100 kHz")
    zbox("ex127z", ["470 Ω", "j628 Ω"], "5 Vrms")
    zbox("ex127eq", ["785 Ω ∠53.2°"], "5 Vrms")
    ex102()
    ex102z()
    integ()
    integz()
    ex107()
    ex107z()
    ex107_sc()
    ex107_th()
    series_rlc()
    zbox("ex129z", ["820 Ω", "j628 Ω", "-j318 Ω"], "5 Vrms")
    zbox("ex129eq", ["877 Ω ∠20.7°"], "5 Vrms")


if __name__ == "__main__":
    main()
