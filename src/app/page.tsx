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

  const [file2, setFile2] = useState<File | null>(null);
  const [loading2, setLoading2] = useState(false);
  const [downloading2, setDownloading2] = useState(false);
  const [previewData2, setPreviewData2] = useState<Record<string, any[]> | null>(null);
  const [revisionPrompt2, setRevisionPrompt2] = useState("");
  const [activeSheet2, setActiveSheet2] = useState<string>("");

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

  const handleFileChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile2(e.target.files[0]);
    }
  };

  const handleProcess2 = async () => {
    if (!file2) {
      alert("Vui lòng chọn file trước!");
      return;
    }
    setLoading2(true);
    try {
      const formData = new FormData();
      formData.append("file", file2);
      if (revisionPrompt2) {
        formData.append("revisionPrompt", revisionPrompt2);
      }

      const response = await fetch("/api/generate-nlpc-comments", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewData2(data.previewData);
        if (data.previewData) {
           const sheets = Object.keys(data.previewData);
           if (sheets.length > 0) setActiveSheet2(sheets[0]);
        }
      } else {
        const errorData = await response.json();
        alert("Lỗi: " + errorData.error);
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi gọi API!");
    } finally {
      setLoading2(false);
    }
  };

  const handleDownload2 = async () => {
    if (!file2 || !previewData2) return;
    
    setDownloading2(true);
    try {
      const formData = new FormData();
      formData.append("file", file2);
      formData.append("previewData", JSON.stringify(previewData2));

      const response = await fetch("/api/download-nlpc-excel", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "KetQua_NLPC_" + file2.name;
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
      setDownloading2(false);
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
                <CardDescription>
                  Tải lên file đánh giá Năng lực và Phẩm chất để AI tự động sinh nhận xét.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="file-upload-2">File Excel mẫu</Label>
                  <Input id="file-upload-2" type="file" accept=".xlsx, .xls" onChange={handleFileChange2} />
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleProcess2} disabled={loading2 || !file2} variant={previewData2 ? "outline" : "default"}>
                    {loading2 ? "Đang xử lý AI..." : (previewData2 ? "Chạy Lại AI" : "Sinh Nhận Xét Tự Động")}
                  </Button>
                  {previewData2 && (
                     <Button onClick={handleDownload2} disabled={downloading2} className="bg-green-600 hover:bg-green-700 text-white">
                       {downloading2 ? "Đang tạo Excel..." : "Tải Xuống File Excel"}
                     </Button>
                  )}
                </div>

                {previewData2 && (
                  <div className="mt-8 space-y-6">
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                       <Label className="text-blue-800 font-semibold mb-2 block">AI chưa xưng hô đúng ý? Yêu cầu sửa lại toàn bộ:</Label>
                       <div className="flex gap-2">
                         <Textarea 
                            placeholder="Ví dụ: Viết ngắn gọn hơn, không quá 1 câu. Hoặc: Thêm từ 'Rất đáng khen'..." 
                            value={revisionPrompt2}
                            onChange={(e) => setRevisionPrompt2(e.target.value)}
                            className="bg-white"
                         />
                         <Button onClick={handleProcess2} disabled={loading2} className="whitespace-nowrap h-auto">
                           Bảo AI sửa lại
                         </Button>
                       </div>
                    </div>

                    <div className="border rounded-md">
                       <div className="flex bg-slate-100 overflow-x-auto p-1 border-b">
                         {Object.keys(previewData2).map(sheet => (
                            <button
                               key={sheet}
                               onClick={() => setActiveSheet2(sheet)}
                               className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeSheet2 === sheet ? 'bg-white border border-b-0 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`}
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
                                <th className="px-4 py-3 border-b w-1/4">Nhận Xét NLC</th>
                                <th className="px-4 py-3 border-b w-1/4">Nhận Xét NLĐT</th>
                                <th className="px-4 py-3 border-b w-1/4">Nhận Xét Phẩm Chất</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeSheet2 && previewData2[activeSheet2]?.map((r: any, i: number) => (
                                <tr key={i} className="border-b hover:bg-slate-50">
                                  <td className="px-4 py-3 font-medium text-slate-500">{r.stt}</td>
                                  <td className="px-4 py-3 font-medium">{r.studentName}</td>
                                  <td className="px-4 py-3 text-green-700 italic">{r.nhanXetNLC}</td>
                                  <td className="px-4 py-3 text-blue-700 italic">{r.nhanXetNLDT}</td>
                                  <td className="px-4 py-3 text-purple-700 italic">{r.nhanXetPC}</td>
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
