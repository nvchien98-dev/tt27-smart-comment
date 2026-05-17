import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const previewDataStr = formData.get("previewData") as string;
    
    if (!file || !previewDataStr) {
      return NextResponse.json({ error: "Thiếu file gốc hoặc dữ liệu nhận xét" }, { status: 400 });
    }

    const previewData = JSON.parse(previewDataStr);

    // Read the Excel file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    
    // Write preview data back to the workbook
    for (const worksheet of workbook.worksheets) {
      const subject = worksheet.name;
      if (worksheet.name === 'HuongDan' || worksheet.name === 'GIOI_TINH') continue;
      
      const sheetData = previewData[subject];
      if (!sheetData) continue;

      // Find which row corresponds to which student by ID (STT or row number)
      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        const studentName = row.getCell(3).text;
        if (!studentName) continue;
        
        const stt = row.getCell(1).text || i.toString();
        
        const matchedComment = sheetData.find((s: any) => s.stt === stt && s.studentName === studentName);
        if (matchedComment && matchedComment.comment) {
          worksheet.getCell(i, 8).value = matchedComment.comment;
        }
      }
    }

    // Write workbook to buffer
    const outBuffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(outBuffer, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="KetQua_NhanXet_Final.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
