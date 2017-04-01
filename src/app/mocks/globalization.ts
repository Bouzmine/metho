import { Globalization } from "@ionic-native/globalization";

export default class GlobalizationMock extends Globalization {
  getPreferredLanguage() {
    console.info("Globalization: getPreferredLanguage");
    return Promise.resolve({
      value: "fr-CA"
    });
  }
}
