import { Component } from "@angular/core";

import { Platform } from "ionic-angular";
import { StatusBar, Splashscreen } from "ionic-native";
import { TranslateService } from "ng2-translate/ng2-translate";

import { TabsPage } from "../pages/tabs/tabs";

import { AppStorage } from "../providers/app-storage";
import { Language } from "../providers/language";
import { References } from "../providers/references";


@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class MyApp {
  rootPage: any = TabsPage;

  constructor(
    public platform: Platform,
    public storage: AppStorage,
    public language: Language,
    public references: References,
    public translate: TranslateService,
  ) {
    this.platform.ready().then(() => {
      this.storage.init();
      this.language.init();
      let subscription = this.translate.onLangChange.subscribe(() => {
        subscription.unsubscribe();
        setTimeout(() => {
          Splashscreen.hide();
          StatusBar.styleDefault();
          this.references.load();
        }, 100);
      });
    });
  }
}
