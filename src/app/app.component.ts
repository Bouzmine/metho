import { Component } from "@angular/core";

import { Platform } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { TranslateService } from "@ngx-translate/core";

import { TabsPage } from "../pages/tabs/tabs";

import { AdvancedMode } from "../providers/advanced-mode";
import { AppStorage } from "../providers/app-storage";
import { Attributions } from "../providers/attributions";
import { Language } from "../providers/language";
import { References } from "../providers/references";


@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class MyApp {
  rootPage: Component = TabsPage;

  constructor(
    public platform: Platform,
    public advanced: AdvancedMode,
    public storage: AppStorage,
    public attributions: Attributions,
    public language: Language,
    public references: References,
    public translate: TranslateService,
    public splashscreen: SplashScreen,
    public statusBar: StatusBar,
  ) {
    this.platform.ready().then(() => {
      this.storage.init();
      this.language.init();
      let subscription = this.translate.onLangChange.subscribe(() => {
        subscription.unsubscribe();
        setTimeout(() => {
          this.splashscreen.hide();
          this.statusBar.styleDefault();
          this.references.load();
          this.advanced.init(false);
          this.attributions.load();
        }, 100);
      });
    });
  }
}
