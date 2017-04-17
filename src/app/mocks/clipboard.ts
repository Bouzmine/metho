import { Clipboard } from "@ionic-native/clipboard";

export default class ClipboardMock extends Clipboard {
  public payload = "";
  constructor() {
    super();

    document.addEventListener("copy", function listener(e) {
      (e as any).clipboardData.setData("text/plain", this.payload);
      e.preventDefault();
    });
  }

  copy(payload: string): Promise<any> {
    console.info("Clipboard: copy");
    this.payload = payload;
    console.log(payload); // tslint:disable-line
    document.execCommand("copy");
    return new Promise((resolve) => {
      setTimeout(resolve, 250);
    });
  }
}
