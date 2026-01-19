export interface Point {
  x: number;
  y: number;
  time: number;
  color?: string;
  pressure?: number;
}

export interface SignaturePadOptions {
  dotSize?: number;
  minWidth?: number;
  maxWidth?: number;
  throttle?: number;
  backgroundColor?: string;
  penColor?: string;
}

export interface Props {
  width?: string;
  height?: string;
  options?: SignaturePadOptions;
  disabled?: boolean;
  clearOnResize?: boolean;
  defaultUrl?: string;
}
