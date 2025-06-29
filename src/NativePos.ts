import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type Printer = {
  [key: string]: string | boolean | number;
};

export type VersionInfo = {
  [key: string]: string;
};

export type TextConfig = {
  text: string;
  align?: number;
  fontSize?: number;
  width?: number;
  columnSpacing?: number;
  isBold?: boolean;
  isItalic?: boolean;
  isWithUnderline?: boolean;
  isReverseText?: boolean;
};

export type FontConfig = {
  font?: string;
  systemFont?: string;
  path?: string;
};

export type PictureConfig = {
  align: number;
  base64Image: string;
};

export type BarcodeConfig = {
  type: number;
  width: number;
  height: number;
  data: string;
};

export type QrConfig = {
  width: number;
  height: number;
  data: string;
};

export type PrintOptions = {
  feed_len?: number;
};

export interface Spec extends TurboModule {
  // SDK initialization
  initPosSdk(
    onSuccess: () => void,
    onFailure: (errorCode?: number) => void
  ): void;

  // Printer status and info - FIXED: Removed | null
  getPrinter(): Printer;
  getPrinterMileage(): number;
  clearPrinterMileage(callback: (error?: string) => void): void;

  // Printer initialization and configuration
  initPrinter(callback: (error?: string) => void): void;
  setGrayLevel(grayLevel: number, callback: (error?: string) => void): void;
  setPrintFont(
    fontConfig: FontConfig,
    callback: (error?: string) => void
  ): void;
  setLineSpacing(spacing: number, callback: (error?: string) => void): void;

  // Adding content to print buffer
  addSingleText(
    textConfig: TextConfig,
    callback: (error?: string) => void
  ): void;
  addMultiText(
    textConfigArray: TextConfig[],
    callback: (error?: string) => void
  ): void;
  addPicture(
    pictureConfig: PictureConfig,
    callback: (error?: string) => void
  ): void;
  addBarCode(
    barcodeConfig: BarcodeConfig,
    callback: (error?: string) => void
  ): void;
  addQrCode(qrConfig: QrConfig, callback: (error?: string) => void): void;
  feedPaper(dots: number, callback: (error?: string) => void): void;

  // Execute printing
  startPrinting(
    options?: PrintOptions,
    onSuccess?: () => void,
    onError?: (errorCode: number) => void,
    onFinish?: () => void
  ): void;

  // Device information - FIXED: Removed | null
  getVersionInfo(): VersionInfo;
  getDeviceSn(): string;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Pos');
