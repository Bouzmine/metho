import { Component, NgModule } from "@angular/core";
import { HttpModule, Http } from "@angular/http";

import { Platform, IonicApp, IonicModule } from "ionic-angular";
import { IonicStorageModule } from "@ionic/storage";
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from "ng2-translate/ng2-translate";

import { AdvancedModePage } from "../pages/advanced-mode/advanced-mode";
import { AttributionsPage } from "../pages/attributions/attributions";
import { BoardingScanPage } from "../pages/boarding-scan/boarding-scan";
import { FeedbackPage } from "../pages/feedback/feedback";
import { LicensePage } from "../pages/license/license";
import { PendingsPage } from "../pages/pendings/pendings";
import { ProjectModalPage } from "../pages/project-modal/project-modal";
import { ProjectsPage } from "../pages/projects/projects";
import { ReferenceCardExamplePage } from "../pages/reference-card-example/reference-card-example";
import { ReferencesPage } from "../pages/references/references";
import { ReferencesDetailPage } from "../pages/references-detail/references-detail";
import { ReferencesSubPage } from "../pages/references-sub/references-sub";
import { SettingsPage } from "../pages/settings/settings";
import { SourcePage } from "../pages/source/source";
import { SourceModalArticlePage } from "../pages/source-modal-article/source-modal-article";
import { SourceModalBookPage } from "../pages/source-modal-book/source-modal-book";
import { SourceModalCdPage } from "../pages/source-modal-cd/source-modal-cd";
import { SourceModalInternetPage } from "../pages/source-modal-internet/source-modal-internet";
import { SourceModalInterviewPage } from "../pages/source-modal-interview/source-modal-interview";
import { SourceModalMoviePage } from "../pages/source-modal-movie/source-modal-movie";
import { SourcesPage } from "../pages/sources/sources";
import { TabsPage } from "../pages/tabs/tabs";
import { MyApp } from "./app.component";

import { AdvancedMode } from "../providers/advanced-mode";
import { AppStorage } from "../providers/app-storage";
import { Attributions } from "../providers/attributions";
import { Fetch } from "../providers/fetch";
import { Language } from "../providers/language";
import { Parse } from "../providers/parse";
import { ReactiveHttp } from "../providers/reactive-http";
import { References } from "../providers/references";
import { Report } from "../providers/report";
import { Scan } from "../providers/scan";
import { Settings } from "../providers/settings";
import { TranslatedActionSheetController } from "../providers/translated-action-sheet-controller";
import { TranslatedAlertController } from "../providers/translated-alert-controller";
import { TranslatedToastController } from "../providers/translated-toast-controller";

import { InstantSearchComponent } from "../components/instant-search/instant-search";
import { SliderComponent } from "../components/slider/slider";

import getMockedNativeModules from "./mock-native-modules";
import { AppVersion } from "@ionic-native/app-version";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { Clipboard } from "@ionic-native/clipboard";
import { Device } from "@ionic-native/device";
import { Globalization } from "@ionic-native/globalization";
import { HTTP } from "@ionic-native/http";
import { InAppPurchase } from "@ionic-native/in-app-purchase";
import { Keyboard } from "@ionic-native/keyboard";
import { SafariViewController } from "@ionic-native/safari-view-controller";
import { SocialSharing } from "@ionic-native/social-sharing";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";

export function translateDeps (http: Http) {
  return new TranslateStaticLoader(http, "assets/i18n", ".json");
}

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    AdvancedModePage,
    AttributionsPage,
    BoardingScanPage,
    FeedbackPage,
    LicensePage,
    PendingsPage,
    ProjectModalPage,
    ProjectsPage,
    ReferenceCardExamplePage,
    ReferencesPage,
    ReferencesDetailPage,
    ReferencesSubPage,
    SettingsPage,
    SourcePage,
    SourceModalArticlePage,
    SourceModalBookPage,
    SourceModalCdPage,
    SourceModalInternetPage,
    SourceModalInterviewPage,
    SourceModalMoviePage,
    SourcesPage,
    InstantSearchComponent,
    SliderComponent
  ],
  imports: [
    HttpModule,
    IonicModule.forRoot(MyApp),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: translateDeps,
      deps: [Http]
    }),
    IonicStorageModule.forRoot({
      driverOrder: ["localstorage", "indexeddb", "websql", "sqlite"]
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    AdvancedModePage,
    AttributionsPage,
    BoardingScanPage,
    FeedbackPage,
    LicensePage,
    PendingsPage,
    ProjectModalPage,
    ProjectsPage,
    ReferenceCardExamplePage,
    ReferencesPage,
    ReferencesDetailPage,
    ReferencesSubPage,
    SettingsPage,
    SourcePage,
    SourceModalArticlePage,
    SourceModalBookPage,
    SourceModalCdPage,
    SourceModalInternetPage,
    SourceModalInterviewPage,
    SourceModalMoviePage,
    SourcesPage
  ],
  providers: [
    AppStorage,
    Attributions,
    Parse,
    Fetch,
    References,
    ReactiveHttp,
    Settings,
    Report,
    AdvancedMode,
    Language,
    Scan,
    TranslatedActionSheetController,
    TranslatedAlertController,
    TranslatedToastController,
    // ...getMockedNativeModules(),
    AppVersion,
    BarcodeScanner,
    Clipboard,
    Device,
    Globalization,
    HTTP,
    InAppPurchase,
    Keyboard,
    SafariViewController,
    SocialSharing,
    SplashScreen,
    StatusBar
  ]
})
export class AppModule {}
