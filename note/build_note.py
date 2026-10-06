#!/usr/bin/env python3
"""기초 회로이론 6·7·8·10장과 수업 필기를 단권화한 노트 PDF."""

import os
import re

from reportlab.lib.colors import Color, white
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    ListFlowable,
    ListItem,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Image,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

FIGDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "figures")

pdfmetrics.registerFont(TTFont("Nanum", "/usr/share/fonts/truetype/nanum/NanumGothic.ttf"))
pdfmetrics.registerFont(TTFont("NanumBold", "/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf"))
pdfmetrics.registerFontFamily(
    "Nanum", normal="Nanum", bold="NanumBold", italic="Nanum", boldItalic="NanumBold"
)

NAVY = Color(0.09, 0.20, 0.32)
BLUE = Color(0.12, 0.36, 0.58)
TEAL = Color(0.11, 0.42, 0.45)
INK = Color(0.12, 0.14, 0.18)
MUTED = Color(0.33, 0.38, 0.44)
LINE = Color(0.78, 0.82, 0.86)
PAPER = Color(0.96, 0.97, 0.98)
MAIN_BG = Color(0.93, 0.96, 0.98)
DETAIL_BG = Color(0.95, 0.96, 0.97)
CONF_BG = Color(1.0, 0.96, 0.90)
CONF_BD = Color(0.72, 0.43, 0.08)
FORM_BG = Color(0.94, 0.95, 0.93)
EX_BG = Color(0.94, 0.96, 0.94)

PAGE_W, PAGE_H = A4
LEFT = 16 * mm
RIGHT = 16 * mm
TOP = 16 * mm
BOTTOM = 14 * mm
CONTENT_W = PAGE_W - LEFT - RIGHT


def S(name, **kw):
    base = dict(
        fontName="Nanum",
        textColor=INK,
        wordWrap="CJK",
        leading=15,
    )
    base.update(kw)
    return ParagraphStyle(name, **base)


STY = {
    "cover_kicker": S("cover_kicker", fontName="NanumBold", fontSize=10, leading=14, textColor=BLUE, alignment=TA_CENTER),
    "cover_title": S("cover_title", fontName="NanumBold", fontSize=26, leading=34, textColor=NAVY, alignment=TA_CENTER),
    "cover_sub": S("cover_sub", fontSize=11, leading=17, textColor=MUTED, alignment=TA_CENTER),
    "h1": S("h1", fontName="NanumBold", fontSize=15, leading=20, textColor=NAVY, spaceBefore=8, spaceAfter=4),
    "h2": S("h2", fontName="NanumBold", fontSize=12, leading=16, textColor=BLUE, spaceBefore=8, spaceAfter=3),
    "h3": S("h3", fontName="NanumBold", fontSize=10.5, leading=14, textColor=TEAL, spaceBefore=6, spaceAfter=2),
    "body": S("body", fontSize=9.5, leading=14.5, alignment=TA_JUSTIFY, spaceAfter=3),
    "small": S("small", fontSize=8.5, leading=12.5, textColor=MUTED, spaceAfter=2),
    "bullet": S("bullet", fontSize=9.5, leading=13.5, leftIndent=2),
    "formula": S("formula", fontName="NanumBold", fontSize=9.5, leading=13.5, textColor=NAVY, alignment=TA_LEFT),
    "box_title": S("box_title", fontName="NanumBold", fontSize=9, leading=12, textColor=NAVY, spaceAfter=2),
    "box_body": S("box_body", fontSize=9, leading=13, alignment=TA_LEFT),
    "conf_title": S("conf_title", fontName="NanumBold", fontSize=9, leading=12, textColor=CONF_BD, spaceAfter=2),
    "th": S("th", fontName="NanumBold", fontSize=8, leading=11, textColor=white, alignment=TA_CENTER),
    "td": S("td", fontSize=8, leading=11, alignment=TA_CENTER),
    "td_left": S("td_left", fontSize=8, leading=11, alignment=TA_LEFT),
    "toc": S("toc", fontSize=11, leading=18),
    "footer": S("footer", fontSize=8, leading=10, textColor=MUTED),
}


def P(text, style="body"):
    return Paragraph(text, STY[style])


def bullet_list(items):
    flow = []
    for item in items:
        flow.append(ListItem(Paragraph(item, STY["bullet"]), leftIndent=10, bulletColor=BLUE))
    return ListFlowable(
        flow,
        bulletType="bullet",
        start="•",
        leftIndent=12,
        bulletFontName="Nanum",
        bulletFontSize=9,
        spaceBefore=1,
        spaceAfter=4,
    )


def boxed(title, paragraphs, bg, border, title_style="box_title"):
    inner_w = CONTENT_W - 12
    bits = [Paragraph(title, STY[title_style])]
    for text in paragraphs:
        bits.append(Paragraph(text, STY["box_body"]))
    data = [[bits]]
    table = Table(data, colWidths=[CONTENT_W])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), bg),
                ("BOX", (0, 0), (-1, -1), 0.8, border),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return KeepTogether([table, Spacer(1, 6)])


def main_box(title, paragraphs):
    return boxed("주요  ·  " + title, paragraphs, MAIN_BG, BLUE)


def detail_box(title, paragraphs):
    return boxed("세부  ·  " + title, paragraphs, DETAIL_BG, LINE)


def confuse_box(paragraphs):
    return boxed("혼동하기 쉬운 것", paragraphs, CONF_BG, CONF_BD, "conf_title")


def formula(lines):
    bits = [Paragraph(line, STY["formula"]) for line in lines]
    table = Table([[bits]], colWidths=[CONTENT_W])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), FORM_BG),
                ("LINEBEFORE", (0, 0), (0, 0), 3, TEAL),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return KeepTogether([table, Spacer(1, 6)])


def example_box(title, paragraphs):
    return boxed("예제  ·  " + title, paragraphs, EX_BG, TEAL)


def _tex_plain(s):
    s = s.replace("\\,", " ").replace("\\ ", " ").replace("\\;", " ").replace("\\!", "")
    s = s.replace("\\bigl", "").replace("\\bigr", "").replace("\\Bigl", "").replace("\\Bigr", "")
    s = s.replace("\\begin{aligned}", " ").replace("\\end{aligned}", " ")
    s = s.replace("\\begin{align*}", " ").replace("\\end{align*}", " ")
    s = s.replace("\\\\", " ")
    s = re.sub(r"\^\{?\\circ\}?", "°", s)
    for _ in range(6):
        s2 = re.sub(r"\\sqrt\{([^{}]*)\}", r"sqrt(\1)", s)
        if s2 == s:
            break
        s = s2
    s = re.sub(r"\\d?frac\s*([0-9])\s*([0-9])", r"(\1)/(\2)", s)
    for _ in range(4):
        s2 = re.sub(
            r"\\(sin|cos|tan)\s*\\d?frac\{([^{}]*)\}\{([^{}]*)\}",
            r"\1((\2)/(\3))",
            s,
        )
        if s2 == s:
            break
        s = s2
    for _ in range(4):
        s2 = re.sub(r"\\mathrm\{([^{}]*)\}", r"\1", s)
        s2 = re.sub(r"\\text\{([^{}]*)\}", r"\1", s2)
        s2 = re.sub(r"\\dfrac\{([^{}]*)\}\{([^{}]*)\}", r"(\1)/(\2)", s2)
        s2 = re.sub(r"\\frac\{([^{}]*)\}\{([^{}]*)\}", r"(\1)/(\2)", s2)
        if s2 == s:
            break
        s = s2
    repl = {
        "\\rightarrow": "→", "\\Rightarrow": "→", "\\infty": "∞", "\\Omega": "Ω",
        "\\omega": "ω", "\\theta": "θ", "\\tau": "τ", "\\pi": "π", "\\mu": "μ",
        "\\qquad": " ", "\\quad": " ", "\\approx": "≈", "\\cdot": "·", "\\times": "×",
        "\\exp": "exp", "\\sqrt": "sqrt", "\\circ": "°", "\\sin": "sin", "\\cos": "cos",
        "\\tan": "tan", "\\ln": "ln", "\\log": "log", "\\left": "", "\\right": "",
        "\\displaystyle": "", "\\mathrm": "", "\\text": "", "\\Big": "", "\\big": "",
        "\\leq": "<=", "\\geq": ">=", "\\le": "<=", "\\ge": ">=", "\\neq": "≠",
        "\\to": "→", "\\,": " ",
    }
    for a, b in sorted(repl.items(), key=lambda kv: len(kv[0]), reverse=True):
        s = s.replace(a, b)
    s = s.replace("\\(", "").replace("\\)", "").replace("\\[", "").replace("\\]", "")
    s = re.sub(r"\\[a-zA-Z]+", "", s)
    s = s.replace("\\", " ")
    s = re.sub(r"e\^\{([^{}]*)\}", r"exp(\1)", s)
    s = s.replace("{", "").replace("}", "")
    s = s.replace("$", "").replace("*", "").replace("&", " ").replace("−", "-").replace("–", "-")
    s = s.replace("<", "&lt;").replace(">", "&gt;")
    s = re.sub(r"[ \t]+", " ", s)
    return s.strip()


def practice_items(path):
    raw = open(path, encoding="utf-8").read()
    chunks = re.split(r"\n### ", raw)
    out = []
    for chunk in chunks[1:]:
        title, _, body = chunk.partition("\n")
        body = re.split(r"\n## ", body, maxsplit=1)[0]
        title = _tex_plain(title)
        if title.startswith("확신") or title.startswith("막힌") or title.startswith("그림"):
            continue
        answer_lines = []
        lines = body.splitlines()
        for i, line in enumerate(lines):
            if any(k in line for k in ("**답:**", "**최종 답:**", "**정답:**")):
                rest = re.split(r"\*\*(?:답|최종 답|정답):\*\*", line, maxsplit=1)[-1].strip()
                block = [rest] if rest else []
                base_indent = len(line) - len(line.lstrip(" "))
                j = i + 1
                while j < len(lines):
                    raw = lines[j]
                    n = raw.strip()
                    indent = len(raw) - len(raw.lstrip(" "))
                    if n.startswith("- **") or (n.startswith("**") and indent <= base_indent):
                        break
                    if n.startswith("- ") and indent <= base_indent:
                        break
                    if not n:
                        nxt = lines[j + 1] if j + 1 < len(lines) else ""
                        nxt_s = nxt.strip()
                        nxt_indent = len(nxt) - len(nxt.lstrip(" "))
                        if nxt_s.startswith("|") or nxt_s.startswith("\\") or (
                            nxt_s.startswith("-") and nxt_indent > base_indent
                        ):
                            j += 1
                            continue
                        break
                    if n.startswith("|"):
                        if re.match(r"^\|[\s:\-|]+\|$", n):
                            j += 1
                            continue
                        cells = [c.strip() for c in n.strip("|").split("|")]
                        if len(cells) >= 2 and cells[0] not in ("노드", "---"):
                            block.append(cells[0] + " = " + cells[1])
                        j += 1
                        continue
                    block.append(n.lstrip("- ").strip())
                    j += 1
                answer_lines.append(" ".join(x for x in block if x))
                break
        if not answer_lines:
            for line in lines:
                t = line.strip()
                if not t.startswith("- ") or t.startswith("- 회로") or t.startswith("- 신뢰"):
                    continue
                body_l = t[2:].strip()
                if re.search(r"\([tT]\)\s*=", body_l) or re.search(r"^[①②③④⑤]", body_l):
                    answer_lines.append(body_l)
        conf = ""
        if "중간" in body and ("확신" in body or "신뢰" in body):
            conf = " 그림 판독은 한 번 더 볼 것."
        if "확정하지" in body or "만들지 않" in body:
            conf = " 그림만으로 한 값으로 정하지 않음."
        summary = ""
        for line in body.splitlines():
            t = line.strip().lstrip("- ").strip()
            if "회로:" in t[:12] or t.startswith("**회로:**") or t.startswith("**주어진 값:**"):
                summary = t.split(":", 1)[-1]
                break
        bits = []
        if summary:
            bits.append(_tex_plain(summary)[:280])
        if answer_lines:
            ans = " ".join(_tex_plain(x) for x in answer_lines[:6])
            bits.append(("답. " + ans)[:1100] + conf)
        elif "정답" in title:
            bits.append(title + conf)
        if bits:
            out.append((title[:90], bits))
    return out


def figstrip(items, max_h_mm=48):
    """items: (파일 이름, 캡션). 원래 회로와 풀이 중 다시 그린 회로를 나란히 둔다."""
    n = len(items)
    col_w = CONTENT_W / n
    max_h = max_h_mm * mm
    imgs = []
    caps = []
    for name, cap in items:
        im = Image(os.path.join(FIGDIR, name + ".png"))
        scale = min((col_w - 6) / float(im.imageWidth), max_h / float(im.imageHeight))
        im.drawWidth = im.imageWidth * scale
        im.drawHeight = im.imageHeight * scale
        imgs.append(im)
        caps.append(Paragraph(cap, STY["small"]))
    table = Table([imgs, caps], colWidths=[col_w] * n)
    table.setStyle(
        TableStyle(
            [
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, 0), "MIDDLE"),
                ("VALIGN", (0, 1), (-1, 1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 2),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2),
                ("TOPPADDING", (0, 0), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                ("BACKGROUND", (0, 0), (-1, -1), white),
            ]
        )
    )
    return KeepTogether([table, Spacer(1, 4)])


def comparison_table(headers, rows):
    head = [Paragraph(h, STY["th"]) for h in headers]
    data = [head]
    for row in rows:
        data.append([Paragraph(c, STY["td_left"] if i == 0 else STY["td"]) for i, c in enumerate(row)])
    col_w = CONTENT_W / len(headers)
    table = Table(data, colWidths=[col_w] * len(headers), repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), white),
                ("BACKGROUND", (0, 1), (-1, -1), white),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, PAPER]),
                ("GRID", (0, 0), (-1, -1), 0.4, LINE),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return KeepTogether([table, Spacer(1, 8)])


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, PAGE_H - 9 * mm, PAGE_W, 9 * mm, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Nanum", 8)
    canvas.drawString(LEFT, PAGE_H - 6 * mm, "회로이론 단권화 노트")
    canvas.drawRightString(PAGE_W - RIGHT, PAGE_H - 6 * mm, "6 · 7 · 8 · 10장")
    canvas.setFillColor(LINE)
    canvas.rect(0, 0, PAGE_W, 9 * mm, fill=1, stroke=0)
    canvas.setFillColor(MUTED)
    canvas.setFont("Nanum", 8)
    canvas.drawString(LEFT, 4 * mm, "기초 회로이론 · 수업 필기 · Floyd · 이상화 교수 자료")
    canvas.drawRightString(PAGE_W - RIGHT, 4 * mm, str(doc.page))
    canvas.restoreState()


def cover_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, PAGE_H - 28 * mm, PAGE_W, 28 * mm, fill=1, stroke=0)
    canvas.setFillColor(TEAL)
    canvas.rect(0, 0, PAGE_W, 16 * mm, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Nanum", 9)
    canvas.drawString(LEFT, 7 * mm, "자료에 있는 내용만 재구성")
    canvas.restoreState()


def build():
    story = []

    story.append(Spacer(1, 28 * mm))
    story.append(P("기초 회로이론", "cover_kicker"))
    story.append(Spacer(1, 4 * mm))
    story.append(P("단권화 노트", "cover_title"))
    story.append(Spacer(1, 4 * mm))
    story.append(P("연산증폭기 · 에너지 저장소자<br/>RL/RC 완전응답 · 정현파 정상상태", "cover_sub"))
    story.append(Spacer(1, 10 * mm))
    story.append(
        comparison_table(
            ["구분", "출처"],
            [
                ["연산증폭기", "교재 6장, 필기 9/15 · 9/16 · 9/22"],
                ["커패시터 · 인덕터", "교재 7장"],
                ["RL/RC 완전응답", "교재 8장, 필기 9/23 · 9/29 · 10/6"],
                ["정현파 정상상태", "교재 10장, Floyd 10.4.3 (9/15)"],
                ["LSH 문제", "이상화 교수 자료. 쪽수는 그 자료 기준"],
            ],
        )
    )
    story.append(P("이상화 교수 자료에서 6장으로 적힌 RL/RC 문제는 교재 8장과 같은 내용이다.", "small"))
    story.append(Spacer(1, 6 * mm))
    story.append(P("주요와 세부를 나누고, 서로 바꾸어 외우기 쉬운 것은 따로 모았다.", "cover_sub"))

    story.append(NextPageTemplate("body"))
    story.append(PageBreak())

    story.append(P("1.  네 부분이 어떻게 이어지는가", "h1"))
    story.append(
        P(
            "이 범위는 네 덩어리다. 연산증폭기는 저항회로에 이상 조건을 더해 푸는 문제다. "
            "커패시터와 인덕터는 전압·전류가 미분이 되는 저장소자다. 그 소자가 저항과 하나만 있으면 1차 회로가 되고, "
            "완전응답은 과도응답과 정상상태응답의 합이다. 입력이 정현파이면 정상상태만 다시 페이저와 임피던스로 계산한다."
        )
    )
    story.append(
        formula(
            [
                "저장소자 법칙  →  DC 스위칭은 시간영역의 1차 미분방정식",
                "정현파 정상상태  →  미분·적분이 임피던스 곱으로 바뀐다",
            ]
        )
    )
    story.append(P("응답을 나누는 두 가지 덧셈", "h2"))
    story.append(
        P(
            "교재 8장은 같은 완전응답을 두 방식으로 나눈다. 이름만 같고 내용이 다른 것이 아니므로, 어떤 덧셈인지 먼저 본다."
        )
    )
    story.append(
        formula(
            [
                "완전응답  =  과도응답  +  정상상태응답",
                "완전응답  =  무상태응답  +  무전원응답",
                "과도응답  ≠  무전원응답",
            ]
        )
    )
    story.append(
        comparison_table(
            ["상황", "커패시터", "인덕터", "넘기는 값"],
            [
                ["DC, 오래 지난 뒤", "개방", "단락", "—"],
                ["스위치 직후", "전압은 연속", "전류는 연속", "vC 또는 iL"],
                ["정현파 정상상태", "ZC = 1/(jωC)", "ZL = jωL", "페이저"],
            ],
        )
    )
    story.append(
        confuse_box(
            [
                "전원을 죽이는 그림과, 전원을 살리고 저장소자만 개방·단락하는 그림은 다르다. 등가저항과 무전원응답은 전원을 죽인다. DC 최종값은 전원을 살려 둔다.",
                "정현파 정상상태 식은 과도항을 주지 않는다. 스위치를 막 닫은 직후라면 8장의 완전응답이 먼저다.",
            ]
        )
    )

    story.append(P("2.  연산증폭기", "h1"))
    story.append(P("교재 6장. 필기 9/15, 9/16, 9/22.", "small"))
    story.append(
        main_box(
            "이상 연산증폭기",
            [
                "입력전압을 전원이득으로 키워 출력전압을 만드는 회로다. 안은 트랜지스터 같은 비선형 소자로 되어 있으나, 이 장에서는 이상을 가정하고 바깥 회로만 해석한다.",
                "조건 1.  i+ = i- = 0.  입력저항이 무한대라 입력 단자로 전류가 들어가지 않는다.",
                "조건 2.  v+ = v-.  두 입력은 열린 것으로 보지만 전압은 같다. 이것을 가상 단락이라 한다.",
            ],
        )
    )
    story.append(
        detail_box(
            "필기가 같이 적어 둔 이상 성질",
            [
                "입력 임피던스 무한, 출력 임피던스 0, 개방루프 이득 A 무한, 대역폭 무한.",
                "개방루프 관계식은  vo = A(v+ - v-)  이고, 이상에서는 A가 무한이다.",
                "실제 소자(참고 6-1)는 바이어스 전원 V+, V- 안에서만 증폭된다. 입력저항은 무한이 아니고, 출력저항은 0이 아니며, A도 무한이 아니다.",
            ],
        )
    )
    story.append(P("저항회로 두 형태", "h2"))
    story.append(
        P(
            "반전은 입력이 음단자로 들어가 출력 부호가 바뀌는 형태다. 비반전은 입력이 양단자로 들어가 출력 부호가 같다. "
            "연산증폭기 내부 구성을 모르는 상태에서는 메시를 정하기 어려우므로, 교재는 노드해석을 쓴다."
        )
    )
    story.append(
        formula(
            [
                "반전 이득     vo / vi  =  - R2 / R1",
                "비반전 이득   vo / vi  =  1 + R2 / R1",
            ]
        )
    )
    story.append(
        detail_box(
            "반전 이득이 나오는 과정",
            [
                "양단자를 접지하면 가상 단락으로 음단자 전압도 0이다.",
                "음단자에서 KCL을 세우면 입력으로 들어온 전류가 되먹임 저항으로 그대로 나간다. i+ = i- = 0 이기 때문이다.",
                "그 결과가  vo = -(R2/R1) vi  다.",
            ],
        )
    )
    story.append(
        detail_box(
            "비반전 이득이 나오는 과정 (필기 9/16)",
            [
                "출력과 음단자 사이의 저항, 음단자와 접지 사이의 저항에 KCL을 세운다.",
                "i = 0 이고, 가상 단락으로 음단자 전압이 입력전압과 같다.",
                "정리하면 이득은  1 + R2/R1  이다.",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("inv", "반전. 양단자는 접지하고, 음단자에서 KCL을 세운다."),
                ("noninv", "비반전. vi는 양단자, R1은 음단자에서 접지로 간다."),
            ]
        )
    )
    story.append(P("노드를 세는 순서", "h2"))
    story.append(
        P(
            "참고 6-2. 노드가 N개면 접지를 빼서 독립식은 N-1개다. 일부는 입력 쪽과 출력 쪽 KCL에서 나오고, "
            "나머지는 접지된 전압원이 바로 정해 주는 제약식이다. 부유 전압원이 있으면 그 두 노드를 슈퍼노드로 묶는다. "
            "슈퍼노드에서 제약식 하나와 KCL 하나가 나온다."
        )
    )
    story.append(P("전압추종기와 부하효과", "h2"))
    story.append(
        main_box(
            "전압추종기",
            [
                "출력을 음단자로 그대로 되돌린 회로다. 가상 단락으로 입력전압, 음단자 전압, 출력전압이 같다.",
                "이득은 1이다. 앞 단 전압을 다음 단 입력으로 그대로 넘기려고 넣는다. 분리기, 버퍼라고도 한다.",
                "필기 9/22. 이상 연산증폭기의 입력저항은 무한대다. 추종기 앞의 분배 전압은 R1, R2만으로 정해지고, R2 위쪽은 개방으로 본다.",
            ],
        )
    )
    story.append(
        detail_box(
            "부하효과 (참고 6-3, 필기)",
            [
                "전압분배 출력을 부하에 직접 달면, 부하가 아래 저항과 병렬이 되어 분배 전압이 내려간다.",
                "필기 숫자. 10 V, 위 10 kΩ, 아래 10 kΩ. 무부하면 아래가 10 kΩ이다. 10 kΩ 부하를 달면 아래는 10 kΩ ∥ 10 kΩ = 5 kΩ이 되고, 필기는 분배 결과를 3 V로 적었다.",
                "그래서 부하를 정상적으로 돌리지 못할 수 있다. 이 현상이 부하효과다. 사이에 전압추종기를 넣으면 앞 단은 무한대 입력저항만 본다.",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("follower", "추종기. 출력을 음단자로."),
                ("load_before", "무부하. 아래 10 kΩ."),
                ("load_after", "부하를 달면 아래 5 kΩ. 필기 3 V."),
            ]
        )
    )
    story.append(figstrip([("buffer", "분배와 부하 사이에 추종기를 넣으면, 앞 단은 RL을 보지 않는다.")], max_h_mm=42))
    story.append(P("합산기", "h2"))
    story.append(
        main_box(
            "반전 합산과 비반전 합산",
            [
                "반전 합산.  각 입력이 자기 저항을 통해 음단자로 들어온다.",
                "vout = -Rf (v1/R1 + v2/R2 + v3/R3).  저항이 모두 같으면  vout = -(v1+v2+v3).",
                "필기 예. R1=100 Ω, R2=200 Ω, R3=400 Ω, Rf=400 Ω 이면  vo = -(4v1 + 2v2 + v3).",
                "비반전 합산은 중첩으로 푼다. 한 입력만 살리고 나머지는 0으로 둔 뒤 결과를 더하면 양의 합이 된다.",
            ],
        )
    )
    story.append(
        figstrip(
            [("summer", "반전 합산. v1, v2, v3는 모두 음단자에서 만난다. 단위는 Ω.")],
            max_h_mm=52,
        )
    )
    story.append(
        figstrip(
            [
                ("nsummer", "필기 첫 그림. 세 입력은 양단자, 접지 저항은 두 개."),
                ("nsummer_va", "Va만 살린 등가. 분배 Va/4, 이득 3, 출력 3Va/4."),
            ],
            max_h_mm=52,
        )
    )
    story.append(
        example_box(
            "비반전 합산. 필기가 회로를 다시 그린 부분",
            [
                "페이지 위에는 Vo = Va + Vb + Vc 라고 적혀 있다. 바로 아래 중첩을 따라가면 그 식이 답이 아니다.",
                "Va만 켜고 Vb, Vc는 단락하면, 필기는 접지 쪽을 저항 세 개의 병렬로 다시 그렸다. R∥R∥R = R/3.",
                "그 분배 전압은  Va × (R/3) / (R + R/3) = Va/4.",
                "음단자 접지는 R, 궤환은 2R 이므로 비반전 이득은  1 + 2R/R = 3.  Va가 만드는 출력은 (3/4)Va.",
                "Vb와 Vc도 같은 모양이므로, 필기 계산을 더하면  vo = (3/4)(Va + Vb + Vc).",
            ],
        )
    )
    story.append(P("차동, 브리지, 아날로그 컴퓨터", "h2"))
    story.append(
        detail_box(
            "차이 전압증폭기 (예제 6-1)",
            [
                "두 입력의 차이를 저항비로 키우는 회로다. 양단과 음단에 각각 KCL을 세우고, 가상 단락으로 두 입력 단자 전압을 같게 둔다.",
                "필기에서 정리한 결과는  vo = 3(vb - va)  다. 교재 핵심요약의 같은 회로도 두 입력의 차를 일정 배로 만든다.",
                "출력의 50 kΩ은 접지로 가는 부하이고, 되먹임은 30 kΩ이다. 양단자의 30 kΩ도 접지로 간다.",
            ],
        )
    )
    story.append(figstrip([("diff", "차이 증폭. 50 kΩ은 출력과 접지 사이.")], max_h_mm=48))
    story.append(
        detail_box(
            "브리지 증폭 (필기 Ex 6-3)",
            [
                "브리지 출력을 테브난으로 바꾼 다음 비반전 증폭을 붙인다.",
                "Vth = Vs ( R2/(R1+R2) - R4/(R3+R4) )",
                "Rth = R1∥R2 + R3∥R4",
                "vo = (1 + R6/R5) Vth",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("bridge", "브리지. a는 R1과 R2 사이, b는 R3과 R4 사이."),
                ("bridge_div", "개방전압. 위 분배로 Va, 아래 분배로 Vb."),
            ]
        )
    )
    story.append(
        figstrip(
            [
                ("bridge_rth_net", "전원을 죽인 뒤 a-b에서 본 저항."),
                ("bridge_th", "그 테브난을 비반전 증폭에 붙인다. 이상이면 Rth 전류는 0."),
            ]
        )
    )
    story.append(
        detail_box(
            "선형대수 방정식의 해 (6.6)",
            [
                "연산증폭기 조합으로 선형대수 방정식을 하드웨어에서 푼다. 디지털 컴퓨터는 샘플된 이산값이 들어가고, 아날로그 컴퓨터는 신호 값이 그대로 들어가 해의 함수값이 나온다.",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("gain4", "이득 4. 20 kΩ과 60 kΩ. 1+60/20=4."),
                ("gain_m5", "이득 -5. 20 kΩ과 100 kΩ."),
            ]
        )
    )
    story.append(figstrip([("ex64sum", "비반전 합산. 입력 20 kΩ 세 개, 접지 20 kΩ, 궤환 60 kΩ.")], max_h_mm=48))
    story.append(
        example_box(
            "예제 6-4  z = 4x - 5y + 2",
            [
                "4x 는 비반전이다. R1 = 20 kΩ, R2 = 60 kΩ 이면  1 + 60/20 = 4.",
                "-5y 는 반전이다. R1 = 20 kΩ, R2 = 100 kΩ 이면  -100/20 = -5.",
                "4x, -5y, 상수 2 를 비반전 합산으로 더한다. 입력 저항은 20 kΩ, 양단자 접지도 20 kΩ, 궤환은 60 kΩ, 음단자 접지는 20 kΩ.",
                "그 출력이 z 다.",
            ],
        )
    )
    story.append(
        confuse_box(
            [
                "가상 단락은 전압만 같다는 뜻이다. 입력 단자를 도선으로 묶은 것이 아니므로 그 단자로 전류가 흐르지 않는다.",
                "개방루프 이득 A가 무한이라는 말과, 회로 이득 -R2/R1 또는 1+R2/R1 은 다른 양이다. 회로 이득은 바깥 저항이 정한다.",
                "반전 쪽 결과는 음수, 비반전 쪽 결과는 양수다. 합산기도 같다.",
                "전압추종기의 이득 1은 키우지 않는다는 뜻이 아니다. 부하효과를 막으려고 사이에 넣는다.",
            ]
        )
    )

    story.append(P("3.  에너지 저장소자", "h1"))
    story.append(P("교재 7장. 커패시터와 인덕터.", "small"))
    story.append(
        P(
            "둘 다 선형 수동소자다. 저항처럼 전력을 다루지만, 저항과 달리 에너지를 저장했다가 내놓는다. "
            "커패시터는 전압이라는 위치에너지를, 인덕터는 전류라는 운동에너지를 저장한다. "
            "전원이 있으면 충전하고, 전원이 빠지면 방전한다. 참조방향은 전력소모 소자이므로 전류가 전압 강하 방향으로 들어온다."
        )
    )
    story.append(
        comparison_table(
            ["", "커패시터", "인덕터"],
            [
                ["소자 법칙", "i = C dv/dt", "v = L di/dt"],
                ["적분형", "v(t) = v(t0) + (1/C) ∫ i dt", "i(t) = i(t0) + (1/L) ∫ v dt"],
                ["에너지", "½ C v²", "½ L i²"],
                ["초기값", "커패시터 전압", "인덕터 전류"],
                ["DC", "개방", "단락"],
                ["직렬", "1/C 를 더한다", "L 을 더한다"],
                ["병렬", "C 를 더한다", "1/L 을 더한다"],
                ["연속인 양", "전압", "전류"],
                ["뛸 수 있는 양", "전류", "전압"],
            ],
        )
    )
    story.append(
        main_box(
            "식을 쓸 때 고정할 것",
            [
                "커패시터 전류·전압은 미분 관계다. q = C v 의 양변을 미분하면 i = C dv/dt 가 된다.",
                "적분형에는 초기값이 반드시 들어간다. 커패시터는 초기 전압, 인덕터는 초기 전류다. 완전한 해석을 위해 그 값을 알아야 한다.",
                "단위는 커패시턴스 F, 인덕턴스 H 다.",
            ],
        )
    )
    story.append(
        detail_box(
            "교재가 예시로 강조한 연속성",
            [
                "커패시터 전압은 시각을 어떻게 잡아도 그 시각에서 연속이다. v(0-) = v(0+), v(1-) = v(1+).",
                "같은 시각에 전류는 불연속일 수 있다. i(0-)와 i(0+)가 다를 수 있다.",
                "DC 전압이 걸리면 dv/dt = 0 이라 커패시터 전류는 0이고, 개방으로 동작한다.",
                "DC 전류가 흐르면 di/dt = 0 이라 인덕터 전압은 0이고, 단락으로 동작한다.",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("dc_copen", "DC 정상상태. 커패시터 자리는 개방."),
                ("dc_lshort", "DC 정상상태. 인덕터 자리는 단락, 전압 0."),
            ]
        )
    )
    story.append(figstrip([("ex71", "예제 7-1. 전류원과 커패시터 병렬. 0에서 1까지는 I=A.")], max_h_mm=36))
    story.append(
        example_box(
            "예제 7-1  커패시터 전압",
            [
                "전류원 I(t)는 0 &lt; t ≤ 1 에서 A, 그 뒤는 0이다. 커패시터와 병렬이고 vc(0) = 0.",
                "0 &lt; t ≤ 1 에서는  vc(t) = (A/C) t.",
                "t &gt; 1 에서는 전류가 0이라 적분이 더 늘지 않는다.  vc(t) = A/C.",
                "전압은 t=1에서 연속이다. 전류는 그 시각에 0으로 뛸 수 있다.",
            ],
        )
    )
    story.append(figstrip([("ex72", "예제 7-2. vL(t)와 0.5 H의 직렬.")], max_h_mm=36))
    story.append(
        example_box(
            "예제 7-2  인덕터 전류",
            [
                "vL(t)는 t &lt; 0 에서 e^{t}, t ≥ 0 에서 e^{-t} 다. L = 0.5 H.",
                "t = 0 이전의 적분으로 초기 전류를 구하면  iL(0+) = 2 A.  인덕터 전류는 연속이라 iL(0-)와 같다.",
                "t ≥ 0 에서는  iL(t) = 2 + 2(1 - e^{-t}) A.",
            ],
        )
    )
    story.append(
        detail_box(
            "직병렬",
            [
                "인덕터 직렬은 저항 직렬과 같다.  Ltotal = L1 + L2 + L3.",
                "인덕터 병렬은 저항 병렬과 같다.  1/Ltotal = 1/L1 + 1/L2 + 1/L3.  각 인덕터 전압은 같고, 전류는 KCL로 더해진다.",
                "커패시터 직렬은 저항 병렬과 같다.  1/Ctotal = 1/C1 + 1/C2 + 1/C3.",
                "커패시터 병렬은 저항 직렬처럼 더한다.  Ctotal = C1 + C2 + C3.",
            ],
        )
    )
    story.append(figstrip([("ex73", "예제 7-3. 6 H와, 1.5 H 뒤의 병렬.")], max_h_mm=40))
    story.append(
        example_box(
            "예제 7-3  인덕터를 하나로",
            [
                "1.5 H 오른쪽은  1 H ∥ 4 H ∥ (5/6 H + 0.5 H)  다.",
                "그 병렬은 1/2 H.  1.5 H와 직렬이면 2 H.",
                "맨 왼쪽 6 H와 다시 병렬이면  Ltotal = 6 ∥ 2 = 1.5 H.",
            ],
        )
    )
    story.append(
        figstrip(
            [("ex74", "예제 7-4를 정리한 그림. 0.3, 0.25, 0.45는 병렬이고 0.9 mF는 그 아래 직렬.")],
            max_h_mm=48,
        )
    )
    story.append(
        example_box(
            "예제 7-4  커패시터를 하나로",
            [
                "교재는 복잡한 연결을 먼저 묶은 뒤, 그림처럼 다시 그린다.",
                "나란히 있는 0.3 mF, 0.25 mF, 0.45 mF 는 더하면 1 mF.",
                "그다음 1.125 mF, 1 mF, 0.9 mF 가 직렬이다.",
                "Ctotal = 1 / (1/1.125 + 1/1 + 1/0.9) = 1/3 mF.",
            ],
        )
    )
    story.append(
        confuse_box(
            [
                "직렬·병렬 공식이 서로 반대다. L의 직렬은 합, C의 직렬은 역수합이다.",
                "DC에서 개방과 단락을 바꾸면 초기값과 최종값이 같이 틀린다. 커패시터는 개방, 인덕터는 단락이다.",
                "초기값으로 쓰는 양은 상태변수뿐이다. 커패시터 전류나 인덕터 전압을 초기 조건으로 넘기지 않는다.",
                "저장에너지는 ½Cv², ½Li² 이다. 저항에 소모된 에너지를 이 식에 넣지 않는다.",
            ]
        )
    )

    story.append(P("4.  RL/RC 회로의 완전응답", "h1"))
    story.append(P("교재 8장. 필기 9/23, 9/29, 10/6. 이상화 교수 자료의 해당 문제도 여기로 모았다.", "small"))
    story.append(
        main_box(
            "1차 미분방정식",
            [
                "저항과 인덕터만, 또는 저항과 커패시터만 있는 회로는 1차 미분방정식이다.",
                "표준형   dx/dt + (1/τ) x = K.",
                "RL의 시정수  τ = L/R.    RC의 시정수  τ = RC.",
                "응답 변수 x(t)는 인덕터 전류 iL 또는 커패시터 전압 vC 로 잡는다. 필기와 교재가 모두 그렇게 둔다.",
                "인덕터는 i(0-) = i(0+) 라서, 구하려는 양이 전압이어도 전류로 식을 세운 뒤 옴의 법칙으로 돌리는 편이 낫다.",
            ],
        )
    )
    story.append(figstrip([("ex81", "예제 8-1. is(t), R, L. 숫자 답은 없고 미분방정식만 세운다.")], max_h_mm=40))
    story.append(
        example_box(
            "예제 8-1  RL 회로의 식",
            [
                "위 노드에서  is = vR/R + iL.  저항 전압과 인덕터 전압이 같으므로 vR = L diL/dt.",
                "정리하면  diL/dt + (R/L) iL = (R/L) is(t).",
                "입력이 함수로만 주어져 있어, 닫힌 꼴의 숫자 해는 없다.",
            ],
        )
    )
    story.append(P("해의 이름", "h2"))
    story.append(
        P(
            "초깃값 x(t0)가 주어지면, 일반해는 등차해와 특수해의 합이다. "
            "등차해는 우변을 0으로 둔 해, 즉 입력이 없을 때의 해다. 특수해는 우변 함수의 모양을 따라가는 해다. "
            "회로에서는 일반해를 완전응답, 등차해를 과도응답, 특수해를 정상상태응답이라 부른다."
        )
    )
    story.append(
        formula(
            [
                "dx/dt + a x = f(t)",
                "일반해 = 등차해 + 특수해",
                "완전응답 = 과도응답 + 정상상태응답",
            ]
        )
    )
    story.append(
        detail_box(
            "등차해를 구하는 방법",
            [
                "계수분리, 또는 지수함수 가상해  x = Ae^{st}.  대입하면  s = -1/τ,  따라서  x = A e^{-t/τ}.",
                "라플라스 변환도 가능하다고 교재가 이름만 적는다. 계산은 13장에서 다룬다.",
                "저장소자가 둘 이상이면 2차 이상이 된다. 교재는 그때 지수 가상해가 가장 흔히 쓰인다고 한다.",
            ],
        )
    )
    story.append(
        comparison_table(
            ["입력 f(t)", "특수해의 꼴"],
            [
                ["상수 A", "상수 B"],
                ["At", "Bt + C"],
                ["A e^{st}", "C e^{st}"],
                ["정현파", "같은 주파수의 정현파"],
            ],
        )
    )
    story.append(P("무전원응답과 시정수", "h2"))
    story.append(
        main_box(
            "전원이 없는 RL, RC",
            [
                "우변이 0이므로 정상상태응답은 0이고, 완전응답은 과도응답만 남는다.",
                "x(t) = x(t0) e^{-(t-t0)/τ}",
                "RL은  iL(t) = iL(t0) e^{-(t-t0)R/L}",
                "RC는  vC(t) = vC(t0) e^{-(t-t0)/(RC)}",
            ],
        )
    )
    story.append(
        P(
            "시정수는 과도응답이 정상상태로 가는 빠르기다. τ가 작으면 더 가파르게 붙는다. "
            "필기 그래프는 최종값으로 가는 곡선에서 1τ 위치를 약 63%로 표시했다. "
            "무전원 곡선에서는 τ가, 접선이 바닥과 만나는 시간 눈금이 된다. R과 L, 또는 R과 C를 조절하면 그 기울기가 바뀐다."
        )
    )
    story.append(P("DC 전원이 있을 때", "h2"))
    story.append(
        P(
            "입력이 상수면 정상상태도 0이 아닌 상수가 된다. 출력을 상수로 가정해 미분방정식에 넣거나, "
            "회로 그림에서 바로 구한다. 미분은 0이므로 인덕터는 단락, 커패시터는 개방이다."
        )
    )
    story.append(
        formula(
            [
                "x(t) = x(∞) + ( x(t0) - x(∞) ) e^{-(t-t0)/τ}",
                "RL :  iL(t) = Vs/R + ( iL(t0) - Vs/R ) e^{-(t-t0)/(L/R)}",
                "RC :  vC(t) = Vs + ( vC(t0) - Vs ) e^{-(t-t0)/(RC)}",
                "t0 = 0 이면 지수만 e^{-t/τ} 로 둔다.",
            ]
        )
    )
    story.append(
        formula(
            [
                "같은 식을 다시 묶으면",
                "x(t) = x(∞) ( 1 - e^{-(t-t0)/τ} )  +  x(t0) e^{-(t-t0)/τ}",
                "첫째 항 = 무상태응답 (초기값 0, 입력만)",
                "둘째 항 = 무전원응답 (입력 0, 초기 에너지만)",
            ]
        )
    )
    story.append(P("구간마다 푸는 순서", "h2"))
    story.append(
        bullet_list(
            [
                "전환 시각 이전의 DC 정상상태 그림을 그린다. 인덕터는 단락, 커패시터는 개방. 여기서 초기 iL 또는 vC를 구한다.",
                "전환 이후 회로에서, 독립전원은 죽이고 상태소자 양단에서 본 등가저항으로 τ를 구한다. 전압원은 단락, 전류원은 개방이다.",
                "전환 이후 회로의 DC 정상상태에서 최종값을 구한다. 이때 전원은 살려 둔다.",
                "x(t) = 최종값 + (초기값 - 최종값) e^{-(t-t0)/τ}. 무전원이면 최종값은 0이다.",
                "스위치가 한 번 더 움직이면, 직전 구간 식에 그 시각을 넣은 값이 다음 구간의 초기값이다.",
            ]
        )
    )
    story.append(
        figstrip(
            [
                ("tau_v", "τ와 무전원응답. 전압원은 단락하고, C 쪽에서 Req를 본다. 최종값을 구하는 그림과 다르다."),
            ],
            max_h_mm=40,
        )
    )
    story.append(
        detail_box(
            "연속 스위칭에서 넘어가는 양",
            [
                "다음 구간의 초기값은 직전 구간이 끝나는 순간의 상태변수다.",
                "인덕터는 전류를 넘긴다. 인덕터 전압은 전환 직전과 직후가 다를 수 있다. 필기 예는 t = 0.4 s에서 vL(0.4-)와 vL(0.4+)가 다르다.",
                "커패시터는 전압을 넘긴다.",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("rl82", "원래. 0.4 s에 5 Ω 스위치가 닫힌다."),
                ("rl82_early", "0.4 s 전. 5 Ω은 열려 20 Ω과 8 H만."),
                ("rl82_late", "0.4 s 이후. 5∥20 = 4 Ω."),
            ]
        )
    )
    story.append(
        example_box(
            "칠판의 연속 스위칭 RL (교재 예제 8-2 흐름)",
            [
                "iL(0-) = 10 A, L = 8 H.",
                "0 ≤ t &lt; 0.4 s.  닫힌 경로의 저항은 20 Ω.  τ = 8/20 = 0.4 s.  방전만 있으므로  iL = 10 e^{-2.5 t} A.",
                "t = 0.4 s에 5 Ω이 병렬로 더해진다.  Rp = 5 ∥ 20 = 4 Ω.  τ = 8/4 = 2 s.",
                "iL(0.4) = 10 e^{-1} = 3.679 A.",
                "t ≥ 0.4 s 에서  iL(t) = 3.679 e^{-0.5(t-0.4)} A.",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("ex83", "예제 8-3. t=0에 열리고, t=1 ms에 오른쪽 2 Ω이 닫힌다."),
                ("ex83_t0", "t&lt;0. L은 단락. i(0)=10 A."),
            ]
        )
    )
    story.append(
        figstrip(
            [
                ("ex83_early", "0≤t&lt;1 ms. 2 mH와 2 Ω. τ=1 ms."),
                ("ex83_late", "t&gt;1 ms. 2∥2=1 Ω. τ=2 ms."),
            ]
        )
    )
    story.append(
        example_box(
            "예제 8-3  스위치가 두 번",
            [
                "t &lt; 0 의 DC에서 인덕터는 단락이다. 전류원 10 A가 그대로 인덕터로 가므로 i(0) = 10 A.",
                "0 ≤ t &lt; 1 ms. 전원은 열려 있고 오른쪽 스위치도 열려 있다. 2 mH와 2 Ω만 남는다. τ = 1 ms.",
                "i(t) = 10 e^{-1000 t} A.  t = 1 ms 에서 i = 10 e^{-1} ≈ 3.68 A.",
                "t &gt; 1 ms. 2 Ω이 하나 더 병렬이 되어 2∥2 = 1 Ω. τ = 2 ms.",
                "i(t) = 3.68 e^{-500(t - 10^{-3})} A.",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("y2022", "원래. t=0에 스위치가 열려 10 A가 떨어진다."),
                ("y2022_ic", "t&lt;0. L 단락. 3∥6=2 Ω, 직렬 3 Ω, iL=4 A."),
                ("y2022_t", "t&gt;0. 전원 없음. 4.5 Ω과 2 H."),
            ]
        )
    )
    story.append(
        example_box(
            "2022년 칠판의 인덕터 전류",
            [
                "t &lt; 0 에서는 인덕터를 단락으로 바꾼다. 3 Ω ∥ 6 Ω = 2 Ω 이고, 인덕터 가지의 3 Ω과 나누면 iL(0) = 10 × 2/(2+3) = 4 A. 9 Ω은 단락에 가려 빠진다.",
                "t &gt; 0 에서는 스위치가 열려 전류원이 없다. 칠판은 남은 저항을 9 Ω ∥ 9 Ω = 4.5 Ω 으로 묶어 τ = 2/4.5 = 4/9 s 로 적었다.",
                "iL(t) = 4 e^{-(9/4) t} A.",
            ],
        )
    )
    story.append(
        detail_box(
            "무전원 RC에서 저항이 소모하는 에너지 (필기)",
            [
                "vC = Vo e^{-t/(RC)}  이면 저항 전류는  iR = (Vo/R) e^{-t/(RC)}.",
                "전력  p = (Vo²/R) e^{-2t/(RC)}.",
                "0부터 t까지 소모 에너지는  ∫ p dt = (1/2) C Vo² ( 1 - e^{-2t/(RC)} ).",
                "t → ∞ 이면 커패시터에 있던 ½CVo² 가 저항에 모두 소모된다.",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("rc_charge", "충전. 스위치가 전원 쪽이면 Vo가 C를 채운다."),
                ("rc_free", "방전. 전원은 빠지고 C와 R만 남는다."),
            ]
        )
    )
    story.append(P("수업에서 푼 RC 방전", "h2"))
    story.append(
        P(
            "이상화 교수 자료의 문제는 필기에 LSH와 쪽수가 적혀 있다. 쪽수는 교수 자료 기준이다. "
            "소자 종류와 단위는 확인된 것만 반영했다."
        )
    )
    story.append(
        figstrip(
            [
                ("ex62", "원래. 20 V, 6 kΩ, 4 kΩ, 1 kΩ, C."),
                ("ex62_open", "C를 개방. 1 kΩ 가지는 빠지고 Vc = 8 V."),
                ("ex62_rth", "전압원을 단락. C 쪽에서 본 Rth = 3.4 kΩ."),
            ]
        )
    )
    story.append(
        example_box(
            "LSH p.219, 회로를 두 번 다시 그리기 (Ex 6-2)",
            [
                "원래 회로는 20 V, 직렬 6 kΩ, 병렬 4 kΩ, 그리고 1 kΩ과 커패시터의 직렬이다.",
                "(a) 커패시터가 충분히 충전된 DC. 커패시터를 개방으로 보면 1 kΩ 가지에 전류가 없고, Vc = 20 × 4/(6+4) = 8 V.",
                "(b) 커패시터 양단에서 본 등가저항. 전압원을 단락하면 Rth = 1 kΩ + (4 kΩ ∥ 6 kΩ) = 3.4 kΩ.",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("ex69", "5 mF ∥ 5 kΩ, 그리고 8 kΩ과 12 kΩ의 직렬."),
                ("ex69_eq", "τ를 위해 다시 그림. 5 kΩ ∥ 20 kΩ = 4 kΩ."),
            ]
        )
    )
    story.append(
        example_box(
            "LSH, 초기 전압이 있는 방전. C = 5 mF",
            [
                "Vc(0) = 12 V. 커패시터에서 본 등가저항은 5 kΩ ∥ (8 kΩ+12 kΩ) = 5 kΩ ∥ 20 kΩ = 4 kΩ.",
                "C = 5 mF = 5×10⁻³ F 이므로  τ = RC = 4×10³ × 5×10⁻³ = 20 s.",
                "Vc(t) = 12 e^{-t/20} V.",
                "8 kΩ과 12 kΩ이 직렬인 가지의 전류는  i(t) = Vc/20 kΩ = 0.6 e^{-t/20} mA.",
                "12 kΩ에 걸리는 전압은  v1(t) = 7.2 e^{-t/20} V.",
                "필기에는 같은 회로를 10^-6으로 넣어 τ = 20 ms, 지수 -50t 로 적혀 있다. 확인한 단위는 밀리패럿이므로 위 식을 쓴다.",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("ex610", "원래. t=0에 스위치가 열린다. 소자는 커패시터."),
                ("ex610_t0", "t&lt;0, C 개방. 3 kΩ과 6 kΩ만 남아 Vc = 6 V."),
                ("ex610_t", "t&gt;0. 4 kΩ과 6 kΩ만 직렬."),
            ]
        )
    )
    story.append(
        example_box(
            "LSH, 커패시터 방전. 필기에 적힌 τ = 0.2 s",
            [
                "소자는 커패시터로 확인했다. 필기 풀이의 시정수는 0.2 s, 초기 전압은 6 V다.",
                "Vc(t) = 6 e^{-5t} V.",
                "등가 10 kΩ 가지의 전류  i(t) = 0.6 e^{-5t} mA.",
                "그 저항의 전력  p(t) = 2.16 e^{-10t} mW.",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("ex64", "원래. 12 V, 8 kΩ, t=0 스위치, 6 kΩ, 1 kΩ과 20 mF, 12 kΩ."),
                ("ex64_t0", "t&lt;0에 C를 개방. 1 kΩ 가지는 빠지고 6 kΩ ∥ 12 kΩ."),
                ("ex64_t", "t&gt;0에 필기가 다시 그린 방전. 전원과 8 kΩ은 없다."),
            ]
        )
    )
    story.append(
        example_box(
            "LSH 연습, C = 20 mF",
            [
                "소자는 커패시터 20 mF로 확인했다. 필기 첫 그림의 20 mH, 다음 장의 20 μF는 그 확인으로 대체한다.",
                "t &gt; 0 에서 커패시터 쪽 등가저항은  1 kΩ + (6 kΩ ∥ 12 kΩ) = 5 kΩ.",
                "20 mF를 그대로 쓰면  τ = 5×10³ × 20×10⁻³ = 100 s.  방전 꼴은  Vc(t) = Vc(0) e^{-t/100}.",
                "필기 지수식은 4 e^{-10t},  12 kΩ 전류는 0.267 e^{-10t} mA 로 적혀 있다. 그 지수는 τ = 0.1 s에 해당한다.",
                "초기 전압 칸에는 6 V가 적혀 있고, 지수 앞 숫자는 4다. 필기 안에서 초기값이 한 수로 고정되어 있지 않다.",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("ex611", "계산에 쓴 회로. 4 kΩ 두 개와 100 μF, t=0 스위치."),
                ("ex611_t0", "t&lt;0, C 개방. 4 kΩ 분배로 6 V."),
                ("ex611_t", "t&gt;0 방전. 커패시터와 4 kΩ만."),
            ]
        )
    )
    story.append(
        example_box(
            "칠판 Ex, 100 μF",
            [
                "칠판 왼쪽 스케치에는 1 kΩ과 3 kΩ도 보인다. 6 V와 τ = 0.4 s를 구한 그림은 4 kΩ 두 개다.",
                "t &lt; 0 분배로  Vc(0) = 6 V.  t &gt; 0 에서 커패시터와 연결된 저항은 4 kΩ, C = 100 μF.",
                "τ = 4×10³ × 100×10^-6 = 0.4 s.",
                "Vc(t) = 6 e^{-2.5 t} V.  최종값은 0인 방전이다.",
            ],
        )
    )
    story.append(
        confuse_box(
            [
                "과도응답과 무전원응답을 같은 말로 쓰지 않는다. 완전응답은 과도+정상상태이기도 하고, 무상태+무전원이기도 하다.",
                "최종값을 구할 때 전원을 단락하지 않는다. 단락·개방하는 것은 저장소자다. 전원을 죽이는 것은 τ와 무전원응답이다.",
                "τ의 R은 회로에 그려진 저항 하나가 아니다. 상태소자 양단에서 본 등가저항이다.",
                "mF는 밀리패럿, 10⁻³ F 다. 10^-6으로 넣으면 시정수가 1000배 달라진다.",
                "인덕터 문제에서 전압의 좌극한·우극한을 전류 대신 초기값으로 쓰지 않는다.",
            ]
        )
    )

    story.append(P("5.  정현파의 정상상태", "h1"))
    story.append(P("교재 10장. 필기 9/15, Floyd 10.4.3 임피던스와 어드미턴스.", "small"))
    story.append(
        main_box(
            "이 장에서 새로 계산하는 것",
            [
                "교류 입력의 완전응답도 과도응답과 정상상태응답의 합이다.",
                "과도응답은 우변을 0으로 둔 등차해이므로, 입력이 직류인지 교류인지와 상관이 없다.",
                "입력이 바뀔 때 달라지는 것은 정상상태뿐이다. 이 장은 그 정상상태가 정현파일 때만 다룬다.",
                "9장까지의 DC 정상상태는 상수였다. 정현파 입력의 정상상태는 입력과 같은 주파수의 정현파다.",
            ],
        )
    )
    story.append(P("정현파", "h2"))
    story.append(
        formula(
            [
                "v(t) = Vm sin(ωt + θ)",
                "Vm 크기,   ω = 2πf 각주파수,   θ 위상각,   T = 1/f 주기",
            ]
        )
    )
    story.append(
        detail_box(
            "교재에 적힌 주파수 예",
            [
                "220 V 교류전원의 주파수는 60 Hz다. 한 주기는 1/60 s 이고, 1초에 같은 파형이 60번 반복된다.",
                "가청주파수는 16 Hz에서 20,000 Hz다. 높은 소리 신호가 더 높은 주파수다.",
                "원거리로 보내려고 신호의 주파수를 높여 고주파 정현파로 바꾸는 것을 변조라고 한다. 교재 참고 10-1의 설명이다.",
            ],
        )
    )
    story.append(
        formula(
            [
                "입력이  A cos(ωt+θ)  이면 정상상태도  위상만 다른 cos",
                "입력이  A sin(ωt+θ)  이면 정상상태도  위상만 다른 sin",
            ]
        )
    )
    story.append(P("페이저", "h2"))
    story.append(
        main_box(
            "시간함수를 복소수 하나의 크기와 각으로",
            [
                "v(t) = Vm sin(ωt+θ) 의 페이저는  V = Vm∠θ.",
                "대문자가 페이저다.  같은 양은  Vm e^{jθ} = Vm (cosθ + j sinθ)  로도 쓴다.",
                "시간 영역으로 되돌릴 때는 원래 쓰던 sin 또는 cos와, 원래의 ω를 다시 붙인다.",
            ],
        )
    )
    story.append(
        example_box(
            "예제 10-3, 10-4  같은 주파수의 합",
            [
                "v1 = 5 sin 5t,   v2 = 5√2 sin(5t+45°).  둘 다 ω = 5 다.",
                "시간 영역으로 전개하면  v3 = 10 sin 5t + 5 cos 5t = 11.18 sin(5t+26.6°).",
                "예제 10-4는 같은 합을 페이저로 한다.  5∠0° + 5√2∠45° = 10 + j5 = 11.18∠26.6°.",
                "sin으로 되돌리면  11.18 sin(5t + 26.6°).  예제 10-3과 같다.",
            ],
        )
    )
    story.append(P("페이저 회로와 임피던스", "h2"))
    story.append(
        P(
            "시간 영역의 RLC를 페이저로 바꾸면, 커패시터·인덕터 때문에 생기던 미분방정식을 저항회로와 같은 대수방정식으로 푼다. "
            "KVL과 KCL의 말은 같다. 대상만 페이저 전압과 페이저 전류다. "
            "한 폐루프의 페이저 전압의 대수합은 0이고, 한 노드의 페이저 전류의 대수합은 0이다."
        )
    )
    story.append(
        formula(
            [
                "확장된 옴의 법칙    V = Z I",
                "저항        ZR = R,            YR = 1/R = G",
                "인덕터      ZL = jωL,          YL = 1/(jωL)",
                "커패시터    ZC = 1/(jωC) = -j/(ωC),    YC = jωC",
            ]
        )
    )
    story.append(
        P(
            "V/I 를 임피던스 Z라 하고, 단위는 Ω인 복소수다. 임피던스의 역수를 어드미턴스 Y라 하고, 단위는 S 다. "
            "직렬은 저항 직렬처럼 Z를 더한다. 병렬은 어드미턴스를 더한다. 직병렬이 섞이면 저항회로와 같은 순서로 묶는다."
        )
    )
    story.append(
        formula(
            [
                "직렬    ZT = Z1 + Z2 + Z3",
                "병렬    YT = Y1 + Y2 + Y3",
                "극형식  Z = |Z| ∠θ,    θ = tan⁻¹(허수부 / 실수부)",
            ]
        )
    )
    story.append(figstrip([("ex101", "예제 10-1. Is cos ωt, R과 L의 병렬.")], max_h_mm=40))
    story.append(
        example_box(
            "예제 10-1  정상상태도 같은 주파수",
            [
                "전류원 is = Is cos ωt 가 R, L 과 병렬이다. 인덕터 전류의 정상상태도 같은 ω의 코사인으로 둔다.",
                "교재 식 (10.7).  iL(t) = [R Is / sqrt(R^2 + (ωL)^2)] cos(ωt + tan^{-1}(ωL/R)).",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("ex105l", "예제 10-5. L1, L2, L3 병렬."),
                ("ex105c", "C1, C2, C3 병렬."),
            ]
        )
    )
    story.append(
        example_box(
            "예제 10-5  병렬 L, 병렬 C의 임피던스",
            [
                "1/Lp = 1/L1 + 1/L2 + 1/L3.  페이저에서  ZL = jω Lp.",
                "Cp = C1 + C2 + C3.  ZC = 1/(jω Cp).",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("ex102", "예제 10-2. 10 sin 3t, 3 Ω, 2 H."),
                ("ex102z", "페이저. 3 Ω과 j6 Ω."),
            ]
        )
    )
    story.append(
        example_box(
            "예제 10-2  직렬 RL의 정상상태",
            [
                "ω = 3 이므로  ZL = jωL = j6 Ω.  Z = 3 + j6 Ω.",
                "크기 sqrt(3²+6²) = 6.708 Ω, 각 tan⁻¹(6/3) = 63.43°.",
                "전류는 전압보다 이 각만큼 뒤진다.  i(t) = 1.49 sin(3t - 63.43°) A.",
            ],
        )
    )
    story.append(
        main_box(
            "전압과 전류 중 무엇이 90° 앞서는가",
            [
                "인덕터는  V = jωL I  이므로 전압이 전류보다 90° 앞선다.",
                "커패시터는  I = jωC V  이므로 전류가 전압보다 90° 앞선다.",
                "교재 암기.  ELI the ICE man.  L에서는 전압이 전류보다 앞이고, C에서는 전류가 전압보다 앞이다.",
            ],
        )
    )
    story.append(
        detail_box(
            "Floyd 수업에서 쓴 리액턴스",
            [
                "임피던스  Z = V/I = R + jX.  X는 용량성 리액턴스 Xc 또는 유도성 리액턴스 XL 이다.",
                "어드미턴스  Y = 1/Z = G + jB.  G는 컨덕턴스, B는 서셉턴스다.",
                "XL = 2πf L,    Xc = 1/(2πf C).",
                "Z를 실수부와 허수부로 쓴 뒤 크기와 각으로 바꾼다. ω = 0 인 DC에서는 ZL = 0 이라 인덕터는 단락, ZC는 무한대라 커패시터는 개방이다. 8장의 DC 정상상태와 같은 사실이다.",
            ],
        )
    )
    story.append(
        detail_box(
            "교재가 페이저로 되돌린 적분기 (예제 10-6)",
            [
                "시간영역 반전 적분기.  vout(t) = -1/(R1 C2) ∫ vin dt.",
                "vin = Vm cos ωt 이면, 페이저로  Vout/Vin = -1/(jω R1 C2).",
                "-1/j 가 +90° 이므로 크기는 1/(ω R1 C2), 위상은 +90°.",
                "시간함수로 되돌리면  vout(t) = -(Vm /(R1 C2 ω)) sin(ωt).",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("integ", "시간 영역. R1과 궤환 C2."),
                ("integz", "페이저. 궤환은 1/(jω C2)."),
            ]
        )
    )
    story.append(
        P(
            "페이저로 바꾼 뒤에는 저항회로에서 쓰던 노드해석, 중첩, 테브난, 전압분배를 그대로 쓴다. "
            "부유 전압원이 있으면 슈퍼노드도 같다. 구한 페이저를 원래의 sin 또는 cos로 되돌리면 시간함수다."
        )
    )
    story.append(
        figstrip(
            [
                ("ex107", "예제 10-7. cos 4t, 0.25 H, 0.25 ic, 0.5 F, 1.2 Ω."),
                ("ex107z", "페이저. 부하는 떼고 Voc. ZL=j1, ZC=-j0.5."),
            ]
        )
    )
    story.append(
        figstrip(
            [
                ("ex107_sc", "출력 단락. Ic=0이라 종속전원은 0. Isc=1∠0."),
                ("ex107_th", "테브난에 1.2 Ω을 다시 단 회로."),
            ]
        )
    )
    story.append(
        example_box(
            "예제 10-7  페이저에서 테브난",
            [
                "i = cos 4t 이므로 ω = 4, 전원 페이저는 1∠0.  ZL = jωL = j1 Ω,  ZC = -j0.5 Ω.",
                "부하를 떼고 슈퍼노드로 개방전압을 구하면  Voc = 0.894 ∠ -63.43°.",
                "출력을 단락하면 커패시터 전압이 0이라 Ic = 0. 종속전원 0.25 Ic 도 0이 되고, 단락 전류 Isc = 1∠0.",
                "Zth = Voc/Isc = 0.894 ∠ -63.43° = 0.4 - j0.8 Ω.  실수부는 Rth = 0.4 Ω, 허수부에서 C = 0.3125 F.",
                "RL = 1.2 Ω 을 붙이면  VRL = 0.6 ∠ -36.87°.  vRL(t) = 0.6 cos(4t - 36.87°) V.",
            ],
        )
    )
    story.append(P("수업에서 계산이 끝난 임피던스", "h2"))
    story.append(
        P(
            "시간 영역의 R, L, C를 페이저로 바꾸면 저항 상자 R, jXL, -jXc가 된다. "
            "그 상자를 더해 임피던스 하나처럼 보면 저항 회로와 같은 나눗셈이 된다."
        )
    )
    story.append(
        figstrip(
            [
                ("ex123", "시간 영역. 10 Vrms, 2.5 kHz, R과 C."),
                ("ex123z", "페이저. R과 -jXc의 직렬."),
                ("ex123eq", "하나로 묶은 Z. 7.91 kΩ, 각 -53.6°."),
            ]
        )
    )
    story.append(
        example_box(
            "Ex 12-3",
            [
                "확인한 답은  Z = 7.91 kΩ, 각 53.6°  다.",
                "회로는 저항과 커패시터의 연결이고, 필기의 각에는 음부호가 붙어 있다. 용량성 임피던스로 읽으면  Z = 7.91 kΩ ∠ -53.6°.",
                "필기에 적힌 직사각형 꼴의 저항 숫자는 이 극형식과 맞지 않아, 그림에는 확인된 극형식만 적었다.",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("ex124", "시간 영역. 10 kHz, 1 kΩ, 15 mH."),
                ("ex124z", "페이저. 1 kΩ과 j942.5 Ω."),
                ("ex124eq", "Z = 1374 Ω ∠ 43.3°."),
            ]
        )
    )
    story.append(
        example_box(
            "Ex 12-4  직렬 RL",
            [
                "10 kHz, R = 1 kΩ, L = 15 mH.",
                "XL = 2πfL = 942.5 Ω.",
                "Z = 1000 + j942.5 = 1374.2 Ω ∠ 43.3°.",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("ex125", "시간 영역. 10 Vrms, 2 kHz, 2.7 kΩ과 C."),
                ("ex125z", "페이저. 2.7 kΩ과 -j1.693 kΩ. 전류는 하나."),
            ]
        )
    )
    story.append(
        example_box(
            "Ex 12-5  직렬 RC",
            [
                "Vs = 10 Vrms, f = 2 kHz. 필기에 적힌 값은 R = 2.7 kΩ, Xc = 1.693 kΩ.",
                "Z = 2.7 - j1.693 kΩ = 3.18 kΩ ∠ -32.1°.",
                "직렬이므로 저항 전류, 커패시터 전류, 전체 전류가 같다.",
                "I = 10 V / 3.18 kΩ = 3.14 mA ∠ 32.1°.",
                "VR = I R = 8.49 V ∠ 32.1°.",
                "VC = I Xc = 5.32 V ∠ -57.9°.",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("ex127", "시간 영역. 5 Vrms, 100 kHz, 470 Ω, 1 mH."),
                ("ex127z", "페이저. 470 Ω과 j628 Ω."),
                ("ex127eq", "Z = 785 Ω ∠ 53.2°. 필기 크기는 784.6 Ω."),
            ]
        )
    )
    story.append(
        example_box(
            "Ex 12-7  직렬 RL",
            [
                "5 Vrms, 100 kHz, R = 470 Ω, L = 1 mH.",
                "XL = 2πfL = 628 Ω.",
                "Z = 470 + j628 = 784.6 Ω ∠ 53.2°.",
            ],
        )
    )
    story.append(
        figstrip(
            [
                ("ex129", "시간 영역. 5 Vrms, 820 Ω, 2 mH, C."),
                ("ex129z", "페이저. 820, j628, -j318."),
                ("ex129eq", "하나로 묶으면 877 Ω ∠ 20.7°."),
            ]
        )
    )
    story.append(
        example_box(
            "Ex 12-9  직렬 RLC",
            [
                "5 Vrms, 50 kHz, R = 820 Ω, L = 2 mH. 필기에 적힌 답을 그대로 둔다.",
                "XL = 628 Ω,  Xc = 318 Ω.",
                "Z = 820 + j(628 - 318) = 877.2 Ω ∠ 20.7°.",
                "I = 5.704 mA.  각은 임피던스 각의 반대다.",
            ],
        )
    )
    story.append(
        confuse_box(
            [
                "페이저의 각은 그 주파수에서의 위상이다. ω는 페이저 안에 들어 있지 않고, 시간함수로 돌아갈 때 다시 붙인다.",
                "sin으로 준 문제를 cos로, cos로 준 문제를 sin으로 되돌리지 않는다.",
                "인덕터 임피던스의 허수부는 양, 커패시터 임피던스의 허수부는 음이다. 각의 부호가 여기서 갈린다.",
                "직렬은 Z를 더하고 병렬은 Y를 더한다. 병렬 회로의 Z를 통째로 더하지 않는다.",
                "ELI와 ICE를 바꾸면 위상각 부호가 반대가 된다. L은 전압이 앞이고, C는 전류가 앞이다.",
            ]
        )
    )

    story.append(P("6.  시험 전에 식만 다시 보기", "h1"))
    story.append(
        formula(
            [
                "이상 연산증폭기     i+ = i- = 0,    v+ = v-",
                "반전  vo/vi = -R2/R1,     비반전  vo/vi = 1 + R2/R1,     추종기  vo = vi",
                "반전 합산  vout = -Rf (v1/R1 + v2/R2 + v3/R3)",
                "커패시터  i = C dv/dt,    에너지 ½Cv²,    DC 개방,    전압 연속",
                "인덕터    v = L di/dt,    에너지 ½Li²,    DC 단락,    전류 연속",
                "L 직렬은 합, L 병렬은 역수합.   C는 그 반대.",
                "τ(RL) = L/R,    τ(RC) = RC",
                "x(t) = x(∞) + (x(t0) - x(∞)) e^{-(t-t0)/τ}",
                "무전원  x(t) = x(t0) e^{-(t-t0)/τ}",
                "완전 = 과도 + 정상 = 무상태 + 무전원,    과도 ≠ 무전원",
                "v = Vm sin(ωt+θ)  ↔  V = Vm∠θ",
                "ZL = jωL,    ZC = -j/(ωC),    직렬은 Z 합, 병렬은 Y 합",
                "L : 전압이 90° 앞섬.    C : 전류가 90° 앞섬.",
            ]
        )
    )
    story.append(Spacer(1, 3 * mm))
    story.append(P("7.  연습문제와 기출을 계산한 답", "h1"))
    story.append(
        P(
            "교재 6·7·8·10장 맨 끝 연습문제와 기출은 올린 페이지에 풀이가 없다. "
            "회로를 잘라 다시 읽고, 이상 연산증폭기·상태변수·페이저로 계산했다. "
            "그림 판독이 답을 가를 수 있는 문항은 답 끝에 다시 보라고 적었다."
        )
    )
    sol_dir = os.path.join(os.path.dirname(__file__), "solutions")
    for fname, heading in (
        ("sol6.md", "6장 연산증폭기"),
        ("sol7.md", "7장 커패시터·인덕터"),
        ("sol8.md", "8장 RL/RC 완전응답"),
        ("sol10.md", "10장 정현파 정상상태"),
    ):
        story.append(P(heading, "h2"))
        for title, bits in practice_items(os.path.join(sol_dir, fname)):
            story.append(detail_box(title, bits))
    story.append(Spacer(1, 3 * mm))
    story.append(
        P(
            "이 노트는 기초 회로이론 6·7·8·10장 본문 예제, 그 장 끝 연습·기출의 계산, 수업 필기, Floyd 임피던스 절, 이상화 교수 자료를 묶은 것이다. "
            "연습·기출 중 그림을 끝까지 확정하지 못한 문항은 답을 하나만 고르지 않고 그 이유를 적었다."
        )
    )

    out = "/workspace/note/회로이론_단권화노트.pdf"
    doc = BaseDocTemplate(
        out,
        pagesize=A4,
        title="회로이론 단권화 노트",
        author="회로이론 수업 자료",
    )
    cover_frame = Frame(LEFT, 20 * mm, CONTENT_W, PAGE_H - 36 * mm, id="cover", showBoundary=0)
    body_frame = Frame(LEFT, BOTTOM, CONTENT_W, PAGE_H - TOP - BOTTOM, id="body", showBoundary=0)
    doc.addPageTemplates(
        [
            PageTemplate(id="cover", frames=[cover_frame], onPage=cover_page),
            PageTemplate(id="body", frames=[body_frame], onPage=header_footer),
        ]
    )
    doc.build(story)
    print(out)


if __name__ == "__main__":
    build()
