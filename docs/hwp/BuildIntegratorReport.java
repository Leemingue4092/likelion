import kr.dogfoot.hwplib.object.HWPFile;
import kr.dogfoot.hwplib.object.bodytext.Section;
import kr.dogfoot.hwplib.object.bodytext.control.ControlTable;
import kr.dogfoot.hwplib.object.bodytext.control.ControlType;
import kr.dogfoot.hwplib.object.bodytext.control.gso.ControlPicture;
import kr.dogfoot.hwplib.object.bodytext.control.gso.shapecomponent.ShapeComponent;
import kr.dogfoot.hwplib.object.bodytext.control.gso.shapecomponenteach.ShapeComponentPicture;
import kr.dogfoot.hwplib.object.bodytext.control.table.Cell;
import kr.dogfoot.hwplib.object.bodytext.paragraph.Paragraph;
import kr.dogfoot.hwplib.object.bodytext.paragraph.lineseg.LineSegItem;
import kr.dogfoot.hwplib.object.docinfo.BinData;
import kr.dogfoot.hwplib.object.docinfo.bindata.BinDataCompress;
import kr.dogfoot.hwplib.object.docinfo.bindata.BinDataState;
import kr.dogfoot.hwplib.object.docinfo.bindata.BinDataType;
import kr.dogfoot.hwplib.org.apache.poi.poifs.filesystem.POIFSFileSystem;
import kr.dogfoot.hwplib.reader.HWPReader;
import kr.dogfoot.hwplib.tool.textextractor.TextExtractMethod;
import kr.dogfoot.hwplib.tool.textextractor.TextExtractor;
import kr.dogfoot.hwplib.writer.HWPWriter;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * 실험 3 보고서 HWP를 양식으로 열고, 본문만 실험 4 적분기로 바꾼다.
 * 문단 모양, 글자 모양, 표 테두리, 그림 컨트롤은 양식 파일 것을 그대로 쓴다.
 */
public class BuildIntegratorReport {
    private static final int COVER_KEEP = 13;
    private static final int PHOTO_W = 19843;
    private static final int PHOTO_H = 19843 * 1024 / 768;

    private final HWPFile hwp;
    private final Section section;
    private final String docsDir;

    private Paragraph bodyProto;
    private Paragraph eqProto;
    private Paragraph headProto;
    private Paragraph subProto;
    private Paragraph captionProto;
    private Paragraph figureCaptionProto;
    private Paragraph pictureProto;
    private Paragraph pinTableProto;
    private Paragraph equipTableProto;
    private Paragraph measureTableProto;
    private Paragraph summaryTableProto;

    public static void main(String[] args) throws Exception {
        String docs = args.length > 0 ? args[0] : "docs";
        String out = args.length > 1
                ? args[1]
                : docs + "/20234092_이민규_회로이론실습설계2_실험4_적분기.hwp";
        String template = args.length > 2 ? args[2] : docs + "/hwp/template.hwp";
        BuildIntegratorReport report = new BuildIntegratorReport(docs, template);
        report.build();
        HWPWriter.toFile(report.hwp, out);
        injectSummary(out);

        HWPFile readBack = HWPReader.fromFile(out);
        String text = TextExtractor.extract(readBack, TextExtractMethod.InsertControlTextBetweenParagraphText);
        String[] required = {
                "회로이론실습설계 2",
                "실험 4.  적분기",
                "0.3537 Vpp",
                "0.3536 Vpp",
                "0.2778 Vpp",
                "90.92",
                "15 kΩ",
                "33 kΩ",
                "100 nF",
                "3 kHz",
                "10 Vpp",
                "sine파",
                "이 회로는 입력을 핀 2, 반전 −단자에 넣는다.",
                "입력 없음",
                "[그림 2-1]",
                "[표 5-3]",
                "수업 화면, 실험 4 적분기"
        };
        String[] forbidden = {
                "3.3 kΩ", "33 pF", "741", "10.00 kHz", "140.99",
                "회로이론실습설계 1", "사인파", "미분기", "이동주", "7조", "6.8 kΩ"
        };
        List<String> problems = new ArrayList<String>();
        for (String s : required) {
            if (!text.contains(s)) {
                problems.add("빠짐: " + s);
            }
        }
        for (String s : forbidden) {
            if (text.contains(s)) {
                problems.add("들어가면 안 되는 값: " + s);
            }
        }
        checkForm(readBack, problems);
        if (!problems.isEmpty()) {
            System.err.println(text);
            throw new IllegalStateException(String.join("\n", problems));
        }
        System.out.println(out);
        System.out.println("chars=" + text.length());
    }

    private static void checkForm(HWPFile file, List<String> problems) throws Exception {
        Section section = file.getBodyText().getSectionList().get(0);
        if (file.getDocInfo().getCharShapeList().size() != 18) {
            problems.add("글자 모양이 양식과 다름: " + file.getDocInfo().getCharShapeList().size());
        }
        if (file.getDocInfo().getParaShapeList().size() != 37) {
            problems.add("문단 모양이 양식과 다름: " + file.getDocInfo().getParaShapeList().size());
        }
        if (file.getDocInfo().getHangulFaceNameList().get(0).getName().equals("맑은 고딕") == false) {
            problems.add("첫 글꼴이 맑은 고딕이 아님");
        }
        Paragraph cover = section.getParagraph(1);
        if (cover.getHeader().getParaShapeId() != 21) {
            problems.add("표지 학과 줄 문단 모양 다름");
        }
        if (!cover.getNormalString().contains("회로이론실습설계 2")) {
            problems.add("표지 과목명 줄이 2가 아님");
        }
        Paragraph logo = section.getParagraph(2);
        if (!(logo.getControlList().get(0) instanceof ControlPicture)) {
            problems.add("표지 로고가 그림 컨트롤이 아님");
        } else {
            ControlPicture pic = (ControlPicture) logo.getControlList().get(0);
            if (pic.getHeader().getWidth() != 5993 || pic.getHeader().getHeight() != 7800) {
                problems.add("표지 로고 크기 다름");
            }
            if (pic.getShapeComponentPicture().getPictureInfo().getBinItemID() != 1) {
                problems.add("표지 로고 그림 번호 다름");
            }
        }
        if (section.getParagraph(4).getHeader().getParaShapeId() != 24) {
            problems.add("표지 실험명 문단 모양 다름");
        }
        if (!"실험 4.  적분기".equals(section.getParagraph(4).getNormalString())) {
            problems.add("실험명 표기 다름: [" + section.getParagraph(4).getNormalString() + "]");
        }
        if (section.getParagraph(12).getHeader().getDivideSort().isDividePage() == false) {
            problems.add("1. 실험 목적 앞에 쪽 나눔이 없음");
        }
        if (section.getParagraph(12).getHeader().getParaShapeId() != 26) {
            problems.add("큰 제목 문단 모양 다름");
        }
        boolean sawPhoto = false;
        boolean sawTable = false;
        for (int i = COVER_KEEP; i < section.getParagraphCount(); i++) {
            Paragraph p = section.getParagraph(i);
            if (p.getHeader().getDivideSort().isDividePage()) {
                problems.add("본문에 쪽 나눔이 더 있음: " + p.getNormalString());
            }
            if (p.getControlList() == null) {
                continue;
            }
            if (p.getControlList().get(0) instanceof ControlPicture) {
                ControlPicture pic = (ControlPicture) p.getControlList().get(0);
                if (pic.getHeader().getWidth() == PHOTO_W && pic.getHeader().getHeight() == PHOTO_H) {
                    sawPhoto = true;
                    if (pic.getShapeComponentPicture().getPictureInfo().getBinItemID() != 8) {
                        problems.add("수업 화면 그림 번호 다름");
                    }
                }
            }
            if (p.getControlList().get(0) instanceof ControlTable) {
                ControlTable table = (ControlTable) p.getControlList().get(0);
                Cell header = table.getRowList().get(0).getCellList().get(0);
                Cell body = table.getRowList().get(1).getCellList().get(0);
                if (header.getListHeader().getBorderFillId() != 4 || body.getListHeader().getBorderFillId() != 3) {
                    problems.add("표 테두리가 양식과 다름");
                }
                if (header.getListHeader().getLeftMargin() != 510 || header.getListHeader().getTopMargin() != 141) {
                    problems.add("표 안쪽 여백이 양식과 다름");
                }
                Paragraph cellPara = header.getParagraphList().getParagraph(0);
                if (cellPara.getHeader().getParaShapeId() != 32) {
                    problems.add("표 안 문단 모양 다름");
                }
                sawTable = true;
            }
        }
        if (!sawPhoto) {
            problems.add("70 mm 수업 화면 그림이 없음");
        }
        if (!sawTable) {
            problems.add("표가 없음");
        }
    }

    public BuildIntegratorReport(String docsDir, String templatePath) throws Exception {
        this.docsDir = docsDir;
        this.hwp = HWPReader.fromFile(templatePath);
        this.section = hwp.getBodyText().getSectionList().get(0);
        this.bodyProto = section.getParagraph(16).clone();
        this.eqProto = section.getParagraph(18).clone();
        this.headProto = section.getParagraph(14).clone();
        this.subProto = section.getParagraph(15).clone();
        this.captionProto = section.getParagraph(86).clone();
        this.figureCaptionProto = section.getParagraph(40).clone();
        this.pictureProto = section.getParagraph(39).clone();
        this.pinTableProto = section.getParagraph(48).clone();
        this.equipTableProto = section.getParagraph(51).clone();
        this.measureTableProto = section.getParagraph(77).clone();
        this.summaryTableProto = section.getParagraph(87).clone();
    }

    public void build() throws Exception {
        replaceCover(section.getParagraph(1), "공과대학  ·  회로이론실습설계 2");
        replaceCover(section.getParagraph(4), "실험 4.  적분기");
        replaceCover(section.getParagraph(5), "과목명 : 회로이론실습설계 2");
        replaceCover(section.getParagraph(9), "제출일 : 입력 없음");
        replaceCover(section.getParagraph(10), "실험일 : 입력 없음");
        blankGroup(section.getParagraph(11));

        while (section.getParagraphCount() > COVER_KEEP) {
            section.deleteParagraph(section.getParagraphCount() - 1);
        }

        body("적분기 회로에 sine파와 삼각파를 넣어 출력 모양을 보는 실험이다.");
        body("출력은 입력을 시간에 대해 더한 값에 비례한다.");
        body("수업 화면에는 10 Vpp, 3 kHz, sine파, 삼각파가 적혀 있다.");

        heading("2. 실험 이론");
        subhead("2-1. 적분기가 하는 일");
        body("출력은 입력의 적분에 비례한다.");
        body("sine 입력은 이렇다.");
        equation("Vi = Vp sin(ωt)");
        body("이 회로는 입력을 핀 2, 반전 −단자에 넣는다.");
        equation("Vo = − (1 / (R C)) ∫ Vi dt          수식 2-1");
        body("sin(ωt)의 적분은 −cos(ωt) / ω다.");
        body("식 앞의 마이너스가 그 부호를 뒤집는다.");
        equation("Vo = (Vp / (ω R C)) cos(ωt)");
        body("cos(ωt)는 sin(ωt)보다 90도 앞선 파다.");
        body("출력은 코사인 모양이다.");
        body("커패시터만 두면 출력은 입력보다 90도 앞선다.");
        body("스코프에서 어느 채널이 어느 쪽으로 밀렸는지는 입력 없음.");
        body("핀 3(+)는 접지다.");
        body("핀 2는 거의 0 V다.");
        body("입력이 양이면 15 kΩ으로 핀 2 쪽에 전류가 흐른다.");
        body("그 전류는 핀 안으로 들어가지 못한다.");
        body("그 전류는 100 nF를 타고 출력에서 나온다.");
        body("그래서 출력은 아래로 간다.");
        body("삼각파가 0보다 클 때 출력은 내려간다.");
        body("삼각파가 0보다 작을 때 출력은 올라간다.");
        body("직선인 입력을 적분하면 시간 제곱에 비례한다.");
        body("삼각파 출력은 포물선이다.");

        subhead("2-2. 이번 회로 값");
        body("입력 저항은 15 kΩ이다.");
        body("피드백은 33 kΩ과 100 nF의 병렬이다.");
        body("직류에서 100 nF는 열린다.");
        body("이때 피드백은 33 kΩ만 남는다.");
        body("직류 배율은 −33 kΩ / 15 kΩ = −2.2다.");
        body("Vp는 10 Vpp의 절반이라 5 V다.");
        body("ω R C = 2π · 3 kHz · 15 kΩ · 100 nF = 28.27이다.");
        body("1 / 28.27 = 0.03537이다.");
        body("sine파 이론 출력은 10 Vpp · 0.03537 = 0.3537 Vpp다.");
        body("이 값은 15 kΩ과 100 nF만 쓴 계산이다.");
        body("2π · 3 kHz · 33 kΩ · 100 nF = 62.20이다.");
        body("1 + 62.20의 제곱의 제곱근은 62.21이다.");
        body("2.2 / 62.21 = 0.03536이다.");
        body("33 kΩ을 병렬로 넣은 sine파 출력은 10 Vpp · 0.03536 = 0.3536 Vpp다.");
        body("반전 입력의 부호는 180도다.");
        body("arctan(62.20) = 89.08도다.");
        body("180 − 89.08 = 90.92도다.");
        body("33 kΩ을 병렬로 넣은 sine파 출력은 입력보다 90.92도 앞선다.");
        body("화면에서 읽은 입력으로 다시 계산한 값은 입력 없음.");
        body("삼각파도 칠판의 전원 표시 10 Vpp로 계산했다.");
        body("5 V / (4 · 3 kHz) = 4.167×10⁻⁴ V·s다.");
        body("1 / (15 kΩ · 100 nF) = 666.7 s⁻¹이다.");
        body("666.7 · 4.167×10⁻⁴ = 0.2778 Vpp다.");
        body("삼각파 이론 출력의 pk-pk는 0.2778 Vpp다.");
        body("이 값은 15 kΩ과 100 nF만 쓴 계산이다.");

        subhead("2-3. 회로도");
        body("입력은 15 kΩ을 거쳐 핀 2(−)로 들어간다.");
        body("핀 3(+)는 접지다.");
        body("33 kΩ과 100 nF는 핀 6과 핀 2 사이에 병렬로 있다.");
        body("핀 7은 +15 V다.");
        body("핀 4는 −15 V다.");
        photo(docsDir + "/수업화면_실험4_적분기.jpg");
        figureCaption("[그림 2-1] 수업 화면. 실험 4 적분기");

        subhead("2-4. 핀 정리");
        body("칠판에 적힌 핀은 이렇다.");
        caption("[표 2-1] 핀 정리");
        table(pinTableProto, new String[][]{
                {"핀", "연결"},
                {"핀 3 (+)", "접지"},
                {"핀 2 (−)", "입력 15 kΩ"},
                {"핀 6 (출력)", "Vo, 피드백 33 kΩ과 100 nF"},
                {"핀 7", "+15 V"},
                {"핀 4", "−15 V"}
        });
        body("칠판에 없는 핀은 입력 없음.");

        heading("3. 실험기기 및 부품");
        caption("[표 3-1] 실험기기 및 부품");
        table(equipTableProto, new String[][]{
                {"항목", "내용"},
                {"능동소자", "연산증폭기 (모델명 입력 없음)"},
                {"저항", "15 kΩ (입력), 33 kΩ (피드백)"},
                {"커패시터 또는 인덕터", "100 nF"},
                {"입력(함수발생기 설정)", "3 kHz, 10 Vpp, sine파 / 삼각파"},
                {"측정기", "입력 없음"}
        });

        heading("4. 실험 방법");
        subhead("4-1. 주의사항");
        body("핀 7은 +15 V다.");
        body("핀 4는 −15 V다.");
        body("입력은 15 kΩ을 거쳐 핀 2(−)로 넣는다.");
        body("프로브 배율은 입력 없음.");
        subhead("4-2. 회로 구성");
        body("브레드보드에 꽂은 순서는 입력 없음.");
        body("스코프 CH1, CH2가 어느 노드인지는 입력 없음.");
        subhead("4-3. 측정 조건");
        body("함수발생기 모델은 입력 없음.");
        body("칠판 주파수는 3 kHz다.");
        body("파형은 sine파와 삼각파다.");
        body("진폭은 10 Vpp다.");
        body("오프셋은 입력 없음.");
        body("스코프 모델은 입력 없음.");
        body("시간축은 입력 없음.");
        body("전압축은 입력 없음.");
        body("커플링은 입력 없음.");
        body("프로브 배율은 입력 없음.");
        body("촬영 시각은 입력 없음.");

        heading("5. 실험 결과");
        subhead("5-1. sine파");
        body("칠판에 적힌 첫 입력은 sine파다.");
        body("진폭은 10 Vpp다.");
        body("주파수는 3 kHz다.");
        body("스코프 화면의 색, 채널, pk-pk, 시간축, 전압축, 촬영 시각은 입력 없음.");
        body("15 kΩ과 100 nF만 쓴 이론 출력은 0.3537 Vpp다.");
        body("33 kΩ을 병렬로 넣은 이론 출력은 0.3536 Vpp다.");
        caption("[표 5-1] sine파");
        table(measureTableProto.clone(), new String[][]{
                {"항목", "값"},
                {"칠판 입력", "sine파, 10 Vpp, 3 kHz"},
                {"스코프 pk-pk", "입력 없음"},
                {"시간축", "입력 없음"},
                {"전압축", "입력 없음"},
                {"이론 출력 (15 kΩ, 100 nF)", "0.3537 Vpp (계산)"},
                {"이론 출력 (33 kΩ 병렬)", "0.3536 Vpp (계산)"}
        });

        subhead("5-2. 삼각파");
        body("칠판에 적힌 다음 입력은 삼각파다.");
        body("주파수는 3 kHz다.");
        body("진폭은 칠판의 전원 표시 10 Vpp를 썼다.");
        body("15 kΩ과 100 nF만 쓴 이론 출력은 포물선이다.");
        body("그 pk-pk는 0.2778 Vpp다.");
        body("33 kΩ을 병렬로 넣은 삼각파 계산은 입력 없음.");
        body("스코프 화면의 색, 채널, pk-pk, 시간축, 전압축, 촬영 시각은 입력 없음.");
        caption("[표 5-2] 삼각파");
        table(measureTableProto.clone(), new String[][]{
                {"항목", "값"},
                {"칠판 입력", "삼각파, 10 Vpp, 3 kHz"},
                {"스코프 pk-pk", "입력 없음"},
                {"시간축", "입력 없음"},
                {"전압축", "입력 없음"},
                {"이론 출력 (15 kΩ, 100 nF)", "0.2778 Vpp (계산)"},
                {"이론 출력 (33 kΩ 병렬)", "입력 없음"}
        });

        subhead("5-3. 정리");
        caption("[표 5-3] sine파와 삼각파");
        table(summaryTableProto, new String[][]{
                {"구분", "입력", "출력"},
                {"sine파", "10 Vpp, 3 kHz", "0.3537 Vpp (계산)"},
                {"sine파, 33 kΩ 병렬", "10 Vpp, 3 kHz", "0.3536 Vpp (계산)"},
                {"삼각파", "10 Vpp, 3 kHz", "0.2778 Vpp (계산)"},
                {"스코프", "입력 없음", "입력 없음"}
        });

        heading("6. 결과 분석 및 고찰");
        subhead("6-1. 입력 없음");
        body("스코프 화면이 입력에 없다.");
        body("화면에서 이상해 보인 점은 입력 없음.");
        subhead("6-2. 크기");
        body("비교할 측정값이 입력에 없다.");
        body("오차율은 입력 없음.");
        subhead("6-3. 느낀점");
        body("입력 없음.");

        heading("7. 결론");
        body("15 kΩ, 100 nF, 33 kΩ 적분기의 칠판 입력은 3 kHz, 10 Vpp다.");
        body("sine파 계산 출력은 0.3537 Vpp이고, 33 kΩ 병렬을 넣은 계산은 0.3536 Vpp다.");
        body("삼각파 계산 출력은 0.2778 Vpp인 포물선이고, 스코프에서 읽은 출력과 오차율은 입력 없음.");

        heading("8. 참고문헌");
        body("[1] 수업 화면, 실험 4 적분기.");
    }

    private void body(String text) {
        append(styled(bodyProto, text));
    }

    private void equation(String text) {
        append(styled(eqProto, text));
    }

    private void heading(String text) {
        append(styled(headProto, text));
    }

    private void subhead(String text) {
        append(styled(subProto, text));
    }

    private void caption(String text) {
        append(styled(captionProto, text));
    }

    private void figureCaption(String text) {
        append(styled(figureCaptionProto, text));
    }

    private void append(Paragraph paragraph) {
        section.insertParagraph(section.getParagraphCount(), paragraph);
    }

    private Paragraph styled(Paragraph proto, String text) {
        Paragraph paragraph = proto.clone();
        paragraph.deleteText();
        paragraph.createText();
        try {
            paragraph.getText().addString(text);
        } catch (java.io.UnsupportedEncodingException e) {
            throw new IllegalStateException(e);
        }
        rebuildLines(paragraph, text);
        return paragraph;
    }

    private void rebuildLines(Paragraph paragraph, String text) {
        LineSegItem sample = paragraph.getLineSeg().getLineSegItemList().get(0).clone();
        int width = sample.getSegmentWidth();
        int em = sample.getLineHeight();
        List<Integer> starts = lineStarts(text, width, em);
        paragraph.getLineSeg().getLineSegItemList().clear();
        int y = 0;
        int step = sample.getLineHeight() + sample.getLineSpace();
        for (int start : starts) {
            LineSegItem item = sample.clone();
            item.setTextStartPosition(start);
            item.setLineVerticalPosition(y);
            item.setStartPositionFromColumn(0);
            paragraph.getLineSeg().getLineSegItemList().add(item);
            y += step;
        }
    }

    private static List<Integer> lineStarts(String text, int width, int em) {
        List<Integer> starts = new ArrayList<Integer>();
        starts.add(0);
        int used = 0;
        int lineStart = 0;
        int lastSpace = -1;
        int ascii = em / 2;
        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);
            int cw = ch < 128 ? ascii : em;
            if (used + cw > width && i > lineStart) {
                int breakAt = lastSpace >= lineStart ? lastSpace + 1 : i;
                if (breakAt <= lineStart) {
                    breakAt = i;
                }
                starts.add(breakAt);
                lineStart = breakAt;
                lastSpace = -1;
                used = 0;
                i = breakAt - 1;
                continue;
            }
            used += cw;
            if (ch == ' ') {
                lastSpace = i;
            }
        }
        return starts;
    }

    private void table(Paragraph proto, String[][] rows) throws Exception {
        Paragraph paragraph = proto.clone();
        ControlTable table = (ControlTable) paragraph.getControlList().get(0);
        if (table.getRowList().size() != rows.length) {
            throw new IllegalStateException("표 행 수가 양식과 다름: " + rows[0][0]);
        }
        for (int r = 0; r < rows.length; r++) {
            if (table.getRowList().get(r).getCellList().size() != rows[r].length) {
                throw new IllegalStateException("표 열 수가 양식과 다름");
            }
            for (int c = 0; c < rows[r].length; c++) {
                Paragraph cell = table.getRowList().get(r).getCellList().get(c).getParagraphList().getParagraph(0);
                cell.deleteText();
                cell.createText();
                cell.getText().addString(rows[r][c]);
            }
        }
        LineSegItem item = paragraph.getLineSeg().getLineSegItemList().get(0);
        item.setTextStartPosition(0);
        item.setLineVerticalPosition(0);
        append(paragraph);
    }

    private void photo(String path) throws Exception {
        int binId = embedJpeg(path);
        Paragraph paragraph = pictureProto.clone();
        ControlPicture picture = (ControlPicture) paragraph.getControlList().get(0);
        if (picture.getType() != ControlType.Gso) {
            throw new IllegalStateException("양식 그림이 그림 컨트롤이 아님");
        }
        picture.getHeader().setWidth(PHOTO_W);
        picture.getHeader().setHeight(PHOTO_H);
        ShapeComponent shape = picture.getShapeComponent();
        shape.setWidthAtCreate(PHOTO_W);
        shape.setHeightAtCreate(PHOTO_H);
        shape.setWidthAtCurrent(PHOTO_W);
        shape.setHeightAtCurrent(PHOTO_H);
        shape.setRotateXCenter(PHOTO_W / 2);
        shape.setRotateYCenter(PHOTO_H / 2);
        ShapeComponentPicture each = picture.getShapeComponentPicture();
        each.getPictureInfo().setBinItemID(binId);
        int imageW = 768 * 75;
        int imageH = 1024 * 75;
        each.setImageWidth(imageW);
        each.setImageHeight(imageH);
        each.setLeftAfterCutting(0);
        each.setTopAfterCutting(0);
        each.setRightAfterCutting(imageW);
        each.setBottomAfterCutting(imageH);
        each.getLeftTop().setX(0);
        each.getLeftTop().setY(0);
        each.getRightTop().setX(PHOTO_W);
        each.getRightTop().setY(0);
        each.getLeftBottom().setX(0);
        each.getLeftBottom().setY(PHOTO_H);
        each.getRightBottom().setX(PHOTO_W);
        each.getRightBottom().setY(PHOTO_H);
        LineSegItem item = paragraph.getLineSeg().getLineSegItemList().get(0);
        item.setTextStartPosition(0);
        item.setLineVerticalPosition(0);
        item.setLineHeight(PHOTO_H);
        item.setTextPartHeight(PHOTO_H);
        item.setDistanceBaseLineToLineVerticalPosition(PHOTO_H * 10057 / 11832);
        item.setStartPositionFromColumn(0);
        item.setSegmentWidth(48188);
        append(paragraph);
    }

    private int embedJpeg(String path) throws Exception {
        int next = hwp.getBinData().getEmbeddedBinaryDataList().size() + 1;
        String streamName = String.format("BIN%04d.jpg", next);
        byte[] bytes = readAll(path);
        hwp.getBinData().addNewEmbeddedBinaryData(streamName, bytes, BinDataCompress.ByStorageDefault);
        BinData data = hwp.getDocInfo().addNewBinData();
        data.getProperty().setType(BinDataType.Embedding);
        data.getProperty().setCompress(BinDataCompress.ByStorageDefault);
        data.getProperty().setState(BinDataState.NotAccess);
        data.setBinDataID(next);
        data.setExtensionForEmbedding("jpg");
        return hwp.getDocInfo().getBinDataList().size();
    }

    private static void replaceCover(Paragraph paragraph, String text) {
        paragraph.deleteText();
        paragraph.createText();
        try {
            paragraph.getText().addString(text);
        } catch (java.io.UnsupportedEncodingException e) {
            throw new IllegalStateException(e);
        }
    }

    private static void blankGroup(Paragraph paragraph) {
        List<kr.dogfoot.hwplib.object.bodytext.paragraph.text.HWPChar> chars =
                paragraph.getText().getCharList();
        for (int i = 0; i < 11; i++) {
            chars.remove(9);
        }
        paragraph.getCharShape().getPositonShapeIdPairList().get(1).setPosition(11);
        List<LineSegItem> lines = paragraph.getLineSeg().getLineSegItemList();
        lines.get(0).setTextStartPosition(0);
        lines.get(1).setTextStartPosition(10);
        lines.get(2).setTextStartPosition(11);
    }

    private static byte[] readAll(String path) throws Exception {
        File file = new File(path);
        byte[] buffer = new byte[(int) file.length()];
        InputStream in = new FileInputStream(file);
        try {
            int off = 0;
            while (off < buffer.length) {
                int n = in.read(buffer, off, buffer.length - off);
                if (n < 0) {
                    break;
                }
                off += n;
            }
        } finally {
            in.close();
        }
        return buffer;
    }

    private static void injectSummary(String path) throws Exception {
        byte[] summary = summaryBytes();
        POIFSFileSystem fs = new POIFSFileSystem(new FileInputStream(path));
        String summaryName = "\u0005HwpSummaryInformation";
        if (fs.getRoot().hasEntry(summaryName)) {
            fs.getRoot().getEntry(summaryName).delete();
        }
        fs.createDocument(new ByteArrayInputStream(summary), summaryName);
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        fs.writeFilesystem(bos);
        FileOutputStream out = new FileOutputStream(path);
        try {
            out.write(bos.toByteArray());
        } finally {
            out.close();
        }
    }

    private static byte[] summaryBytes() throws Exception {
        String[][] props = {
                {"2", "실험 4. 적분기"},
                {"3", "회로이론실습설계 2"},
                {"4", "이민규"},
                {"8", "이민규"}
        };
        byte[][] blobs = new byte[props.length][];
        for (int i = 0; i < props.length; i++) {
            byte[] chars = (props[i][1] + "\u0000").getBytes("UTF-16LE");
            ByteArrayOutputStream blob = new ByteArrayOutputStream();
            writeInt(blob, 31);
            writeInt(blob, chars.length / 2);
            blob.write(chars);
            blobs[i] = blob.toByteArray();
        }
        byte[] dictionary = new byte[]{0, 0, 0, 0};
        int propCount = props.length + 1;
        int listBytes = 8 + propCount * 8;
        int[] offsets = new int[props.length];
        int cursor = listBytes;
        for (int i = 0; i < blobs.length; i++) {
            offsets[i] = cursor;
            cursor += blobs[i].length;
        }
        int dictionaryOffset = cursor;
        cursor += dictionary.length;
        ByteArrayOutputStream section = new ByteArrayOutputStream();
        writeInt(section, cursor);
        writeInt(section, propCount);
        for (int i = 0; i < props.length; i++) {
            writeInt(section, Integer.parseInt(props[i][0]));
            writeInt(section, offsets[i]);
        }
        writeInt(section, 0);
        writeInt(section, dictionaryOffset);
        for (byte[] blob : blobs) {
            section.write(blob);
        }
        section.write(dictionary);
        byte[] sectionBytes = section.toByteArray();
        byte[] guid = new byte[]{
                0x60, (byte) 0xB6, (byte) 0xA2, (byte) 0x9F,
                0x61, 0x10, (byte) 0xD4, 0x11,
                (byte) 0xB4, (byte) 0xC6, 0x00, 0x60,
                (byte) 0x97, (byte) 0xC0, (byte) 0x9D, (byte) 0x8C
        };
        ByteArrayOutputStream all = new ByteArrayOutputStream();
        all.write(0xFE);
        all.write(0xFF);
        all.write(0);
        all.write(0);
        writeInt(all, 0);
        all.write(guid);
        writeInt(all, 1);
        all.write(guid);
        writeInt(all, 28 + 20);
        all.write(sectionBytes);
        return all.toByteArray();
    }

    private static void writeInt(ByteArrayOutputStream out, int value) {
        out.write(value & 0xFF);
        out.write((value >> 8) & 0xFF);
        out.write((value >> 16) & 0xFF);
        out.write((value >> 24) & 0xFF);
    }
}
