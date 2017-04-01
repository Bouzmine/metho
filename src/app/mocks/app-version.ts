import { AppVersion } from "@ionic-native/app-version";

export default class MockAppVersion extends AppVersion {
  getVersionNumber() {
    console.info("AppVersion: getVersionNumber");
    return Promise.resolve("1.1.0");
  }

  getVersionCode() {
    console.info("AppVersion: getVersionCode");
    return Promise.resolve("1");
  }
}
