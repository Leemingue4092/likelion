import kr.dogfoot.hwplib.object.HWPFile;
import kr.dogfoot.hwplib.object.bodytext.Section;
import kr.dogfoot.hwplib.object.bodytext.control.ControlSectionDefine;
import kr.dogfoot.hwplib.object.bodytext.control.ControlTable;
import kr.dogfoot.hwplib.object.bodytext.control.ControlType;
import kr.dogfoot.hwplib.object.bodytext.control.ctrlheader.CtrlHeaderGso;
import kr.dogfoot.hwplib.object.bodytext.control.ctrlheader.gso.GsoHeaderProperty;
import kr.dogfoot.hwplib.object.bodytext.control.ctrlheader.gso.HeightCriterion;
import kr.dogfoot.hwplib.object.bodytext.control.ctrlheader.gso.HorzRelTo;
import kr.dogfoot.hwplib.object.bodytext.control.ctrlheader.gso.ObjectNumberSort;
import kr.dogfoot.hwplib.object.bodytext.control.ctrlheader.gso.RelativeArrange;
import kr.dogfoot.hwplib.object.bodytext.control.ctrlheader.gso.TextFlowMethod;
import kr.dogfoot.hwplib.object.bodytext.control.ctrlheader.gso.TextHorzArrange;
import kr.dogfoot.hwplib.object.bodytext.control.ctrlheader.gso.VertRelTo;
import kr.dogfoot.hwplib.object.bodytext.control.ctrlheader.gso.WidthCriterion;
import kr.dogfoot.hwplib.object.bodytext.control.ctrlheader.sectiondefine.TextDirection;
import kr.dogfoot.hwplib.object.bodytext.control.gso.ControlRectangle;
import kr.dogfoot.hwplib.object.bodytext.control.gso.GsoControlType;
import kr.dogfoot.hwplib.object.bodytext.control.gso.shapecomponent.ShapeComponentNormal;
import kr.dogfoot.hwplib.object.bodytext.control.gso.shapecomponent.lineinfo.LineArrowShape;
import kr.dogfoot.hwplib.object.bodytext.control.gso.shapecomponent.lineinfo.LineArrowSize;
import kr.dogfoot.hwplib.object.bodytext.control.gso.shapecomponent.lineinfo.LineEndShape;
import kr.dogfoot.hwplib.object.bodytext.control.gso.shapecomponent.lineinfo.LineInfo;
import kr.dogfoot.hwplib.object.bodytext.control.gso.shapecomponent.lineinfo.LineType;
import kr.dogfoot.hwplib.object.bodytext.control.gso.shapecomponent.lineinfo.OutlineStyle;
import kr.dogfoot.hwplib.object.bodytext.control.gso.shapecomponent.shadowinfo.ShadowInfo;
import kr.dogfoot.hwplib.object.bodytext.control.gso.shapecomponent.shadowinfo.ShadowType;
import kr.dogfoot.hwplib.object.bodytext.control.gso.shapecomponenteach.ShapeComponentRectangle;
import kr.dogfoot.hwplib.object.bodytext.control.gso.textbox.LineChange;
import kr.dogfoot.hwplib.object.bodytext.control.gso.textbox.TextVerticalAlignment;
import kr.dogfoot.hwplib.object.bodytext.control.sectiondefine.PageDef;
import kr.dogfoot.hwplib.object.bodytext.control.table.Cell;
import kr.dogfoot.hwplib.object.bodytext.control.table.DivideAtPageBoundary;
import kr.dogfoot.hwplib.object.bodytext.control.table.ListHeaderForCell;
import kr.dogfoot.hwplib.object.bodytext.control.table.Row;
import kr.dogfoot.hwplib.object.bodytext.control.table.Table;
import kr.dogfoot.hwplib.object.bodytext.paragraph.Paragraph;
import kr.dogfoot.hwplib.object.bodytext.paragraph.header.ParaHeader;
import kr.dogfoot.hwplib.object.bodytext.paragraph.lineseg.LineSegItem;
import kr.dogfoot.hwplib.object.bodytext.paragraph.lineseg.ParaLineSeg;
import kr.dogfoot.hwplib.object.docinfo.BinData;
import kr.dogfoot.hwplib.object.docinfo.BorderFill;
import kr.dogfoot.hwplib.object.docinfo.CharShape;
import kr.dogfoot.hwplib.object.docinfo.ParaShape;
import kr.dogfoot.hwplib.object.docinfo.bindata.BinDataCompress;
import kr.dogfoot.hwplib.object.docinfo.bindata.BinDataState;
import kr.dogfoot.hwplib.object.docinfo.bindata.BinDataType;
import kr.dogfoot.hwplib.object.docinfo.borderfill.BackSlashDiagonalShape;
import kr.dogfoot.hwplib.object.docinfo.borderfill.BorderThickness;
import kr.dogfoot.hwplib.object.docinfo.borderfill.BorderType;
import kr.dogfoot.hwplib.object.docinfo.borderfill.SlashDiagonalShape;
import kr.dogfoot.hwplib.object.docinfo.borderfill.fillinfo.ImageFill;
import kr.dogfoot.hwplib.object.docinfo.borderfill.fillinfo.ImageFillType;
import kr.dogfoot.hwplib.object.docinfo.borderfill.fillinfo.PatternFill;
import kr.dogfoot.hwplib.object.docinfo.borderfill.fillinfo.PatternType;
import kr.dogfoot.hwplib.object.docinfo.borderfill.fillinfo.PictureEffect;
import kr.dogfoot.hwplib.object.docinfo.charshape.BorderType2;
import kr.dogfoot.hwplib.object.docinfo.charshape.EmphasisSort;
import kr.dogfoot.hwplib.object.docinfo.charshape.OutterLineSort;
import kr.dogfoot.hwplib.object.docinfo.charshape.ShadowSort;
import kr.dogfoot.hwplib.object.docinfo.charshape.UnderLineSort;
import kr.dogfoot.hwplib.object.docinfo.parashape.Alignment;
import kr.dogfoot.hwplib.org.apache.poi.poifs.filesystem.POIFSFileSystem;
import kr.dogfoot.hwplib.reader.HWPReader;
import kr.dogfoot.hwplib.tool.blankfilemaker.BlankFileMaker;
import kr.dogfoot.hwplib.tool.textextractor.TextExtractMethod;
import kr.dogfoot.hwplib.tool.textextractor.TextExtractor;
import kr.dogfoot.hwplib.writer.HWPWriter;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * 실험 4 적분기 보고서를 HWP 5.0으로 만든다.
 * 본문 숫자는 수업 화면(칠판)에 적힌 값과, 그 값으로 다시 계산한 이론값만 넣는다.
 */
public class BuildIntegratorReport {
    private static final double CONTENT_W = 170.0;
    private static final double CONTENT_H = 297.0 - 18.0 - 18.0;
    private static final int BLUE_R = 0x1E;
    private static final int BLUE_G = 0x5A;
    private static final int BLUE_B = 0xA0;
    private static final int GRAY = 0x55;

    private final HWPFile hwp;
    private final Section section;
    private final String docsDir;

    private int zOrder = 0;
    private int streamIndex = 0;
    private double cursorY = 0;

    private int csBody;
    private int csHeading;
    private int csSubhead;
    private int csCaption;
    private int csCoverTitle;
    private int csCoverGray;
    private int csCoverBig;
    private int csCoverName;
    private int csFooter;
    private int csCell;
    private int csCellBold;

    private int psBody;
    private int psBodyCenter;
    private int psHeading;
    private int psSubhead;
    private int psCaption;
    private int psKeep;
    private int psImage;
    private int psCoverTitle;
    private int psCoverSub;
    private int psCoverBig;
    private int psCoverName;
    private int psFooter;
    private int psCellCenter;
    private int psCellRight;

    private int borderCell;
    private int borderHeader;
    private int borderNone;

    public static void main(String[] args) throws Exception {
        String docs = args.length > 0 ? args[0] : "docs";
        String out = args.length > 1
                ? args[1]
                : docs + "/20234092_이민규_회로이론실습설계2_실험4_적분기.hwp";
        BuildIntegratorReport report = new BuildIntegratorReport(docs);
        report.build();
        HWPWriter.toFile(report.hwp, out);
        injectSummary(out);

        HWPFile readBack = HWPReader.fromFile(out);
        String text = TextExtractor.extract(readBack, TextExtractMethod.InsertControlTextBetweenParagraphText);
        String[] required = {
                "회로이론실습설계 2",
                "실험 4",
                "적분기",
                "0.3537 Vpp",
                "0.3536 Vpp",
                "0.2778 Vpp",
                "90.92",
                "15 kΩ",
                "33 kΩ",
                "100 nF",
                "3 kHz",
                "10 Vpp",
                "입력 없음",
                "[그림 2-1]",
                "[표 5-3]",
                "수업 화면, 실험 4 적분기"
        };
        String[] forbidden = {"3.3 kΩ", "33 pF", "741", "10.00 kHz", "140.99", "회로이론실습설계 1"};
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
        if (!problems.isEmpty()) {
            System.err.println(text);
            throw new IllegalStateException(String.join("\n", problems));
        }
        System.out.println(out);
        System.out.println("chars=" + text.length());
    }

    public BuildIntegratorReport(String docsDir) {
        this.docsDir = docsDir;
        this.hwp = BlankFileMaker.make();
        this.section = hwp.getBodyText().getSectionList().get(0);
        applyPage();
        shrinkSectionParagraph();
        prepareStyles();
    }

    private static void injectSummary(String path) throws Exception {
        byte[] summary = summaryBytes();
        POIFSFileSystem fs = new POIFSFileSystem(new FileInputStream(path));
        fs.createDocument(new java.io.ByteArrayInputStream(summary), "\u0005HwpSummaryInformation");
        java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
        fs.writeFilesystem(bos);
        java.io.FileOutputStream out = new java.io.FileOutputStream(path);
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
            java.io.ByteArrayOutputStream blob = new java.io.ByteArrayOutputStream();
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
        java.io.ByteArrayOutputStream section = new java.io.ByteArrayOutputStream();
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
        java.io.ByteArrayOutputStream all = new java.io.ByteArrayOutputStream();
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

    private static void writeInt(java.io.ByteArrayOutputStream out, int value) {
        out.write(value & 0xFF);
        out.write((value >> 8) & 0xFF);
        out.write((value >> 16) & 0xFF);
        out.write((value >> 24) & 0xFF);
    }

    private void applyPage() {
        Paragraph first = section.getParagraph(0);
        ControlSectionDefine csd = (ControlSectionDefine) first.getControlList().get(0);
        PageDef page = csd.getPageDef();
        page.setPaperWidth(mm(210));
        page.setPaperHeight(mm(297));
        page.setLeftMargin(mm(20));
        page.setRightMargin(mm(20));
        page.setTopMargin(mm(18));
        page.setBottomMargin(mm(18));
        page.setHeaderMargin(mm(10));
        page.setFooterMargin(mm(10));
    }

    private void shrinkSectionParagraph() {
        LineSegItem item = section.getParagraph(0).getLineSeg().getLineSegItemList().get(0);
        item.setLineHeight(200);
        item.setTextPartHeight(200);
        item.setDistanceBaseLineToLineVerticalPosition(160);
        item.setLineSpace(0);
        item.setSegmentWidth((int) mm(CONTENT_W));
    }

    private void prepareStyles() {
        csCoverTitle = charShape(20, true, BLUE_R, BLUE_G, BLUE_B);
        csCoverGray = charShape(12, false, GRAY, GRAY, GRAY);
        csCoverBig = charShape(22, true, BLUE_R, BLUE_G, BLUE_B);
        csCoverName = charShape(16, true, 0, 0, 0);
        csFooter = charShape(11, false, GRAY, GRAY, GRAY);
        csHeading = charShape(13, true, 0, 0, 0);
        csSubhead = charShape(12, true, 0, 0, 0);
        csBody = charShape(11, false, 0, 0, 0);
        csCaption = charShape(10, false, 0, 0, 0);
        csCell = charShape(11, false, 0, 0, 0);
        csCellBold = charShape(11, true, 0, 0, 0);

        psBody = paraShape(Alignment.Left, 0, 2, 120, false);
        psCellCenter = paraShape(Alignment.Center, 1, 1, 120, false);
        psCellRight = paraShape(Alignment.Right, 1, 1, 120, false);
        psBodyCenter = paraShape(Alignment.Center, 2, 2, 120, false);
        psHeading = paraShape(Alignment.Left, 12, 6, 130, false);
        psSubhead = paraShape(Alignment.Left, 10, 4, 130, false);
        psCaption = paraShape(Alignment.Center, 2, 4, 120, false);
        psKeep = paraShape(Alignment.Center, 2, 2, 120, true);
        psImage = paraShape(Alignment.Center, 2, 2, 120, true);
        psCoverTitle = paraShape(Alignment.Center, 48, 2, 130, false);
        psCoverSub = paraShape(Alignment.Center, 0, 8, 130, false);
        psCoverBig = paraShape(Alignment.Center, 8, 6, 130, false);
        psCoverName = paraShape(Alignment.Center, 2, 10, 130, false);
        psFooter = paraShape(Alignment.Center, 14, 0, 130, false);
        borderCell = border(true, false);
        borderHeader = border(true, true);
        borderNone = border(false, false);
    }

    public void build() throws IOException {
        text("순천향대학교", psCoverTitle, csCoverTitle, false);
        text("공과대학  ·  회로이론실습설계 2", psCoverSub, csCoverGray, false);
        image(docsDir + "/sch_logo.png", "png", 24, 24.0 * 177.0 / 136.0, false);
        text("실험 보고서", psCoverBig, csCoverBig, false);
        text("실험 4.  적분기", psCoverName, csCoverName, false);
        metaTable();
        text("순천향대학교  ·  2026학년도 2학기", psFooter, csFooter, false);

        cursorY = 0;
        heading("1. 실험 목적", true);
        sentences(
                "적분기 회로에 사인파와 삼각파를 넣어 출력 모양을 보는 실험이다.",
                "출력은 입력을 시간에 대해 더한 값에 비례한다.",
                "수업 화면에는 10 Vpp, 3 kHz, 사인파, 삼각파가 적혀 있다."
        );

        heading("2. 실험 이론", false);
        subhead("2-1. 적분기가 하는 일");
        sentences(
                "출력은 입력의 적분에 비례한다.",
                "사인 입력은 이렇다."
        );
        text("Vi = Vp sin(ωt)", psBody, csBody, false);
        equation("Vo = − (1 / (R C)) ∫ Vi dt", "수식 2-1");
        sentences(
                "sin(ωt)의 적분은 −cos(ωt) / ω다.",
                "식 앞의 마이너스가 그 부호를 뒤집는다."
        );
        text("Vo = (Vp / (ω R C)) cos(ωt)", psBody, csBody, false);
        sentences(
                "cos(ωt)는 sin(ωt)보다 90도 앞선 파다.",
                "출력은 코사인 모양이다.",
                "커패시터만 두면 출력은 입력보다 90도 앞선다.",
                "스코프에서 어느 채널이 어느 쪽으로 밀렸는지는 입력 없음.",
                "핀 3(+)는 접지다.",
                "핀 2는 거의 0 V다.",
                "입력이 양이면 15 kΩ으로 핀 2 쪽에 전류가 흐른다.",
                "그 전류는 핀 안으로 들어가지 못한다.",
                "그 전류는 100 nF를 타고 출력에서 나온다.",
                "그래서 출력은 아래로 간다.",
                "삼각파가 0보다 클 때 출력은 내려간다.",
                "삼각파가 0보다 작을 때 출력은 올라간다.",
                "직선인 입력을 적분하면 시간 제곱에 비례한다.",
                "삼각파 출력은 포물선이다."
        );

        subhead("2-2. 이번 회로 값");
        sentences(
                "입력 저항은 15 kΩ이다.",
                "피드백은 33 kΩ과 100 nF의 병렬이다.",
                "직류에서 100 nF는 열린다.",
                "이때 피드백은 33 kΩ만 남는다.",
                "직류 배율은 −33 kΩ / 15 kΩ = −2.2다.",
                "Vp는 10 Vpp의 절반이라 5 V다.",
                "ω R C = 2π · 3 kHz · 15 kΩ · 100 nF = 28.27이다.",
                "1 / 28.27 = 0.03537이다.",
                "사인파 이론 출력은 10 Vpp · 0.03537 = 0.3537 Vpp다.",
                "이 값은 15 kΩ과 100 nF만 쓴 계산이다.",
                "2π · 3 kHz · 33 kΩ · 100 nF = 62.20이다.",
                "1 + 62.20의 제곱의 제곱근은 62.21이다.",
                "2.2 / 62.21 = 0.03536이다.",
                "33 kΩ을 병렬로 넣은 사인파 출력은 10 Vpp · 0.03536 = 0.3536 Vpp다.",
                "반전 입력의 부호는 180도다.",
                "arctan(62.20) = 89.08도다.",
                "180 − 89.08 = 90.92도다.",
                "33 kΩ을 병렬로 넣은 사인파 출력은 입력보다 90.92도 앞선다.",
                "화면에서 읽은 입력으로 다시 계산한 값은 입력 없음.",
                "삼각파도 칠판의 전원 표시 10 Vpp로 계산했다.",
                "5 V / (4 · 3 kHz) = 4.167×10⁻⁴ V·s다.",
                "1 / (15 kΩ · 100 nF) = 666.7 s⁻¹이다.",
                "666.7 · 4.167×10⁻⁴ = 0.2778 Vpp다.",
                "삼각파 이론 출력의 pk-pk는 0.2778 Vpp다.",
                "이 값은 15 kΩ과 100 nF만 쓴 계산이다."
        );

        subhead("2-3. 회로도");
        text("입력은 15 kΩ을 거쳐 핀 2(−)로 들어간다. 핀 3(+)는 접지다. "
                        + "33 kΩ과 100 nF는 핀 6과 핀 2 사이에 병렬로 있다. 핀 7은 +15 V이고 핀 4는 −15 V다.",
                psBody, csBody, false);
        double photoH = 70.0 * 1024.0 / 768.0;
        double captionH = paraHeight("[그림 2-1] 수업 화면. 실험 4 적분기", 10, 2, 8, CONTENT_W);
        boolean breakPhoto = cursorY + photoH + captionH > CONTENT_H;
        image(docsDir + "/수업화면_실험4_적분기.jpg", "jpg", 70, photoH, breakPhoto);
        text("[그림 2-1] 수업 화면. 실험 4 적분기", psCaption, csCaption, false);

        subhead("2-4. 핀 정리");
        sentences("칠판에 적힌 핀은 이렇다.");
        text("[표 2-1] 핀 정리", psKeep, csCaption, false);
        table(
                new String[]{"핀", "연결"},
                new String[][]{
                        {"핀 3 (+)", "접지"},
                        {"핀 2 (−)", "입력 15 kΩ"},
                        {"핀 6 (출력)", "Vo, 피드백 33 kΩ과 100 nF"},
                        {"핀 7", "+15 V"},
                        {"핀 4", "−15 V"}
                },
                new double[]{40, 120},
                true
        );
        sentences("칠판에 없는 핀은 입력 없음.");

        heading("3. 실험기기 및 부품", false);
        text("[표 3-1] 실험기기 및 부품", psKeep, csCaption, false);
        table(
                new String[]{"항목", "내용"},
                new String[][]{
                        {"능동소자", "연산증폭기 (모델명 입력 없음)"},
                        {"저항", "15 kΩ (입력), 33 kΩ (피드백)"},
                        {"커패시터 또는 인덕터", "100 nF"},
                        {"입력(함수발생기 설정)", "3 kHz, 10 Vpp, 사인파 / 삼각파"},
                        {"측정기", "입력 없음"}
                },
                new double[]{52, 108},
                true
        );

        heading("4. 실험 방법", false);
        subhead("4-1. 주의사항");
        sentences(
                "핀 7은 +15 V다.",
                "핀 4는 −15 V다.",
                "입력은 15 kΩ을 거쳐 핀 2(−)로 넣는다.",
                "프로브 배율은 입력 없음."
        );
        subhead("4-2. 회로 구성");
        sentences(
                "브레드보드에 꽂은 순서는 입력 없음.",
                "스코프 CH1, CH2가 어느 노드인지는 입력 없음."
        );
        subhead("4-3. 측정 조건");
        sentences(
                "함수발생기 모델은 입력 없음.",
                "칠판 주파수는 3 kHz다.",
                "파형은 사인파와 삼각파다.",
                "진폭은 10 Vpp다.",
                "오프셋은 입력 없음.",
                "스코프 모델은 입력 없음.",
                "시간축은 입력 없음.",
                "전압축은 입력 없음.",
                "커플링은 입력 없음.",
                "프로브 배율은 입력 없음.",
                "촬영 시각은 입력 없음."
        );

        heading("5. 실험 결과", false);
        subhead("5-1. 사인파");
        sentences(
                "칠판에 적힌 첫 입력은 사인파다.",
                "진폭은 10 Vpp다.",
                "주파수는 3 kHz다.",
                "스코프 화면의 색, 채널, pk-pk, 시간축, 전압축, 촬영 시각은 입력 없음.",
                "15 kΩ과 100 nF만 쓴 이론 출력은 0.3537 Vpp다.",
                "33 kΩ을 병렬로 넣은 이론 출력은 0.3536 Vpp다."
        );
        text("[표 5-1] 사인파", psKeep, csCaption, false);
        table(
                new String[]{"항목", "값"},
                new String[][]{
                        {"칠판 입력", "사인파, 10 Vpp, 3 kHz"},
                        {"스코프 pk-pk", "입력 없음"},
                        {"시간축", "입력 없음"},
                        {"전압축", "입력 없음"},
                        {"이론 출력 (15 kΩ, 100 nF)", "0.3537 Vpp (계산)"},
                        {"이론 출력 (33 kΩ 병렬)", "0.3536 Vpp (계산)"}
                },
                new double[]{62, 98},
                true
        );

        subhead("5-2. 삼각파");
        sentences(
                "칠판에 적힌 다음 입력은 삼각파다.",
                "주파수는 3 kHz다.",
                "진폭은 칠판의 전원 표시 10 Vpp를 썼다.",
                "15 kΩ과 100 nF만 쓴 이론 출력은 포물선이다.",
                "그 pk-pk는 0.2778 Vpp다.",
                "33 kΩ을 병렬로 넣은 삼각파 계산은 입력 없음.",
                "스코프 화면의 색, 채널, pk-pk, 시간축, 전압축, 촬영 시각은 입력 없음."
        );
        text("[표 5-2] 삼각파", psKeep, csCaption, false);
        table(
                new String[]{"항목", "값"},
                new String[][]{
                        {"칠판 입력", "삼각파, 10 Vpp, 3 kHz"},
                        {"스코프 pk-pk", "입력 없음"},
                        {"시간축", "입력 없음"},
                        {"전압축", "입력 없음"},
                        {"이론 출력 (15 kΩ, 100 nF)", "0.2778 Vpp (계산)"},
                        {"이론 출력 (33 kΩ 병렬)", "입력 없음"}
                },
                new double[]{62, 98},
                true
        );

        subhead("5-3. 정리");
        text("[표 5-3] 사인파와 삼각파", psKeep, csCaption, false);
        table(
                new String[]{"구분", "입력", "출력"},
                new String[][]{
                        {"사인파", "10 Vpp, 3 kHz", "0.3537 Vpp (계산)"},
                        {"사인파, 33 kΩ 병렬", "10 Vpp, 3 kHz", "0.3536 Vpp (계산)"},
                        {"삼각파", "10 Vpp, 3 kHz", "0.2778 Vpp (계산)"},
                        {"스코프", "입력 없음", "입력 없음"}
                },
                new double[]{48, 46, 66},
                true
        );

        heading("6. 결과 분석 및 고찰", false);
        subhead("6-1. 입력 없음");
        sentences(
                "스코프 화면이 입력에 없다.",
                "화면에서 이상해 보인 점은 입력 없음."
        );
        subhead("6-2. 크기");
        sentences(
                "비교할 측정값이 입력에 없다.",
                "오차율은 입력 없음."
        );
        subhead("6-3. 느낀점");
        sentences("입력 없음.");

        heading("7. 결론", false);
        sentences(
                "15 kΩ, 100 nF, 33 kΩ 적분기의 칠판 입력은 3 kHz, 10 Vpp다.",
                "사인파 계산 출력은 0.3537 Vpp이고, 33 kΩ 병렬을 넣은 계산은 0.3536 Vpp다.",
                "삼각파 계산 출력은 0.2778 Vpp인 포물선이고, 스코프에서 읽은 출력과 오차율은 입력 없음."
        );

        heading("8. 참고문헌", false);
        sentences("[1] 수업 화면, 실험 4 적분기.");
    }

    private void sentences(String... lines) {
        for (String line : lines) {
            text(line, psBody, csBody, false);
        }
    }

    private void heading(String value, boolean pageBreak) {
        text(value, psHeading, csHeading, pageBreak);
    }

    private void subhead(String value) {
        text(value, psSubhead, csSubhead, false);
    }

    private void text(String value, int paraShapeId, int charShapeId, boolean pageBreak) {
        Paragraph p = section.addNewParagraph();
        header(p, paraShapeId, pageBreak);
        p.createText();
        try {
            p.getText().addString(value);
        } catch (java.io.UnsupportedEncodingException e) {
            throw new IllegalStateException(e);
        }
        p.createCharShape();
        p.getCharShape().addParaCharShape(0, charShapeId);
        double width = CONTENT_W;
        int fontPt = fontPtOf(charShapeId);
        int before = beforePt(paraShapeId);
        int after = afterPt(paraShapeId);
        List<Integer> starts = lineStarts(value, width, fontPt);
        lineSeg(p, starts, value.length(), fontPt, width);
        advance(paraHeight(value, fontPt, before, after, width), pageBreak);
    }

    private void equation(String left, String right) {
        String[][] rows = {{left, right}};
        addTable(null, rows, new double[]{128, 42}, false, new Alignment[]{Alignment.Left, Alignment.Right});
    }

    private void metaTable() {
        String[][] rows = {
                {"과목명", ": 회로이론실습설계 2"},
                {"교수명", ": 강병권 교수님"},
                {"학번", ": 20234092"},
                {"제출자", ": 이민규"},
                {"제출일", ": 입력 없음"},
                {"실험일", ": 입력 없음"},
                {"조 / 조원", ":"}
        };
        addTable(null, rows, new double[]{32, 78}, false, new Alignment[]{Alignment.Left, Alignment.Left});
    }

    private void table(String[] headers, String[][] rows, double[] widths, boolean borders) {
        addTable(headers, rows, widths, borders, null);
    }

    private void addTable(String[] headers, String[][] rows, double[] widths, boolean borders, Alignment[] aligns) {
        int cols = widths.length;
        int bodyRows = rows.length;
        int totalRows = bodyRows + (headers == null ? 0 : 1);
        double tableW = 0;
        for (double w : widths) {
            tableW += w;
        }
        List<String[]> all = new ArrayList<String[]>();
        if (headers != null) {
            all.add(headers);
        }
        for (String[] row : rows) {
            all.add(row);
        }

        double[] rowHeights = new double[totalRows];
        double tableH = 0;
        for (int r = 0; r < totalRows; r++) {
            double h = 8;
            for (int c = 0; c < cols; c++) {
                double inner = Math.max(8, widths[c] - 2.4);
                int lines = lineStarts(all.get(r)[c], inner, 11).size();
                h = Math.max(h, lines * 5.2 + 2.4);
            }
            rowHeights[r] = h;
            tableH += h;
        }

        Paragraph p = section.addNewParagraph();
        header(p, psBodyCenter, false);
        p.createText();
        p.getText().addExtendCharForTable();
        p.createCharShape();
        p.getCharShape().addParaCharShape(0, csCell);
        lineSeg(p, single(0), 8, 11, CONTENT_W);
        LineSegItem only = p.getLineSeg().getLineSegItemList().get(0);
        only.setLineHeight((int) mm(tableH));
        only.setTextPartHeight((int) mm(tableH));
        only.setDistanceBaseLineToLineVerticalPosition((int) mm(tableH * 0.85));

        ControlTable table = (ControlTable) p.addNewControl(ControlType.Table);
        CtrlHeaderGso hdr = table.getHeader();
        GsoHeaderProperty prop = hdr.getProperty();
        prop.setLikeWord(true);
        prop.setApplyLineSpace(false);
        prop.setVertRelTo(VertRelTo.Para);
        prop.setVertRelativeArrange(RelativeArrange.TopOrLeft);
        prop.setHorzRelTo(HorzRelTo.Para);
        prop.setHorzRelativeArrange(RelativeArrange.Center);
        prop.setVertRelToParaLimit(false);
        prop.setAllowOverlap(false);
        prop.setWidthCriterion(WidthCriterion.Absolute);
        prop.setHeightCriterion(HeightCriterion.Absolute);
        prop.setProtectSize(false);
        prop.setTextFlowMethod(TextFlowMethod.FitWithText);
        prop.setTextHorzArrange(TextHorzArrange.BothSides);
        prop.setObjectNumberSort(ObjectNumberSort.Table);
        hdr.setxOffset(0);
        hdr.setyOffset(0);
        hdr.setWidth(mm(tableW));
        hdr.setHeight(mm(tableH));
        hdr.setzOrder(zOrder++);
        hdr.setOutterMarginLeft(0);
        hdr.setOutterMarginRight(0);
        hdr.setOutterMarginTop((int) mm(1));
        hdr.setOutterMarginBottom((int) mm(1));
        hdr.setPreventPageDivide(true);

        Table record = table.getTable();
        record.getProperty().setDivideAtPageBoundary(DivideAtPageBoundary.NoDivide);
        record.getProperty().setAutoRepeatTitleRow(false);
        record.setRowCount(totalRows);
        record.setColumnCount(cols);
        record.setCellSpacing(0);
        record.setLeftInnerMargin(0);
        record.setRightInnerMargin(0);
        record.setTopInnerMargin(0);
        record.setBottomInnerMargin(0);
        record.setBorderFillId(borderNone);
        for (int r = 0; r < totalRows; r++) {
            record.getCellCountOfRowList().add(cols);
        }

        for (int r = 0; r < totalRows; r++) {
            Row row = table.addNewRow();
            boolean headerRow = headers != null && r == 0;
            for (int c = 0; c < cols; c++) {
                Cell cell = row.addNewCell();
                ListHeaderForCell lh = cell.getListHeader();
                lh.setParaCount(1);
                lh.getProperty().setTextDirection(TextDirection.Horizontal);
                lh.getProperty().setLineChange(LineChange.Normal);
                lh.getProperty().setTextVerticalAlignment(TextVerticalAlignment.Center);
                lh.getProperty().setProtectCell(false);
                lh.getProperty().setEditableAtFormMode(false);
                lh.setColIndex(c);
                lh.setRowIndex(r);
                lh.setColSpan(1);
                lh.setRowSpan(1);
                lh.setWidth(mm(widths[c]));
                lh.setHeight(mm(rowHeights[r]));
                int margin = (int) mm(borders ? 1.2 : 0.6);
                lh.setLeftMargin(margin);
                lh.setRightMargin(margin);
                lh.setTopMargin(margin);
                lh.setBottomMargin(margin);
                lh.setBorderFillId(borders ? (headerRow ? borderHeader : borderCell) : borderNone);
                lh.setTextWidth(mm(widths[c]) - margin * 2L);
                lh.setFieldName("");

                Alignment align = Alignment.Left;
                if (headerRow) {
                    align = Alignment.Center;
                } else if (aligns != null) {
                    align = aligns[c];
                } else if (c == 0) {
                    align = Alignment.Center;
                }
                int paraId = align == Alignment.Center ? psCellCenter
                        : align == Alignment.Right ? psCellRight : psBody;
                int charId = headerRow ? csCellBold : csCell;

                Paragraph cp = cell.getParagraphList().addNewParagraph();
                header(cp, paraId, false);
                cp.createText();
                try {
                    cp.getText().addString(all.get(r)[c]);
                } catch (java.io.UnsupportedEncodingException e) {
                    throw new IllegalStateException(e);
                }
                cp.createCharShape();
                cp.getCharShape().addParaCharShape(0, charId);
                double inner = Math.max(8, widths[c] - 2.4);
                List<Integer> starts = lineStarts(all.get(r)[c], inner, 11);
                lineSeg(cp, starts, all.get(r)[c].length(), 11, inner);
            }
        }
        advance(tableH + 3, false);
    }

    private void image(String path, String ext, int widthMm, double heightMm, boolean pageBreak) throws IOException {
        int binId = embed(path, ext);
        Paragraph p = section.addNewParagraph();
        header(p, psImage, pageBreak);
        p.createText();
        p.getText().addExtendCharForGSO();
        p.createCharShape();
        p.getCharShape().addParaCharShape(0, csCell);
        lineSeg(p, single(0), 8, 11, CONTENT_W);
        LineSegItem only = p.getLineSeg().getLineSegItemList().get(0);
        int h = (int) mm(heightMm);
        only.setLineHeight(h);
        only.setTextPartHeight(h);
        only.setDistanceBaseLineToLineVerticalPosition((int) (h * 0.85));

        ControlRectangle rectangle = (ControlRectangle) p.addNewGsoControl(GsoControlType.Rectangle);
        CtrlHeaderGso hdr = rectangle.getHeader();
        GsoHeaderProperty prop = hdr.getProperty();
        prop.setLikeWord(true);
        prop.setApplyLineSpace(false);
        prop.setVertRelTo(VertRelTo.Para);
        prop.setVertRelativeArrange(RelativeArrange.TopOrLeft);
        prop.setHorzRelTo(HorzRelTo.Para);
        prop.setHorzRelativeArrange(RelativeArrange.Center);
        prop.setVertRelToParaLimit(true);
        prop.setAllowOverlap(true);
        prop.setWidthCriterion(WidthCriterion.Absolute);
        prop.setHeightCriterion(HeightCriterion.Absolute);
        prop.setProtectSize(false);
        prop.setTextFlowMethod(TextFlowMethod.FitWithText);
        prop.setTextHorzArrange(TextHorzArrange.BothSides);
        prop.setObjectNumberSort(ObjectNumberSort.Figure);
        hdr.setyOffset(0);
        hdr.setxOffset(0);
        hdr.setWidth(mm(widthMm));
        hdr.setHeight(mm(heightMm));
        hdr.setzOrder(zOrder++);
        hdr.setOutterMarginLeft(0);
        hdr.setOutterMarginRight(0);
        hdr.setOutterMarginTop(0);
        hdr.setOutterMarginBottom(0);
        hdr.setPreventPageDivide(false);
        hdr.getExplanation().setBytes(null);

        ShapeComponentNormal sc = (ShapeComponentNormal) rectangle.getShapeComponent();
        sc.getProperty().setRotateWithImage(true);
        sc.setOffsetX(0);
        sc.setOffsetY(0);
        sc.setGroupingCount(0);
        sc.setLocalFileVersion(1);
        sc.setWidthAtCreate((int) mm(widthMm));
        sc.setHeightAtCreate((int) mm(heightMm));
        sc.setWidthAtCurrent((int) mm(widthMm));
        sc.setHeightAtCurrent((int) mm(heightMm));
        sc.setRotateAngle(0);
        sc.setRotateXCenter((int) mm(widthMm / 2.0));
        sc.setRotateYCenter((int) mm(heightMm / 2.0));

        sc.createLineInfo();
        LineInfo li = sc.getLineInfo();
        li.getProperty().setLineEndShape(LineEndShape.Flat);
        li.getProperty().setStartArrowShape(LineArrowShape.None);
        li.getProperty().setStartArrowSize(LineArrowSize.MiddleMiddle);
        li.getProperty().setEndArrowShape(LineArrowShape.None);
        li.getProperty().setEndArrowSize(LineArrowSize.MiddleMiddle);
        li.getProperty().setFillStartArrow(true);
        li.getProperty().setFillEndArrow(true);
        li.getProperty().setLineType(LineType.None);
        li.setOutlineStyle(OutlineStyle.Normal);
        li.setThickness(0);
        li.getColor().setValue(0);

        sc.createFillInfo();
        sc.getFillInfo().getType().setPatternFill(false);
        sc.getFillInfo().getType().setImageFill(true);
        sc.getFillInfo().getType().setGradientFill(false);
        sc.getFillInfo().createImageFill();
        ImageFill img = sc.getFillInfo().getImageFill();
        img.setImageFillType(ImageFillType.FitSize);
        img.getPictureInfo().setBrightness((byte) 0);
        img.getPictureInfo().setContrast((byte) 0);
        img.getPictureInfo().setEffect(PictureEffect.RealPicture);
        img.getPictureInfo().setBinItemID(binId);

        sc.createShadowInfo();
        ShadowInfo si = sc.getShadowInfo();
        si.setType(ShadowType.None);
        si.getColor().setValue(0xc4c4c4);
        si.setOffsetX(283);
        si.setOffsetY(283);
        si.setTransparent((short) 0);
        sc.setMatrixsNormal();

        ShapeComponentRectangle scr = rectangle.getShapeComponentRectangle();
        scr.setRoundRate((byte) 0);
        scr.setX1(0);
        scr.setY1(0);
        scr.setX2((int) mm(widthMm));
        scr.setY2(0);
        scr.setX3((int) mm(widthMm));
        scr.setY3((int) mm(heightMm));
        scr.setX4(0);
        scr.setY4((int) mm(heightMm));

        advance(heightMm + 2, pageBreak);
    }

    private int embed(String path, String ext) throws IOException {
        streamIndex = hwp.getBinData().getEmbeddedBinaryDataList().size() + 1;
        String streamName = "Bin" + String.format("%04X", streamIndex) + "." + ext;
        byte[] bytes = readAll(path);
        hwp.getBinData().addNewEmbeddedBinaryData(streamName, bytes, BinDataCompress.ByStorageDefault);
        BinData bd = new BinData();
        bd.getProperty().setType(BinDataType.Embedding);
        bd.getProperty().setCompress(BinDataCompress.ByStorageDefault);
        bd.getProperty().setState(BinDataState.NotAccess);
        bd.setBinDataID(streamIndex);
        bd.setExtensionForEmbedding(ext);
        hwp.getDocInfo().getBinDataList().add(bd);
        return hwp.getDocInfo().getBinDataList().size();
    }

    private static byte[] readAll(String path) throws IOException {
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

    private void header(Paragraph p, int paraShapeId, boolean pageBreak) {
        ParaHeader ph = p.getHeader();
        ph.setLastInList(true);
        ph.setParaShapeId(paraShapeId);
        ph.setStyleId((short) 0);
        ph.getDivideSort().setDivideSection(false);
        ph.getDivideSort().setDivideMultiColumn(false);
        ph.getDivideSort().setDividePage(pageBreak);
        ph.getDivideSort().setDivideColumn(false);
        ph.setCharShapeCount(1);
        ph.setRangeTagCount(0);
        ph.setLineAlignCount(1);
        ph.setInstanceID(0);
        ph.setIsMergedByTrack(0);
    }

    private void lineSeg(Paragraph p, List<Integer> starts, int charCount, int fontPt, double widthMm) {
        p.createLineSeg();
        ParaLineSeg pls = p.getLineSeg();
        int lineH = fontPt * 120;
        for (int i = 0; i < starts.size(); i++) {
            LineSegItem lsi = pls.addNewLineSegItem();
            lsi.setTextStartPosition(starts.get(i));
            lsi.setLineVerticalPosition(i * lineH);
            lsi.setLineHeight(lineH);
            lsi.setTextPartHeight(lineH);
            lsi.setDistanceBaseLineToLineVerticalPosition((int) (lineH * 0.85));
            lsi.setLineSpace(fontPt * 20);
            lsi.setStartPositionFromColumn(0);
            lsi.setSegmentWidth((int) mm(widthMm));
            lsi.getTag().setFirstSegmentAtLine(true);
            lsi.getTag().setLastSegmentAtLine(true);
        }
        if (starts.isEmpty()) {
            LineSegItem lsi = pls.addNewLineSegItem();
            lsi.setTextStartPosition(0);
            lsi.setLineHeight(lineH);
            lsi.setTextPartHeight(lineH);
            lsi.setSegmentWidth((int) mm(widthMm));
            lsi.getTag().setFirstSegmentAtLine(true);
            lsi.getTag().setLastSegmentAtLine(true);
        }
    }

    private static List<Integer> single(int start) {
        List<Integer> starts = new ArrayList<Integer>();
        starts.add(start);
        return starts;
    }

    private static List<Integer> lineStarts(String text, double widthMm, double fontPt) {
        List<Integer> starts = new ArrayList<Integer>();
        starts.add(0);
        if (text == null || text.isEmpty()) {
            return starts;
        }
        double em = fontPt * 25.4 / 72.0;
        double width = 0;
        int lineStart = 0;
        int lastSpace = -1;
        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);
            double cw = ch < 128 ? em * 0.55 : em;
            if (width + cw > widthMm && i > lineStart) {
                int breakAt = lastSpace >= lineStart ? lastSpace + 1 : i;
                if (breakAt <= lineStart) {
                    breakAt = i;
                }
                starts.add(breakAt);
                lineStart = breakAt;
                lastSpace = -1;
                width = 0;
                i = breakAt - 1;
                continue;
            }
            width += cw;
            if (ch == ' ') {
                lastSpace = i;
            }
        }
        return starts;
    }

    private void advance(double heightMm, boolean pageBreak) {
        if (pageBreak || cursorY + heightMm > CONTENT_H) {
            cursorY = heightMm;
        } else {
            cursorY += heightMm;
        }
    }

    private static double paraHeight(String text, int fontPt, int beforePt, int afterPt, double widthMm) {
        int lines = lineStarts(text, widthMm, fontPt).size();
        double lineMm = fontPt * 1.2 * 25.4 / 72.0;
        return beforePt * 25.4 / 72.0 + lines * lineMm + afterPt * 25.4 / 72.0;
    }

    private int charShape(int pt, boolean bold, int r, int g, int b) {
        CharShape cs = hwp.getDocInfo().addNewCharShape();
        cs.getFaceNameIds().setForAll(0);
        cs.getRatios().setForAll((short) 100);
        cs.getCharSpaces().setForAll((byte) 0);
        cs.getRelativeSizes().setForAll((short) 100);
        cs.getCharOffsets().setForAll((byte) 0);
        cs.setBaseSize(pt * 100);
        cs.getProperty().setItalic(false);
        cs.getProperty().setBold(bold);
        cs.getProperty().setUnderLineSort(UnderLineSort.None);
        cs.getProperty().setUnderLineShape(BorderType2.Solid);
        cs.getProperty().setOutterLineSort(OutterLineSort.None);
        cs.getProperty().setShadowSort(ShadowSort.None);
        cs.getProperty().setEmboss(false);
        cs.getProperty().setEngrave(false);
        cs.getProperty().setSuperScript(false);
        cs.getProperty().setSubScript(false);
        cs.getProperty().setStrikeLine(false);
        cs.getProperty().setEmphasisSort(EmphasisSort.None);
        cs.getProperty().setUsingSpaceAppropriateForFont(false);
        cs.getProperty().setStrikeLineShape(BorderType2.Solid);
        cs.getProperty().setKerning(false);
        cs.setShadowGap1((byte) 10);
        cs.setShadowGap2((byte) 10);
        cs.getCharColor().setR((short) r);
        cs.getCharColor().setG((short) g);
        cs.getCharColor().setB((short) b);
        cs.getUnderLineColor().setValue(0);
        cs.getShadeColor().setValue(-1);
        cs.getShadowColor().setValue(11711154);
        cs.getStrikeLineColor().setValue(0);
        cs.setBorderFillId(2);
        return hwp.getDocInfo().getCharShapeList().size() - 1;
    }

    private int paraShape(Alignment alignment, int beforePt, int afterPt, int linePercent, boolean keepWithNext) {
        ParaShape src = hwp.getDocInfo().getParaShapeList().get(0);
        ParaShape ps = hwp.getDocInfo().addNewParaShape();
        ps.getProperty1().setValue(src.getProperty1().getValue());
        ps.getProperty1().setAlignment(alignment);
        ps.getProperty1().setTogetherNextPara(keepWithNext);
        ps.setLeftMargin(0);
        ps.setRightMargin(0);
        ps.setIndent(0);
        ps.setTopParaSpace(beforePt * 100);
        ps.setBottomParaSpace(afterPt * 100);
        ps.setLineSpace(linePercent);
        ps.setTabDefId(0);
        ps.setParaHeadId(0);
        ps.setBorderFillId(2);
        ps.setLeftBorderSpace((short) 0);
        ps.setRightBorderSpace((short) 0);
        ps.setTopBorderSpace((short) 0);
        ps.setBottomBorderSpace((short) 0);
        ps.getProperty2().setValue(0);
        ps.getProperty3().setValue(0);
        ps.setLineSpace2(linePercent);
        ps.setParaLevel(ps.getProperty1().getParaLevel());
        return hwp.getDocInfo().getParaShapeList().size() - 1;
    }

    private int border(boolean line, boolean headerFill) {
        BorderFill bf = hwp.getDocInfo().addNewBorderFill();
        bf.getProperty().set3DEffect(false);
        bf.getProperty().setShadowEffect(false);
        bf.getProperty().setSlashDiagonalShape(SlashDiagonalShape.None);
        bf.getProperty().setBackSlashDiagonalShape(BackSlashDiagonalShape.None);
        BorderType type = line ? BorderType.Solid : BorderType.None;
        BorderThickness thickness = BorderThickness.MM0_12;
        bf.getLeftBorder().setType(type);
        bf.getLeftBorder().setThickness(thickness);
        bf.getLeftBorder().getColor().setValue(0);
        bf.getRightBorder().setType(type);
        bf.getRightBorder().setThickness(thickness);
        bf.getRightBorder().getColor().setValue(0);
        bf.getTopBorder().setType(type);
        bf.getTopBorder().setThickness(thickness);
        bf.getTopBorder().getColor().setValue(0);
        bf.getBottomBorder().setType(type);
        bf.getBottomBorder().setThickness(thickness);
        bf.getBottomBorder().getColor().setValue(0);
        bf.getDiagonalBorder().setType(BorderType.None);
        bf.getDiagonalBorder().setThickness(thickness);
        bf.getDiagonalBorder().getColor().setValue(0);
        bf.getFillInfo().getType().setPatternFill(true);
        bf.getFillInfo().createPatternFill();
        PatternFill pf = bf.getFillInfo().getPatternFill();
        pf.setPatternType(PatternType.None);
        if (headerFill) {
            pf.getBackColor().setR((short) 0xE8);
            pf.getBackColor().setG((short) 0xEE);
            pf.getBackColor().setB((short) 0xF4);
        } else {
            pf.getBackColor().setValue(-1);
        }
        pf.getPatternColor().setValue(0);
        return hwp.getDocInfo().getBorderFillList().size();
    }

    private int fontPtOf(int charShapeId) {
        return hwp.getDocInfo().getCharShapeList().get(charShapeId).getBaseSize() / 100;
    }

    private int beforePt(int paraShapeId) {
        return hwp.getDocInfo().getParaShapeList().get(paraShapeId).getTopParaSpace() / 100;
    }

    private int afterPt(int paraShapeId) {
        return hwp.getDocInfo().getParaShapeList().get(paraShapeId).getBottomParaSpace() / 100;
    }

    private static long mm(double value) {
        return (long) (value * 72000.0 / 254.0 + 0.5);
    }
}
