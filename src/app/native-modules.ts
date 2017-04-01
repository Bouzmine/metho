import { AppVersion } from "@ionic-native/app-version";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { Clipboard } from "@ionic-native/clipboard";
import { Device } from "@ionic-native/device";
import { Globalization } from "@ionic-native/globalization";
import { HTTP } from "@ionic-native/http";
import { InAppPurchase } from "@ionic-native/in-app-purchase";
import { Keyboard } from "@ionic-native/keyboard";
import { SafariViewController } from "@ionic-native/safari-view-controller";
import { SocialSharing } from "@ionic-native/social-sharing";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";

import AppVersionMock from "./mocks/app-version";
import BarcodeScannerMock from "./mocks/barcode-scanner";
import ClipboardMock from "./mocks/clipboard";
import DeviceMock from "./mocks/device";
import GlobalizationMock from "./mocks/globalization";
import HTTPMock from "./mocks/http";
import InAppPurchaseMock from "./mocks/in-app-purchases";
import KeyboardMock from "./mocks/keyboard";
import SafariViewControllerMock from "./mocks/safari-view-controller";
import SocialSharingMock from "./mocks/social-sharing";
import SplashScreenMock from "./mocks/splash-screen";
import StatusBarMock from "./mocks/status-bar";

export default function getNativeModules(): any[] {
  if ("cordova" in window) {
    return [
      AppVersion,
      BarcodeScanner,
      Clipboard,
      Device,
      Globalization,
      HTTP,
      InAppPurchase,
      Keyboard,
      SafariViewController,
      SocialSharing,
      SplashScreen,
      StatusBar
    ];
  }else {
    return [
      { provide: AppVersion, useClass: AppVersionMock },
      { provide: BarcodeScanner, useClass: BarcodeScannerMock },
      { provide: Clipboard, useClass: ClipboardMock },
      { provide: Device, useClass: DeviceMock },
      { provide: Globalization, useClass: GlobalizationMock },
      { provide: HTTP, useClass: HTTPMock },
      { provide: InAppPurchase, useClass: InAppPurchaseMock },
      { provide: Keyboard, useClass: KeyboardMock },
      { provide: SafariViewController, useClass: SafariViewControllerMock },
      { provide: SocialSharing, useClass: SocialSharingMock },
      { provide: SplashScreen, useClass: SplashScreenMock },
      { provide: StatusBar, useClass: StatusBarMock }
    ];
  }
}
