import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import PDFPreview from "./pdf-preview";
import { Tooltip } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const PDFThumbnail = ({ url }: { url: string }) => {
  const [open, setOpen] = useState(false);

  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative h-[100px] flex items-center justify-center bg-tm-gray-200 rounded-md overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Tooltip label="Lihat pratinjau PDF" withArrow>
        <Document
          file={url}
          className="flex justify-center p-1 bg-tm-gray-200 rounded-md cursor-pointer"
          error={<p>No PDF file Found!</p>}
          onClick={() => {
            setOpen(!open);
            setHovered(false);
          }}
        >
          {hovered ? (
            <div
              onClick={() => {
                setOpen(true);
                setHovered(false);
              }}
              className="cursor-pointer"
            >
              <IconEye size={24} color="gray" />
            </div>
          ) : (
            <Page pageNumber={1} width={60} renderMode="canvas" />
          )}
        </Document>
      </Tooltip>
      <PDFPreview opened={open} url={url} />
    </div>
  );
};

export default PDFThumbnail;
