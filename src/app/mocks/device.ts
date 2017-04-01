import { Device } from "@ionic-native/device";

export default class DeviceMock extends Device {
  get platform() {
    console.info("Device: platform");
    return "iOS";
  }

  get model() {
    console.info("Device: model");
    return "iPhone7,1";
  }

  get version() {
    console.info("Device: version");
    return "10.3";
  }

  get manufacturer() {
    console.info("Device: manufacturer");
    return "Apple";
  }

  get cordova() {
    console.info("Device: cordova");
    return "4.1.0";
  }
}
