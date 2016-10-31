import { Injectable } from "@angular/core";

import { Config } from "ionic-angular";
import { Globalization } from "ionic-native";
import { TranslateService } from "ng2-translate/ng2-translate";

import { Settings } from "./settings";

import moment from "moment";
import "moment/src/locale/fr";
import "moment/src/locale/en-ca";
import "moment/src/locale/es";


@Injectable()
export class Language {
  public currentLang: string;

  constructor(
    public config: Config,
    public translate: TranslateService,
    public settings: Settings,
  ) {}

  init() {
    this.translate.setDefaultLang("en");
    this.determineLang().then(lang => {
      this.translate.use(lang);
      this.translate.get("BACK_BUTTON").subscribe(back => {
        this.config.set("ios", "backButtonText", back);
      });

      moment.locale(lang);
      this.currentLang = lang;
    });
  }

  determineLang(): Promise<string> {
    return new Promise(resolve => {
      this.settings.getAsync("overideLang").then(overideLang => {
        if (overideLang == "") {
          Globalization.getPreferredLanguage().then(lang => {
            resolve(lang.value.split("-")[0]);
          }).catch(err => {
            resolve("fr");
          });
        }else {
          resolve(overideLang);
        }
      });
    });
  }

  getMoment() {
    return moment;
  }

  change(lang: string) {
    this.settings.set("overideLang", lang);
    this.init();
  }

  current(): string {
    return this.currentLang;
  }
}
