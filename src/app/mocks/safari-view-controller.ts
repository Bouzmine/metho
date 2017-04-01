import { SafariViewController, SafariViewControllerOptions } from "@ionic-native/safari-view-controller";

export default class SafariViewControllerMock extends SafariViewController {
  warmUp(): Promise<any> {
    console.info("SafariViewController: warmUp");
    return Promise.resolve();
  }
  mayLauchUrl(url: string): Promise<any> {
    console.info("SafariViewController: mayLauchUrl");
    return Promise.resolve(url);
  }

  isAvailable(): Promise<boolean> {
    console.info("SafariViewController: isAvailable");
    return Promise.resolve(true);
  }

  show(options?: SafariViewControllerOptions): Promise<any> {
    console.info("SafariViewController: show");
    window.open(options.url, "_blank");
    return Promise.resolve();
  }
}
