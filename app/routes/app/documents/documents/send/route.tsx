import { Button, Image, Menu, Text, TextInput } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { ClientLoaderFunctionArgs } from "@remix-run/react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCalendar,
  IconChevronDown,
  IconLetterCaseToggle,
  IconMail,
  IconMinusVertical,
  IconRubberStamp,
  IconSettings,
  IconUser,
  IconWritingSign,
  IconX,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import { cacheClientLoader } from "remix-client-cache";

import FilePicker from "~/components/dialog/file-picker";

// NOTE: Type for component props - accepts a PDF URL
type Props = {
  url: string;
};

// NOTE: Required for proper PDF.js worker loading in browser
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// NOTE: Fallback default PDF URL (will override passed `url`)
const PDF_URL =
  "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf";

// NOTE: Stub Remix loader (not used but required for route compliance)
export const loader = ({ request }: LoaderFunctionArgs) => null;

// NOTE: Placeholder error boundary to prevent crashes from unhandled errors
export const ErrorBoundary = () => {};

// NOTE: Remix clientLoader with caching to avoid refetching
export const clientLoader = (args: ClientLoaderFunctionArgs) =>
  cacheClientLoader(args);

// NOTE: Required for hydration of cached client data
clientLoader.hydrate = true;

const files = [
  {
    id: "1",
    name: "ttd1.png",
    url: "https://images.unsplash.com/photo-1749735616508-f20cb451c8bf",
  },
  {
    id: "2",
    name: "ttd2.png",
    url: "https://your-s3-url/ttd2.png",
  },
  {
    id: "3",
    name: "ttd2.png",
    url: "https://your-s3-url/ttd2.png",
  },
  {
    id: "4",
    name: "ttd2.png",
    url: "https://your-s3-url/ttd2.png",
  },
  {
    id: "5",
    name: "ttd2.png",
    url: "https://your-s3-url/ttd2.png",
  },
  {
    id: "6",
    name: "ttd2.png",
    url: "https://your-s3-url/ttd2.png",
  },
  {
    id: "7",
    name: "ttd2.png",
    url: "https://your-s3-url/ttd2.png",
  },
];

type File = {
  id: string;
  name: string;
  url: string;
};

const SendDocumentPage = ({ url }: Props) => {
  // NOTE: Track PDF metadata
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState(1.0); // NOTE: Zoom level (min: 0.8, max: 1.2)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  //NOTE: Drag position
  const [lastDragPosition, setLastDragPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  //NOTE: File picker state
  const [openFilePicker, setOpenFilePicker] = useState(false);

  // NOTE: Zoom in function (max 1.2)
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 1.2));

  // NOTE: Zoom out function (min 0.8)
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.8));

  // NOTE: Ref to scroll current thumbnail into view
  const viewerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // NOTE: When PDF is loaded, set total pages and init thumbnailRefs
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    thumbnailRefs.current = Array(numPages).fill(null);
  };

  // NOTE: Change current visible page
  const goToPage = (page: number) => setPageNumber(page);

  // NOTE: Scroll currently selected thumbnail into view on page change
  useEffect(() => {
    const ref = thumbnailRefs.current[pageNumber - 1];
    if (ref) ref.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [pageNumber]);

  // NOTE: Override url with static PDF URL (development default)
  const fileUrl = `/api/proxy-pdf?url=${encodeURIComponent(url || PDF_URL)}`;

  return (
    <div className="flex-1 w-full overflow-y-hidden">
      <div>
        {/* NOTE: Top bar with navigation & actions */}
        <div className="h-[80px] flex w-full justify-between bg-white items-center px-2">
          {/* Back Button and Title */}
          <div className="inline-flex justify-start gap-2 items-center">
            <Button leftSection={<IconArrowLeft />} variant="default">
              Kembali
            </Button>
            <Text className="font-semibold text-left">
              Surat Keterangan Sehat - 21 Jan 2025
            </Text>
          </div>

          {/* Navigation Buttons and Menu */}
          <div className="inline-flex justify-end gap-2 items-center">
            <Button rightSection={<IconArrowRight />}>Selanjutnya</Button>
            <Menu shadow="md" variant="default" width={200}>
              <Menu.Target>
                <Button variant="default" rightSection={<IconChevronDown />}>
                  Lainnya
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Application</Menu.Label>
                <Menu.Item leftSection={<IconSettings size={14} />}>
                  Settings
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>

        <div style={{ display: "flex", height: "100vh", width: "100%" }}>
          {/* === Sidebar Thumbnail (Left) === */}
          <div className="w-[220px] overflow-y-auto border-r py-6 border-gray-200 bg-tm-gray-100 text-center flex-shrink-0">
            <Text className="font-semibold text-left px-5 mb-3 text-sm">
              Surat Keterangan Sehat - 21 Jan 2025
            </Text>
            <Text className="text-tm-dark-300 font-normal px-5 mb-3 text-xs text-left">
              {numPages} Halaman
            </Text>

            {/* PDF Thumbnail View */}
            <Document file={fileUrl}>
              {numPages ? (
                Array.from({ length: numPages }, (_, index) => (
                  <div
                    key={`thumbnail-${index + 1}`}
                    className={`p-4 inline-flex justify-center w-full gap-5 ${index + 1 === pageNumber ? "bg-tm-blue-100 border-r-2 border-r-tm-blue-600" : ""}`}
                  >
                    <Text size="sm" mt={5}>
                      {index + 1}
                    </Text>
                    <button
                      ref={(ref) => (thumbnailRefs.current[index] = ref)}
                      onClick={() => goToPage(index + 1)}
                      type="button"
                      className={`mb-2 rounded-sm box-border !w-auto shadow-sm transition-all duration-200 ease-in-out
                        ${
                          index + 1 === pageNumber
                            ? "border border-tm-blue-600 bg-tm-blue-100"
                            : "border border-tm-gray-300 bg-white hover:bg-tm-gray-100"
                        }
                        w-full flex flex-col items-center justify-center`}
                      style={{
                        cursor: "pointer",
                        font: "inherit",
                        color: "inherit",
                        padding: "0",
                      }}
                    >
                      {/* NOTE: Render small preview thumbnail */}
                      <Page
                        pageNumber={index + 1}
                        width={130}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                      />
                    </button>
                  </div>
                ))
              ) : (
                <Text size="sm" className="text-tm-gray-700 text-center mt-4">
                  Memuat halaman...
                </Text>
              )}
            </Document>
          </div>

          {/* === Main PDF Viewer (Center) === */}
          <div className="flex-grow flex flex-col relative overflow-hidden items-center">
            <div className="flex-grow p-4 overflow-auto" ref={viewerRef}>
              <Document
                file={fileUrl}
                className="flex justify-center p-1"
                onLoadSuccess={onDocumentLoadSuccess}
              >
                <div className="relative flex overflow-hidden">
                  {selectedFile && (
                    <Rnd
                      className="!inline-flex relative overflow-hidden items-center justify-center border-0 bg-transparent z-10 flex-shrink-0"
                      default={{
                        x: 0,
                        y: 0,
                        width: 150,
                        height: 100,
                      }}
                      enableResizing={{
                        topRight: false, // disable native SE handle
                        topLeft: true,
                        bottomLeft: true,
                        bottomRight: true,
                        left: true,
                        bottom: true,
                        right: true,
                      }}
                      onDragStop={(e, d) => {
                        setLastDragPosition({ x: d.x, y: d.y });
                      }}
                      lockAspectRatio={true}
                      bounds="parent"
                    >
                      <div className="relative w-full h-full">
                        <Image
                          draggable={false}
                          src={selectedFile.url}
                          className="cursor-move absolute aspect-square flex-1 object-contain w-[100%]"
                        />

                        <button
                          onClick={() => {}}
                          className="absolute top-0 right-0 w-5 h-5 bg-tm-red-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-tm-red-700 cursor-pointer"
                        >
                          <IconX size="xs" />
                        </button>
                      </div>
                    </Rnd>
                  )}
                  <Page pageNumber={pageNumber} scale={scale} />
                </div>
              </Document>
            </div>

            {/* === PDF Navigation Controls === */}
            <div className="fixed bottom-5 p-4 bg-tm-dark-700 text-center border-t rounded-full border-transparent z-10">
              <div className="text-sm font-light flex items-center justify-center text-white">
                <span className="px-2">Halaman</span>
                <TextInput
                  size="xs"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(Number(e.currentTarget.value))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const num = Number(e.currentTarget.value);
                      if (!isNaN(num) && num >= 1 && num <= (numPages || 1)) {
                        goToPage(num);
                      }
                    }
                  }}
                  inputSize="xs"
                  className="w-[40px] mx-2 text-center"
                />
                <span className="px-2">dari</span>
                <span className="font-semibold mx-2">{numPages || "--"}</span>
                <IconMinusVertical color="white" />
                <div>
                  {/* Zoom Controls */}
                  <Button
                    onClick={zoomIn}
                    className="mx-2"
                    size="xs"
                    color="white"
                    disabled={scale >= 1.2}
                    variant="transparent"
                  >
                    <IconZoomIn size={20} />
                  </Button>
                  <Button
                    size="xs"
                    onClick={zoomOut}
                    className="mx-2"
                    color="white"
                    disabled={scale <= 0.8}
                    variant="transparent"
                  >
                    <IconZoomOut size={20} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* === Right Sidebar (Future Content/Annotations) === */}
          <div className="w-[220px] overflow-y-auto border-r border-gray-200 bg-tm-gray-100 text-center flex-shrink-0">
            <div className="py-6 px-2">
              <Text className="font-semibold text-left text-sm mb-2">
                Konten
              </Text>
              <div className="bg-white rounded-md flex gap-2 flex-col p-4">
                <Button
                  variant="default"
                  className="font-light"
                  leftSection={<IconWritingSign stroke={1} />}
                  onClick={() => setOpenFilePicker(true)}
                >
                  Tanda Tangan
                </Button>
                <Button
                  variant="default"
                  className="font-light"
                  leftSection={<IconUser stroke={1} />}
                >
                  Nama
                </Button>
                <Button
                  variant="default"
                  className="font-light"
                  leftSection={<IconCalendar stroke={1} />}
                >
                  Tanggal
                </Button>
              </div>
              <div className="border-t border-gray-300 my-4"></div>
              <Text className="font-semibold text-left text-sm mb-2">
                Segera Hadir
              </Text>
              <div className="bg-white rounded-md flex gap-2 flex-col p-4">
                <Button
                  variant="default"
                  className="font-light"
                  leftSection={<IconLetterCaseToggle stroke={1} />}
                >
                  Text
                </Button>
                <Button
                  variant="default"
                  className="font-light"
                  leftSection={<IconMail stroke={1} />}
                >
                  Email
                </Button>
                <Button
                  variant="default"
                  className="font-light"
                  leftSection={<IconRubberStamp stroke={1} />}
                >
                  Stempel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FilePicker
        opened={openFilePicker}
        onClose={() => setOpenFilePicker(false)}
        files={files}
        onSelect={(file) => {
          setSelectedFile(file);
        }}
      />
    </div>
  );
};

export default SendDocumentPage;
