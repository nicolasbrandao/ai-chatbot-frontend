import React from "react";
import { useRouter } from "next/router";
import PDFViewer from "../components/PDFViewer";

export default function Page() {
  const router = useRouter();
  const { page } = router.query;

  return (
    <div>
      <PDFViewer
        url="/bucket/bible.pdf"
        page={page ? parseInt(page as string, 10) : 0}
      />
    </div>
  );
}
