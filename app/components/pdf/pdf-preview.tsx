import { Button, FocusTrap, Modal, ScrollArea, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type Props = {
  opened: boolean;
  url: string;
};

const PDFPreview = ({ opened, url }: Props) => {
  const [openedState, setOpenedState] = useState(opened);

  useEffect(() => {
    setOpenedState(opened);
  }, [opened]);

  const close = () => {
    setOpenedState(!opened);
  };

  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }
  /* const urlFile = `/api/proxy-pdf?url=${encodeURIComponent(url)}`; */

  return (
    <Modal.Root
      opened={openedState}
      closeOnClickOutside={false}
      size="xl"
      onClose={close}
      centered
      padding={0}
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <FocusTrap.InitialFocus />
      <Modal.Overlay backgroundOpacity={0.55} blur={3} />
      <Modal.Content radius="lg">
        <Modal.Header className="px-5">
          <Modal.Title>
            <Text className="font-semibold">Pratinjau Dokumen</Text>
          </Modal.Title>
          <Modal.CloseButton className="bg-tm-gray-200 text-tm-dark-500" />
        </Modal.Header>
        <Modal.Body className="bg-tm-gray-300">
          <div className="p-4">
            <Document
              file={url}
              className="flex justify-center p-1"
              onLoadSuccess={onDocumentLoadSuccess}
            >
              <Page pageNumber={pageNumber} />
            </Document>
          </div>
          <div className="w-full p-6 bg-white text-center">
            <Text className="text-sm font-light">
              <Button
                disabled={pageNumber <= 1}
                onClick={() => pageNumber > 1 && setPageNumber(pageNumber - 1)}
                className="mx-5"
                size="xs"
              >
                <IconChevronLeft />
              </Button>
              Page {pageNumber} of {numPages}{" "}
              <Button
                disabled={pageNumber >= Number(numPages)}
                size="xs"
                onClick={() =>
                  pageNumber < Number(numPages) && setPageNumber(pageNumber + 1)
                }
                className="mx-5"
              >
                <IconChevronRight />
              </Button>
            </Text>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default PDFPreview;
