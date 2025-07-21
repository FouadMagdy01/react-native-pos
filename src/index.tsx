import Pos, {
  type Printer,
  type VersionInfo,
  type TextConfig,
  type FontConfig,
  type PictureConfig,
  type BarcodeConfig,
  type QrConfig,
  type PrintOptions,
} from './NativePos';

// Constants for alignment styles
export const PRINT_ALIGN_STYLE_LEFT = 0x01;
export const PRINT_ALIGN_STYLE_CENTER = 0x02;
export const PRINT_ALIGN_STYLE_RIGHT = 0x04;

// Constants for barcode types
export const BARCODE_TYPE_BARCODE_128 = 0x01;
export const BARCODE_TYPE_PDF417 = 0x02;
export const BARCODE_TYPE_BARCODE_39 = 0x0a;

// SDK Management
export function initPosSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    Pos.initPosSdk(
      () => resolve(),
      (errorCode?: number) =>
        reject(
          new Error(
            `SDK initialization failed${errorCode ? ` with code: ${errorCode}` : ''}`
          )
        )
    );
  });
}

// Printer Status and Info - FIXED: Handle error cases
export function getPrinter(): Printer | null {
  try {
    const result = Pos.getPrinter();
    // Check if result contains error
    if (result && typeof result === 'object' && 'error' in result) {
      console.warn('Printer error:', result.error);
      return null;
    }
    return result;
  } catch (error) {
    console.error('Failed to get printer status:', error);
    return null;
  }
}

export function getPrinterMileage(): number {
  try {
    return Pos.getPrinterMileage();
  } catch (error) {
    console.error('Failed to get printer mileage:', error);
    return 0;
  }
}

export function clearPrinterMileage(): Promise<void> {
  return new Promise((resolve, reject) => {
    Pos.clearPrinterMileage((error?: string) => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve();
      }
    });
  });
}

// Printer Initialization and Configuration
export function initPrinter(): Promise<void> {
  return new Promise((resolve, reject) => {
    Pos.initPrinter((error?: string) => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve();
      }
    });
  });
}

export function setGrayLevel(grayLevel: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (grayLevel < 1 || grayLevel > 5) {
      reject(new Error('Gray level must be between 1 and 5'));
      return;
    }

    Pos.setGrayLevel(grayLevel, (error?: string) => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve();
      }
    });
  });
}

export function setPrintFont(fontConfig: FontConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    Pos.setPrintFont(fontConfig, (error?: string) => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve();
      }
    });
  });
}

export function setLineSpacing(spacing: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (spacing < 0 || spacing > 32) {
      reject(new Error('Line spacing must be between 0 and 32'));
      return;
    }

    Pos.setLineSpacing(spacing, (error?: string) => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve();
      }
    });
  });
}

// Adding Content to Print Buffer
export function addSingleText(textConfig: TextConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!textConfig.text) {
      reject(new Error('Text is required'));
      return;
    }

    Pos.addSingleText(textConfig, (error?: string) => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve();
      }
    });
  });
}

export function addMultiText(textConfigArray: TextConfig[]): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(textConfigArray) || textConfigArray.length === 0) {
      reject(new Error('Text config array is required and must not be empty'));
      return;
    }

    if (textConfigArray.length > 4) {
      reject(new Error('Maximum 4 texts allowed per line'));
      return;
    }

    Pos.addMultiText(textConfigArray, (error?: string) => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve();
      }
    });
  });
}

export function addPicture(pictureConfig: PictureConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!pictureConfig.base64Image) {
      reject(new Error('Base64 image is required'));
      return;
    }

    Pos.addPicture(pictureConfig, (error?: string) => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve();
      }
    });
  });
}

export function addBarCode(barcodeConfig: BarcodeConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!barcodeConfig.data) {
      reject(new Error('Barcode data is required'));
      return;
    }

    if (barcodeConfig.width > 384) {
      reject(new Error('Barcode width cannot exceed 384 dots'));
      return;
    }

    Pos.addBarCode(barcodeConfig, (error?: string) => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve();
      }
    });
  });
}

export function addQrCode(qrConfig: QrConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!qrConfig.data) {
      reject(new Error('QR code data is required'));
      return;
    }

    if (qrConfig.width > 384 || qrConfig.height > 384) {
      reject(new Error('QR code dimensions cannot exceed 384 dots'));
      return;
    }

    Pos.addQrCode(qrConfig, (error?: string) => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve();
      }
    });
  });
}

export function feedPaper(dots: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (dots < 0) {
      reject(new Error('Dots must be a positive number'));
      return;
    }

    Pos.feedPaper(dots, (error?: string) => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve();
      }
    });
  });
}

// Execute Printing
export function startPrinting(): Promise<void> {
  return new Promise(() => {
    Pos.startPrinting();
  });
}

// Device Information - FIXED: Handle error cases
export function getVersionInfo(): VersionInfo | null {
  try {
    const result = Pos.getVersionInfo();
    // Check if result contains error
    if (result && typeof result === 'object' && 'error' in result) {
      console.warn('Version info error:', result.error);
      return null;
    }
    return result;
  } catch (error) {
    console.error('Failed to get version info:', error);
    return null;
  }
}

export function getDeviceSn(): string | null {
  try {
    const result = Pos.getDeviceSn();
    // Check if result contains error
    if (result && result.startsWith('Error:')) {
      console.warn('Device SN error:', result);
      return null;
    }
    return result === 'Unknown' ? null : result;
  } catch (error) {
    console.error('Failed to get device SN:', error);
    return null;
  }
}

// Helper function to create a complete receipt
export async function printReceipt(
  items: Array<{
    text: string;
    align?: number;
    fontSize?: number;
    isBold?: boolean;
  }>,
  options?: {
    grayLevel?: number;
    lineSpacing?: number;
    feedAtEnd?: number;
  }
): Promise<void> {
  try {
    // Initialize printer
    await initPrinter();

    // Set configurations if provided
    if (options?.grayLevel) {
      await setGrayLevel(options.grayLevel);
    }

    if (options?.lineSpacing) {
      await setLineSpacing(options.lineSpacing);
    }

    // Add all text items
    for (const item of items) {
      await addSingleText({
        text: item.text,
        align: item.align || PRINT_ALIGN_STYLE_LEFT,
        fontSize: item.fontSize || 24,
        isBold: item.isBold || false,
      });
    }

    // Feed paper at the end if specified
    if (options?.feedAtEnd) {
      await feedPaper(options.feedAtEnd);
    }

    // Start printing
    await startPrinting();
  } catch (error) {
    throw new Error(`Receipt printing failed: ${error}`);
  }
}

// Export types
export type {
  Printer,
  VersionInfo,
  TextConfig,
  FontConfig,
  PictureConfig,
  BarcodeConfig,
  QrConfig,
  PrintOptions,
};
