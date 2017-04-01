import { StatusBar } from "@ionic-native/status-bar";

export default class StatusBarMock extends StatusBar {
  styleDefault() {
    console.info("StatusBar: styleDefault");
  }
}
