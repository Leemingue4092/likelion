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

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 실험 3 보고서 HWP를 양식으로 열고, 본문만 실험 5 가산기로 바꾼다.
 * 문단 모양, 글자 모양, 표 테두리, 그림 컨트롤은 양식 파일 것을 그대로 쓴다.
 */
public class BuildAdderReport {
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
                : docs + "/20234092_이민규_회로이론실습설계2_실험5_가산기.hwp";
        String template = args.length > 2 ? args[2] : docs + "/hwp/template.hwp";
        BuildAdderReport report = new BuildAdderReport(docs, template);
        report.build();
        HWPWriter.toFile(report.hwp, out);
        injectSummary(out);

        HWPFile readBack = HWPReader.fromFile(out);
        String text = TextExtractor.extract(readBack, TextExtractMethod.InsertControlTextBetweenParagraphText);
        String[] required = {
                "회로이론실습설계 2",
                "실험 5.  가산기",
                "2.40 kΩ",
                "3.00 kΩ",
                "7.50 kΩ",
                "4.70 kΩ",
                "6.00 Vpp",
                "1.00 kHz",
                "4.15",
                "24.90 Vpp",
                "입력 없음",
                "[그림 2-1]",
                "[표 5-2]",
                "수업 화면, 실험 5 가산기"
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
        Matcher longDecimal = Pattern.compile("\\d+\\.\\d{3,}").matcher(text);
        while (longDecimal.find()) {
            problems.add("소수점 셋째 자리 이상: " + longDecimal.group());
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
        if (!"실험 5.  가산기".equals(section.getParagraph(4).getNormalString())) {
            problems.add("실험명 표기 다름: [" + section.getParagraph(4).getNormalString() + "]");
        }
        if (section.getParagraph(12).getHeader().getDivideSort().isDividePage() == false) {
            problems.add("1. 실험 목적 앞에 쪽 나눔이 없음");
        }
        if (section.getParagraph(12).getHeader().getParaShapeId() != 26) {
            problems.add("큰 제목 문단 모양 다름");
        }
        boolean sawPhoto = false;
        boolean sawClassPhoto = false;
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
                if (pic.getHeader().getWidth() == PHOTO_W) {
                    sawPhoto = true;
                    if (pic.getShapeComponentPicture().getPictureInfo().getBinItemID() == 8) {
                        sawClassPhoto = true;
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
        if (!sawPhoto || !sawClassPhoto) {
            problems.add("70 mm 수업 화면 그림이 없음");
        }
        if (!sawTable) {
            problems.add("표가 없음");
        }
    }

    public BuildAdderReport(String docsDir, String templatePath) throws Exception {
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
        replaceCover(section.getParagraph(4), "실험 5.  가산기");
        replaceCover(section.getParagraph(5), "과목명 : 회로이론실습설계 2");
        replaceCover(section.getParagraph(9), "제출일 : 입력 없음");
        replaceCover(section.getParagraph(10), "실험일 : 입력 없음");
        blankGroup(section.getParagraph(11));

        while (section.getParagraphCount() > COVER_KEEP) {
            section.deleteParagraph(section.getParagraphCount() - 1);
        }

        body("가산기에 1.00 kHz, 6.00 Vpp를 넣고 출력 크기를 보려 한 실험이다.");
        body("입력은 2.40 kΩ, 3.00 kΩ, 7.50 kΩ을 거쳐 −단자로 들어간다.");
        body("수업 화면에는 6 Vpp, 1 kHz가 적혀 있다.");
        body("파형 이름은 입력 없음.");

        heading("2. 실험 이론");
        subhead("2-1. 가산기가 하는 일");
        body("세 저항이 한 입력에 병렬로 달려 있다.");
        body("그 끝은 −단자에 모인다.");
        body("+단자는 접지다.");
        equation("Vo = − Rf (1/R1 + 1/R2 + 1/R3) Vi          수식 2-1");
        body("R1은 2.40 kΩ이다.");
        body("R2는 3.00 kΩ이다.");
        body("R3는 7.50 kΩ이다.");
        body("Rf는 4.70 kΩ이다.");
        body("세 입력 전압은 같다.");
        body("입력은 −단자로 넣는다.");
        body("그래서 출력 부호는 반대다.");
        body("핀 번호는 입력 없음.");

        subhead("2-2. 이번 회로 값");
        body("4.70 / 2.40 = 1.96이다.");
        body("4.70 / 3.00 = 1.57이다.");
        body("4.70 / 7.50 = 0.63이다.");
        body("1.96 + 1.57 + 0.63 = 4.16이다.");
        body("출력 계산에 쓴 배율 크기는 4.15다.");
        body("6.00 Vpp × 4.15 = 24.90 Vpp다.");
        body("이론 출력 크기는 24.90 Vpp다.");
        body("부호는 음이다.");
        body("양전원은 +15 V다.");
        body("음전원은 −15 V다.");
        body("두 전원의 차는 30 V다.");
        body("24.90 Vpp는 30 V보다 작다.");
        body("화면에서 읽은 입력으로 다시 계산한 값은 입력 없음.");

        subhead("2-3. 회로도");
        body("6.00 Vpp, 1.00 kHz 입력이 2.40 kΩ, 3.00 kΩ, 7.50 kΩ으로 갈라진다.");
        body("세 저항의 다른 끝은 −단자에 모인다.");
        body("+단자는 접지다.");
        body("4.70 kΩ은 출력과 −단자 사이에 있다.");
        body("양전원은 +15 V다.");
        body("음전원은 −15 V다.");
        photo(docsDir + "/수업화면_실험5_가산기.jpg");
        figureCaption("[그림 2-1] 수업 화면. 실험 5 가산기");

        subhead("2-4. 핀 정리");
        body("칠판에는 핀 번호가 없다.");
        caption("[표 2-1] 핀 정리");
        table(pinTableProto, new String[][]{
                {"단자", "연결"},
                {"+", "접지"},
                {"−", "2.40 kΩ, 3.00 kΩ, 7.50 kΩ"},
                {"출력", "4.70 kΩ 피드백"},
                {"양전원", "+15 V"},
                {"음전원", "−15 V"}
        });
        body("핀 번호는 입력 없음.");

        heading("3. 실험기기 및 부품");
        caption("[표 3-1] 실험기기 및 부품");
        table(equipTableProto, new String[][]{
                {"항목", "내용"},
                {"능동소자", "연산증폭기 (모델명 입력 없음)"},
                {"저항", "2.40 kΩ, 3.00 kΩ, 7.50 kΩ, 4.70 kΩ"},
                {"커패시터 또는 인덕터", "입력 없음"},
                {"입력(함수발생기 설정)", "1.00 kHz, 6.00 Vpp, 파형 입력 없음"},
                {"측정기", "입력 없음"}
        });

        heading("4. 실험 방법");
        subhead("4-1. 주의사항");
        body("양전원은 +15 V다.");
        body("음전원은 −15 V다.");
        body("두 전원을 바꾸면 연산증폭기가 죽는다.");
        body("입력은 −단자로 넣는다.");
        body("프로브 배율은 입력 없음.");
        subhead("4-2. 회로 구성");
        body("브레드보드에 꽂은 순서는 입력 없음.");
        body("스코프 CH1, CH2가 어느 노드인지는 입력 없음.");
        subhead("4-3. 측정 조건");
        body("함수발생기 모델은 입력 없음.");
        body("칠판 주파수는 1.00 kHz다.");
        body("진폭은 6.00 Vpp다.");
        body("파형 이름은 입력 없음.");
        body("오프셋은 입력 없음.");
        body("스코프 모델은 입력 없음.");
        body("시간축은 입력 없음.");
        body("전압축은 입력 없음.");
        body("커플링은 입력 없음.");
        body("프로브 배율은 입력 없음.");
        body("촬영 시각은 입력 없음.");

        heading("5. 실험 결과");
        subhead("5-1. 1.00 kHz");
        body("칠판 입력은 6.00 Vpp다.");
        body("주파수는 1.00 kHz다.");
        body("파형 이름은 입력 없음.");
        body("스코프 화면의 색, 채널, pk-pk, 시간축, 전압축, 촬영 시각은 입력 없음.");
        body("이론 출력 크기는 24.90 Vpp다.");
        body("부호는 음이다.");
        caption("[표 5-1] 1.00 kHz");
        table(measureTableProto.clone(), new String[][]{
                {"항목", "값"},
                {"칠판 입력", "6.00 Vpp, 1.00 kHz"},
                {"파형", "입력 없음"},
                {"이론 출력 (계산)", "24.90 Vpp (계산)"},
                {"스코프 pk-pk", "입력 없음"},
                {"시간축", "입력 없음"},
                {"전압축", "입력 없음"}
        });

        subhead("5-2. 정리");
        caption("[표 5-2] 가산기");
        table(summaryTableProto, new String[][]{
                {"구분", "입력", "출력"},
                {"2.40 kΩ", "6.00 Vpp", "1.96배"},
                {"3.00 kΩ", "6.00 Vpp", "1.57배"},
                {"7.50 kΩ", "6.00 Vpp", "0.63배"},
                {"합 (계산)", "6.00 Vpp", "24.90 Vpp (계산)"}
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
        body("2.40 kΩ, 3.00 kΩ, 7.50 kΩ과 4.70 kΩ 가산기의 칠판 입력은 1.00 kHz, 6.00 Vpp다.");
        body("계산 출력 크기는 24.90 Vpp다.");
        body("부호는 −단자 입력이라 반대이고, 스코프 측정은 입력 없음.");

        heading("8. 참고문헌");
        body("[1] 수업 화면, 실험 5 가산기.");
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
        BufferedImage img = ImageIO.read(new File(path));
        int dispH = (int) ((long) PHOTO_W * img.getHeight() / img.getWidth());
        picture.getHeader().setWidth(PHOTO_W);
        picture.getHeader().setHeight(dispH);
        ShapeComponent shape = picture.getShapeComponent();
        shape.setWidthAtCreate(PHOTO_W);
        shape.setHeightAtCreate(dispH);
        shape.setWidthAtCurrent(PHOTO_W);
        shape.setHeightAtCurrent(dispH);
        shape.setRotateXCenter(PHOTO_W / 2);
        shape.setRotateYCenter(dispH / 2);
        ShapeComponentPicture each = picture.getShapeComponentPicture();
        each.getPictureInfo().setBinItemID(binId);
        int imageW = img.getWidth() * 75;
        int imageH = img.getHeight() * 75;
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
        each.getLeftBottom().setY(dispH);
        each.getRightBottom().setX(PHOTO_W);
        each.getRightBottom().setY(dispH);
        LineSegItem item = paragraph.getLineSeg().getLineSegItemList().get(0);
        item.setTextStartPosition(0);
        item.setLineVerticalPosition(0);
        item.setLineHeight(dispH);
        item.setTextPartHeight(dispH);
        item.setDistanceBaseLineToLineVerticalPosition(dispH * 10057 / 11832);
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
                {"2", "실험 5. 가산기"},
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
