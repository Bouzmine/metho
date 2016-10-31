import { Component, NgModule } from "@angular/core";
import { HttpModule, Http } from "@angular/http";

import { Platform, IonicApp, IonicModule } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { StatusBar } from "ionic-native";
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from "ng2-translate/ng2-translate";

import { AdvancedModePage } from "../pages/advanced-mode/advanced-mode";
import { AttributionsPage } from "../pages/attributions/attributions";
import { BoardingScanPage } from "../pages/boarding-scan/boarding-scan";
import { FeedbackPage } from "../pages/feedback/feedback";
import { LicensePage } from "../pages/license/license";
import { PendingsPage } from "../pages/pendings/pendings";
import { ProjectModalPage } from "../pages/project-modal/project-modal";
import { ProjectsPage } from "../pages/projects/projects";
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
  imports: [
    HttpModule,
    IonicModule.forRoot(MyApp),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: translateDeps,
      deps: [Http]
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
    Parse,
    Fetch,
    References,
    ReactiveHttp,
    Settings,
    Report,
    AdvancedMode,
    Language,
    Scan,
    Storage,
    TranslatedActionSheetController,
    TranslatedAlertController
  ]
})
export class AppModule {}
