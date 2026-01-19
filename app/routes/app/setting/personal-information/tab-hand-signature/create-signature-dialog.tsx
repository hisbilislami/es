import { Icon } from "@iconify/react/dist/iconify.js";
import { Modal, Button } from "@mantine/core";
import { useRef } from "react";

import { convertBase64ToFile } from "~/utils/string-helper";

import { SignatureBoard, SignatureBoardRef } from "./signature-board";

type CreateSignatureDialogProps = {
  opened: boolean;
  onClose: () => void;
  onSave: (objUrl: string, file: File, base64: string) => void;
};
function CreateSignatureDialog({
  opened,
  onClose,
  onSave,
}: CreateSignatureDialogProps) {
  const signatureBoardRef = useRef<SignatureBoardRef>(null);
  const clearSignatureBoard = () => {
    if (signatureBoardRef.current) {
      signatureBoardRef.current.clearCanvas();
    }
  };

  const handleCloseDialogSignatureBoard = () => {
    clearSignatureBoard();
    onClose();
  };

  const handleSaveSignature = (signature: string) => {
    const { file, blob } = convertBase64ToFile({ base64: signature });
    const objUrl = URL.createObjectURL(blob);

    onSave(objUrl, file, signature);
    onClose();
  };

  const saveSignature = () => {
    if (signatureBoardRef.current) {
      const signature = signatureBoardRef.current.saveSignature();
      if (signature && !signatureBoardRef.current.isCanvasEmpty()) {
        handleSaveSignature(signature);
        clearSignatureBoard();
      }
    }
  };
  return (
    <Modal
      centered
      radius="lg"
      opened={opened}
      onClose={handleCloseDialogSignatureBoard}
      title="Buat Tanda Tangan"
    >
      <SignatureBoard
        ref={signatureBoardRef}
        height="224px"
        options={{
          minWidth: 0.5,
          maxWidth: 2.5,
          penColor: "rgb(0, 0, 0)",
        }}
      />

      <div className="w-full px-2 pb-2 pt-6 flex gap-2 justify-end ">
        <Button
          variant="default"
          leftSection={<Icon icon="tabler:trash" className="h-4 w-4" />}
          className="font-normal"
          onClick={clearSignatureBoard}
        >
          Hapus
        </Button>
        <Button
          leftSection={<Icon icon="tabler:device-floppy" className="h-4 w-4" />}
          className="font-normal"
          onClick={saveSignature}
        >
          Simpan
        </Button>
      </div>
    </Modal>
  );
}

export default CreateSignatureDialog;
