"use client";

import React from "react";
import PDFViewer from "../components/PDFViewer";

export default function Page() {
  return (
    <div>
      <PDFViewer url="/bucket/bible.pdf" page={64} />
    </div>
  );
}
