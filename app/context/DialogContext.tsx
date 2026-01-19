import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

type DialogType = "success" | "error" | "warning" | "info" | "confirmation";

type DialogState = {
  open: boolean;
  title: string;
  icon?: string;
  type?: DialogType;
  description: string;
  confirmText?: string;
  onConfirm?: () => void;
};

type ShowDialogProps = {
  title: string;
  description: string;
  icon?: string;
  type?: DialogType;
  confirmText?: string;
  onConfirm?: () => void;
};

type DialogContextType = {
  dialog: DialogState | null;
  showDialog: (props: ShowDialogProps) => void;
  closeDialog: () => void;
};

//create context
const DialogContext = createContext<DialogContextType | undefined>(undefined);

//provider component
export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const showDialog = useCallback(
    ({
      title,
      description,
      icon,
      type,
      confirmText = "Okay",
      onConfirm,
    }: ShowDialogProps) => {
      setDialog((prevDialog) => {
        // Prevent updating if the dialog data is the same
        if (
          prevDialog &&
          prevDialog.title === title &&
          prevDialog.description === description &&
          prevDialog.icon === icon &&
          prevDialog.type === type &&
          prevDialog.confirmText === confirmText
        ) {
          return prevDialog; // No update if data is the same
        }

        return {
          open: true,
          title,
          description,
          icon,
          type,
          confirmText,
          onConfirm,
        };
      });
    },
    [],
  );

  const closeDialog = () => {
    setDialog(null);
  };

  return (
    <DialogContext.Provider value={{ dialog, showDialog, closeDialog }}>
      {children}
    </DialogContext.Provider>
  );
}

//custom hook
export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }

  return context;
}
