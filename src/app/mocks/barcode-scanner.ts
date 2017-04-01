import { BarcodeScanner, BarcodeScannerOptions } from "@ionic-native/barcode-scanner";

export default class BarcodeScannerMock extends BarcodeScanner {
  scan(options: BarcodeScannerOptions): Promise<BarcodeScannerResponse> {
    console.info("BarcodeScanner: scan");
    return Promise.resolve({
      cancelled: false,
      format: "EAN_13",
      text: "9780140385724"
    });
  }
}
