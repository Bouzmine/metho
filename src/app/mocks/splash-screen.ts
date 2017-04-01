import { SplashScreen } from "@ionic-native/splash-screen";

export default class SplashScreenMock extends SplashScreen {
  show() {
    console.info("SplashScreen shown");
  }

  hide() {
    console.info("SplashScreen hidden");
  }
}
