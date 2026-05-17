import { NextRequest, NextResponse } from "next/server";
import { generateCommentsBatch } from "@/lib/ai";
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
    
    const allPreviewData: Record<string, any[]> = {};

    // Loop through all sheets in the workbook
    for (const worksheet of workbook.worksheets) {
      if (worksheet.name === 'HuongDan' || worksheet.name === 'GIOI_TINH') continue;
      
      const subject = worksheet.name;
      const studentsToProcess = [];
      const sheetPreviewResults = [];
      const rowMapping: Record<string, number> = {};

      // Gather students
      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        const studentName = row.getCell(3).text;
        if (!studentName) continue;

        const level = row.getCell(5).text;
        const scoreText = row.getCell(6).text;
        const score = scoreText ? parseFloat(scoreText) : undefined;
        
        const id = i.toString(); // Use row number as unique ID
        rowMapping[id] = i;

        studentsToProcess.push({ id, name: studentName, level, score });
      }

      if (studentsToProcess.length === 0) continue;

      // To avoid huge prompts, chunk students into batches of 30
      const chunkSize = 30;
      for (let i = 0; i < studentsToProcess.length; i += chunkSize) {
        const chunk = studentsToProcess.slice(i, i + chunkSize);
        
        try {
          const aiComments = await generateCommentsBatch({ 
             students: chunk, 
             subject, 
             revisionPrompt 
          });
          
          // Collect Preview Results
          for (const student of chunk) {
            const matchedComment = aiComments.find((c: any) => c.id === student.id);
            if (matchedComment && matchedComment.comment) {
               sheetPreviewResults.push({
                 stt: student.id,
                 studentName: student.name,
                 level: student.level,
                 score: student.score,
                 comment: matchedComment.comment
               });
            }
          }
        } catch (error) {
          console.error(`Error processing batch for sheet ${subject}:`, error);
          // Continue with next chunk even if one fails
        }
      }
      
      if (sheetPreviewResults.length > 0) {
         allPreviewData[subject] = sheetPreviewResults;
      }
    }

    return NextResponse.json({ success: true, previewData: allPreviewData });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
