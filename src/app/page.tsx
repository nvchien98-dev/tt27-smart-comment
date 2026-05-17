"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, any[]> | null>(null);
  const [revisionPrompt, setRevisionPrompt] = useState("");
  const [activeSheet, setActiveSheet] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) {
      alert("Vui lòng chọn file trước!");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (revisionPrompt) {
        formData.append("revisionPrompt", revisionPrompt);
      }

      const response = await fetch("/api/generate-comments", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data.previewData);
        if (data.previewData) {
           const sheets = Object.keys(data.previewData);
           if (sheets.length > 0) setActiveSheet(sheets[0]);
        }
      } else {
        const errorData = await response.json();
        alert("Lỗi: " + errorData.error);
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi gọi API!");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!file || !previewData) return;
    
    setDownloading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("previewData", JSON.stringify(previewData));

      const response = await fetch("/api/download-excel", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "KetQua_NhanXet_" + file.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        const errorData = await response.json();
        alert("Lỗi khi tải file: " + errorData.error);
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi tải file!");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans relative">
      <div className="absolute top-4 right-8 text-sm font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-full border shadow-sm">
        Được tạo bởi <span className="text-blue-600">C-SEED ACADEMY</span>
      </div>
      
      <div className="max-w-5xl mx-auto space-y-8 mt-4">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">TT27 Smart Comment</h1>
          <p className="text-slate-500 text-lg">Trợ lý AI sinh nhận xét học bạ tiểu học chuẩn Thông tư 27</p>
        </div>

        <Tabs defaultValue="module1" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="module1">1. Đánh giá Môn học</TabsTrigger>
            <TabsTrigger value="module2">2. Năng lực & Phẩm chất</TabsTrigger>
            <TabsTrigger value="module3">3. Tổng hợp Học bạ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="module1" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Nhận xét Điểm Môn Học</CardTitle>
                <CardDescription>
                  Tải lên file điểm (Toán, Tiếng Việt...) để AI tự động sinh nhận xét cho từng học sinh.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="file-upload">File Excel mẫu</Label>
                  <Input id="file-upload" type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleProcess} disabled={loading || !file} variant={previewData ? "outline" : "default"}>
                    {loading ? "Đang xử lý AI..." : (previewData ? "Chạy Lại AI" : "Sinh Nhận Xét Tự Động")}
                  </Button>
                  {previewData && (
                     <Button onClick={handleDownload} disabled={downloading} className="bg-green-600 hover:bg-green-700 text-white">
                       {downloading ? "Đang tạo Excel..." : "Tải Xuống File Excel"}
                     </Button>
                  )}
                </div>

                {previewData && (
                  <div className="mt-8 space-y-6">
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                       <Label className="text-blue-800 font-semibold mb-2 block">AI chưa xưng hô đúng ý? Yêu cầu sửa lại toàn bộ:</Label>
                       <div className="flex gap-2">
                         <Textarea 
                            placeholder="Ví dụ: Viết ngắn gọn hơn, không quá 1 câu. Hoặc: Thêm từ 'Rất đáng khen' cho các em học sinh điểm 10..." 
                            value={revisionPrompt}
                            onChange={(e) => setRevisionPrompt(e.target.value)}
                            className="bg-white"
                         />
                         <Button onClick={handleProcess} disabled={loading} className="whitespace-nowrap h-auto">
                           Bảo AI sửa lại
                         </Button>
                       </div>
                    </div>

                    <div className="border rounded-md">
                       <div className="flex bg-slate-100 overflow-x-auto p-1 border-b">
                         {Object.keys(previewData).map(sheet => (
                            <button
                               key={sheet}
                               onClick={() => setActiveSheet(sheet)}
                               className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeSheet === sheet ? 'bg-white border border-b-0 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`}
                            >
                               {sheet}
                            </button>
                         ))}
                       </div>
                       
                       <div className="p-0 overflow-x-auto max-h-[500px] overflow-y-auto">
                          <table className="w-full text-sm text-left relative">
                            <thead className="bg-slate-50 text-slate-700 sticky top-0 shadow-sm">
                              <tr>
                                <th className="px-4 py-3 border-b">STT</th>
                                <th className="px-4 py-3 border-b">Họ Tên</th>
                                <th className="px-4 py-3 border-b">Điểm/Mức</th>
                                <th className="px-4 py-3 border-b w-1/2">Nhận Xét (Preview)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeSheet && previewData[activeSheet]?.map((r: any, i: number) => (
                                <tr key={i} className="border-b hover:bg-slate-50">
                                  <td className="px-4 py-3 font-medium text-slate-500">{r.stt}</td>
                                  <td className="px-4 py-3 font-medium">{r.studentName}</td>
                                  <td className="px-4 py-3 text-slate-600">
                                    {r.score !== undefined ? `${r.score}đ` : r.level}
                                  </td>
                                  <td className="px-4 py-3 text-green-700 italic">{r.comment}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                       </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="module2" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Nhận xét Năng lực & Phẩm chất</CardTitle>
                <CardDescription>Tính năng đang được phát triển.</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="module3" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Tổng hợp Học bạ (GVCN)</CardTitle>
                <CardDescription>Tính năng đang được phát triển.</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
