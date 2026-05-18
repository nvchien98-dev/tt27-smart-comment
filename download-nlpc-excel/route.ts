import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const previewDataStr = formData.get("previewData") as string;
    
    if (!file || !previewDataStr) {
      return NextResponse.json({ error: "Missing file or preview data" }, { status: 400 });
    }

    const previewData = JSON.parse(previewDataStr);
    const arrayBuffer = await file.arrayBuffer();
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    
    // The sheet could be the first one, or we find it by name
    let worksheet = workbook.worksheets[0];
    if (worksheet.name === 'HuongDan') {
      if (workbook.worksheets.length > 1) {
         worksheet = workbook.worksheets[1];
      }
    }
    
    const sheetResults = previewData[worksheet.name];
    
    if (sheetResults) {
      for (const result of sheetResults) {
        const rowIndex = parseInt(result.stt, 10);
        const row = worksheet.getRow(rowIndex);
        
        // Write the comments into the correct columns
        // NLC Nội dung -> Col 21
        // NLĐT Nội dung -> Col 23
        // PC Nội dung -> Col 25
        if (result.nhanXetNLC) {
            row.getCell(21).value = result.nhanXetNLC;
        }
        if (result.nhanXetNLDT) {
            row.getCell(23).value = result.nhanXetNLDT;
        }
        if (result.nhanXetPC) {
            row.getCell(25).value = result.nhanXetPC;
        }
        
        row.commit();
      }
    }

    // Generate output
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="KetQua_${file.name}"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });

  } catch (error: any) {
    console.error("API Error (download-nlpc):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
