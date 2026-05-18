import { NextRequest, NextResponse } from "next/server";
import { generateNLPCBatch } from "@/lib/ai";
import ExcelJS from "exceljs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const revisionPrompt = formData.get("revisionPrompt") as string || "";
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read the Excel file
    const arrayBuffer = await file.arrayBuffer();
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    
    let worksheet = workbook.worksheets[0];
    if (worksheet.name === 'HuongDan') {
      if (workbook.worksheets.length > 1) {
         worksheet = workbook.worksheets[1];
      }
    }

    const studentsToProcess = [];
    const sheetPreviewResults = [];
    const rowMapping: Record<string, number> = {};

    // Gather students. In the NLPC file, data usually starts around row 3
    for (let i = 3; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const studentName = row.getCell(3).text;
      if (!studentName) continue; // Skip empty rows

      // NLC (Tự chủ, Giao tiếp, Giải quyết vấn đề) - Columns 5, 6, 7
      const nlc = [row.getCell(5).text, row.getCell(6).text, row.getCell(7).text].filter(Boolean);
      
      // NLĐT (Ngôn ngữ, Tính toán, Khoa học, Công nghệ, Tin học, Thẩm mĩ, Thể chất) - Columns 8 to 14
      const nldt = [];
      for (let c = 8; c <= 14; c++) {
         const val = row.getCell(c).text;
         if (val) nldt.push(val);
      }

      // PC (Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm) - Columns 15 to 19
      const pc = [];
      for (let c = 15; c <= 19; c++) {
         const val = row.getCell(c).text;
         if (val) pc.push(val);
      }
      
      const id = i.toString(); // Use row number as unique ID
      rowMapping[id] = i;

      studentsToProcess.push({ id, name: studentName, nlc, nldt, pc });
    }

    if (studentsToProcess.length === 0) {
       return NextResponse.json({ error: "Không tìm thấy dữ liệu học sinh hợp lệ" }, { status: 400 });
    }

    // Process in batches
    const chunkSize = 20; // smaller chunk for NLPC as it generates more text
    for (let i = 0; i < studentsToProcess.length; i += chunkSize) {
      const chunk = studentsToProcess.slice(i, i + chunkSize);
      
      try {
        const aiComments = await generateNLPCBatch({ 
           students: chunk, 
           revisionPrompt 
        });
        
        // Collect Preview Results
        for (const student of chunk) {
          const matchedComment = aiComments.find((c: any) => c.id === student.id);
          if (matchedComment) {
             sheetPreviewResults.push({
               stt: student.id, // we use row index as id/stt
               studentName: student.name,
               nhanXetNLC: matchedComment.nhanXetNLC || "",
               nhanXetNLDT: matchedComment.nhanXetNLDT || "",
               nhanXetPC: matchedComment.nhanXetPC || ""
             });
          }
        }
      } catch (error) {
        console.error(`Error processing batch for NLPC:`, error);
      }
    }
    
    // We wrap it in an object like { "Sheet1": results } to be consistent with how UI handles data
    const previewData = {
       [worksheet.name]: sheetPreviewResults
    };

    return NextResponse.json({ success: true, previewData });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
