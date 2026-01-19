import cuid2 from "@paralleldrive/cuid2";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import SignaturePad from "signature_pad";

import type { Point, Props } from "./types";

export const SignatureBoard = forwardRef(
  (
    {
      width = "100%",
      height = "100%",
      options = {
        backgroundColor: "rgb(255,255,255)",
        penColor: "rgb(0, 0, 0)",
      },
      disabled = false,
      clearOnResize = false,
      defaultUrl = "",
      onBeginStroke,
      onEndStroke,
      onBeforeUpdateStroke,
      onAfterUpdateStroke,
    }: Props & {
      onBeginStroke?: () => void;
      onEndStroke?: () => void;
      onBeforeUpdateStroke?: () => void;
      onAfterUpdateStroke?: () => void;
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const signaturePadRef = useRef<SignaturePad>();
    const canvasId = useRef(`canvas${cuid2.createId()}`);

    const isCanvasEmpty = () => {
      return signaturePadRef.current?.isEmpty() ?? true;
    };

    const saveSignature = (format?: string) => {
      return format
        ? signaturePadRef.current?.toDataURL(format)
        : signaturePadRef.current?.toDataURL();
    };

    const clearCanvas = () => {
      signaturePadRef.current?.clear();
    };

    const fromDataURL = (url: string) => {
      signaturePadRef.current?.fromDataURL(url);
    };

    const undo = () => {
      const data = signaturePadRef.current?.toData() as Point[][];
      if (data?.length) {
        data.pop();
        signaturePadRef.current?.fromData(data);
      }
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      saveSignature,
      clearCanvas,
      isCanvasEmpty,
      fromDataURL,
      undo,
    }));

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      let url;
      if (!isCanvasEmpty()) {
        url = saveSignature();
      }

      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const reg = /px/;

      canvas.width =
        width && reg.test(width)
          ? Number.parseInt(width.replace(/px/g, "")) * ratio
          : canvas.offsetWidth * ratio;

      canvas.height =
        height && reg.test(height)
          ? Number.parseInt(height.replace(/px/g, "")) * ratio
          : canvas.offsetHeight * ratio;

      const ctx = canvas.getContext("2d");
      ctx?.scale(ratio, ratio);

      clearCanvas();
      if (!clearOnResize && url) {
        fromDataURL(url);
      }
    };

    const initSignaturePad = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      signaturePadRef.current = new SignaturePad(canvas, {
        backgroundColor: options.backgroundColor,
        penColor: options.penColor,
        ...options,
      });

      if (onBeginStroke) {
        signaturePadRef.current.addEventListener("beginStroke", onBeginStroke);
      }
      if (onEndStroke) {
        signaturePadRef.current.addEventListener("endStroke", onEndStroke);
      }
      if (onBeforeUpdateStroke) {
        signaturePadRef.current.addEventListener(
          "beforeUpdateStroke",
          onBeforeUpdateStroke,
        );
      }
      if (onAfterUpdateStroke) {
        signaturePadRef.current.addEventListener(
          "afterUpdateStroke",
          onAfterUpdateStroke,
        );
      }

      resizeCanvas();

      if (defaultUrl) {
        fromDataURL(defaultUrl);
      }

      if (disabled) {
        signaturePadRef.current.off();
      }
    };

    useEffect(() => {
      initSignaturePad();

      const handleResize = () => resizeCanvas();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);

    useEffect(() => {
      if (signaturePadRef.current && options.penColor) {
        signaturePadRef.current.penColor = options.penColor;
      }
    }, [options.penColor]);

    useEffect(() => {
      if (!signaturePadRef.current) return;

      if (disabled) {
        signaturePadRef.current.off();
      } else {
        signaturePadRef.current.on();
      }
    }, [disabled]);

    return (
      <div
        style={{ width, height }}
        className="border-dashed border-2 border-[var(--mantine-color-dark-6)] rounded-2xl"
        onTouchMove={(e) => e.preventDefault()}
      >
        <canvas
          ref={canvasRef}
          id={canvasId.current}
          style={{ width: "100%", height: "100%" }}
          data-uid={canvasId.current}
        />
      </div>
    );
  },
);

SignatureBoard.displayName = "SignatureBoard";

export type SignatureBoardRef = {
  saveSignature: (format?: string) => string | undefined;
  clearCanvas: () => void;
  isCanvasEmpty: () => boolean;
  fromDataURL: (url: string) => void;
  undo: () => void;
};
