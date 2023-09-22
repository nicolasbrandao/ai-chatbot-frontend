"use client";

import { pdfjs, Document, Page } from "react-pdf";
// import "react-pdf/dist/esm/Page/AnnotationLayer.css";
// import "react-pdf/dist/esm/Page/TextLayer.css";

import type { PDFDocumentProxy } from "pdfjs-dist";
import { useCallback, useEffect, useRef, useState } from "react";
import { VirtualizerOptions, elementScroll, useVirtualizer } from "@tanstack/react-virtual";
import { useDocument } from "../hooks/useDocument";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url,
).toString();

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

type PDFFile = string | File | null;

function easeInOutQuint(t: number) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
}

export default function PDFViewer({
  url,
}: {
  url: string;
}) {
  const parentRef = useRef<HTMLDivElement>(null)
  const scrollingRef = useRef<number>(null)

  const scrollToFn: VirtualizerOptions<any, any>['scrollToFn'] =
    useCallback((offset, canSmooth, instance) => {
      const duration = 1000
      const start = parentRef.current?.scrollTop ?? 0
      const startTime = (Date.now())

      const run = () => {
        if (scrollingRef.current !== startTime) return
        const now = Date.now()
        const elapsed = now - startTime
        const progress = easeInOutQuint(Math.min(elapsed / duration, 1))
        const interpolated = start + (offset - start) * progress

        if (elapsed < duration) {
          elementScroll(interpolated, canSmooth, instance)
          requestAnimationFrame(run)
        } else {
          elementScroll(interpolated, canSmooth, instance)
        }
      }

      requestAnimationFrame(run)
    }, [])

  const { page } = useDocument()

  const [file, setFile] = useState<PDFFile>(url);
  const [numPages, setNumPages] = useState<number>(1000);

  const rowVirtualizer = useVirtualizer({
    count: numPages,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 500,
    overscan: 5,
    scrollToFn,
  })

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
    rowVirtualizer.scrollToIndex(page);
  }

  useEffect(() => {
    rowVirtualizer.scrollToIndex(page)
    console.log({page})
  }, [page, rowVirtualizer])

  

  return (
         <>
         <button onClick={() => rowVirtualizer.scrollToIndex(10)} >VAI</button>
         <div
           ref={parentRef}
           className="List"
           style={{
             height: `200px`,
             width: `400px`,
             overflow: 'auto',
           }}
         >
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            options={options}
            loading="Loading PDF..."
          >
           <div
             style={{
               height: `${rowVirtualizer.getTotalSize()}px`,
               width: '100%',
               position: 'relative',
             }}
           >
             {rowVirtualizer.getVirtualItems().map((virtualItem) => (
               <div
                 key={virtualItem.index}
                 className={virtualItem.index % 2 ? 'ListItemOdd' : 'ListItemEven'}
                 style={{
                   position: 'absolute',
                   top: 0,
                   left: 0,
                   width: '100%',
                   height: `${virtualItem.size}px`,
                   transform: `translateY(${virtualItem.start}px)`,
                 }}
               >
                  <Page
                    className="border"
                    pageNumber={virtualItem.index + 1}
                    loading="Loading page..."
                    height={500}
                  />
               </div>
             ))}
           </div>
          </Document>
         </div>
       </>

  );
}
