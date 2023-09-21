"use client";
import { useSearchParams } from "next/navigation";
import PDFViewer from "../components/PDFViewer";

export default function Page() {
  const searchParams = useSearchParams();
  const page = searchParams.get("page");

  return (
    <div>
      <PDFViewer
        url="/bucket/bible.pdf"
        page={page ? parseInt(page as string, 10) : 0}
      />
    </div>
  );
}
