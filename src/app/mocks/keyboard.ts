import { Keyboard } from "@ionic-native/keyboard";

export default class KeyboardMock extends Keyboard {
  close(): Promise<any> {
    console.info("Keyboard: close");
    return Promise.resolve();
  }
}
