import { ViewChild, Component } from "@angular/core";

import { NavController, NavParams, ActionSheetController, ModalController, List, Content } from "ionic-angular";
import { SocialSharing } from "ionic-native";
import { TranslateService } from "ng2-translate/ng2-translate";

import { AdvancedModePage } from "../advanced-mode/advanced-mode";
import { SourceModalBookPage } from "../source-modal-book/source-modal-book";
import { SourceModalArticlePage } from "../source-modal-article/source-modal-article";
import { SourceModalInternetPage } from "../source-modal-internet/source-modal-internet";
import { SourceModalCdPage } from "../source-modal-cd/source-modal-cd";
import { SourceModalMoviePage } from "../source-modal-movie/source-modal-movie";
import { SourceModalInterviewPage } from "../source-modal-interview/source-modal-interview";
import { SourcePage } from "../source/source";
import { PendingsPage } from "../pendings/pendings";

import { AppStorage } from "../../providers/app-storage";
import { Settings } from "../../providers/settings";
import { TranslatedAlertController } from "../../providers/translated-alert-controller";


@Component({
  selector: "sources",
  templateUrl: "sources.html"
})
export class SourcesPage {
  public projectId: string;
  public sources: Source[] = [];
  public project: Project = {name: "", matter: ""};
  public pendingNumber: number = 0;
  public searchQuery: string = "";
  public filteredSources: Source[] = [];
  @ViewChild(List) list: List;
  @ViewChild(Content) content: Content;

  constructor(
    public nav: NavController,
    public params: NavParams,
    public translate: TranslateService,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: TranslatedAlertController,
    public modalCtrl: ModalController,
    public storage: AppStorage,
    public settings: Settings,
  ) {
    this.projectId = params.get("id");
    this.loadProjectInfo();
  }

  ionViewWillEnter() {
    this.loadSources();
    this.loadPendingNumber();
  }

  ionViewDidEnter() {
    if (this.sources.length == 0 && this.pendingNumber != 0) {
      this.content.scrollToBottom(250);
    }
  }

  loadSources() {
    this.storage.getSourcesFromProjectId(this.projectId).then(sources => {
      this.sources = sources;
      this.filteredSources = sources;
      this.sources.sort((a, b) => {
        if (a.title && b.title) {
          return a.title.localeCompare(b.title);
        } else if (a.title) {
          return a.title.localeCompare(b.parsedSource);
        } else if (b.title) {
          return a.parsedSource.localeCompare(b.title);
        }
      });
      this.updateSearch();
    });
  }

  loadProjectInfo() {
    this.storage.getProjectFromId(this.projectId).then(project => {
      this.project = project;
    });
  }

  loadPendingNumber() {
    this.storage.getPendingNumber(this.projectId).then(num => {
      this.pendingNumber = num;
    });

    this.storage.loadPendingsFromProjectId(this.projectId);
  }

  createSource() {
    this.translate.get([
      "PROJECT.TYPES.BOOK",
      "PROJECT.TYPES.ARTICLE",
      "PROJECT.TYPES.INTERNET",
      "PROJECT.TYPES.CD",
      "PROJECT.TYPES.MOVIE",
      "PROJECT.TYPES.INTERVIEW",
      "PROJECT.DETAIL.CHOOSE_TYPE",
      "COMMON.CANCEL"
    ]).subscribe(translations => {
      let action = this.actionSheetCtrl.create({
        title: translations["PROJECT.DETAIL.CHOOSE_TYPE"],
        buttons: [
          {
            text: translations["PROJECT.TYPES.BOOK"],
            icon: "book",
            handler: () => {
              this.openModal("book", action.dismiss());
              return false;
            }
          },
          {
            text: translations["PROJECT.TYPES.ARTICLE"],
            icon: "paper",
            handler: () => {
              this.openModal("article", action.dismiss());
              return false;
            }
          },
          {
            text: translations["PROJECT.TYPES.INTERNET"],
            icon: "at",
            handler: () => {
              this.openModal("internet", action.dismiss());
              return false;
            }
          },
          {
            text: translations["PROJECT.TYPES.CD"],
            icon: "disc",
            handler: () => {
              this.openModal("cd", action.dismiss());
              return false;
            }
          },
          {
            text: translations["PROJECT.TYPES.MOVIE"],
            icon: "film",
            handler: () => {
              this.openModal("movie", action.dismiss());
              return false;
            }
          },
          {
            text: translations["PROJECT.TYPES.INTERVIEW"],
            icon: "quote",
            handler: () => {
              this.openModal("interview", action.dismiss());
              return false;
            }
          },
          {
            role: "cancel",
            text: translations["COMMON.CANCEL"]
          }
        ]
      });

      action.present();
    });
  }

  openModal(type: string, transition: Promise<any> = Promise.resolve(), openScan: boolean = false, editing: boolean = false, source: Source = undefined) {
    let navParams = {
      projectId: this.projectId,
      data: source,
      editing: editing,
      scan: openScan
    };
    let modalOpts = {
      enableBackdropDismiss: false
    };
    switch (type) {
      case "book":
        var modal = this.modalCtrl.create(SourceModalBookPage, navParams, modalOpts);
        break;
      case "article":
        var modal = this.modalCtrl.create(SourceModalArticlePage, navParams, modalOpts);
        break;
      case "internet":
        var modal = this.modalCtrl.create(SourceModalInternetPage, navParams, modalOpts);
        break;
      case "cd":
        var modal = this.modalCtrl.create(SourceModalCdPage, navParams, modalOpts);
        break;
      case "movie":
        var modal = this.modalCtrl.create(SourceModalMoviePage, navParams, modalOpts);
        break;
      case "interview":
        var modal = this.modalCtrl.create(SourceModalInterviewPage, navParams, modalOpts);
        break;
    }

    modal.onWillDismiss(() => {
      this.loadSources();
      this.loadPendingNumber();
    });

    transition.then(() => {
      modal.present();
    });
  }

  editSource(source: Source) {
    this.openModal(source.type, undefined, false, true, source);
  }

  deleteSource(source: Source) {
    this.alertCtrl.present({
      title: "PROJECT.DETAIL.POPUP.DELETE_TITLE",
      message: "PROJECT.DETAIL.POPUP.DELETE_TEXT",
      buttons: [
        {
          text: "COMMON.CANCEL",
          handler: () => {
            this.list.closeSlidingItems();
          }
        },
        {
          text: "COMMON.DELETE",
          handler: () => {
            this.storage.deleteSource(source._id);
            this.sources.splice(this.sources.indexOf(source), 1);
          }
        }
      ]
    });
  }

  share() {
    this.translate.get("PROJECT.DETAIL.SHARE_TEXT", { project_title: this.project.name }).subscribe(text => {
      let textToShare = text;
      let errNum = 0;
      let arr_sources = JSON.parse(JSON.stringify(this.sources)).sort((a, b) => {
        return a.parsedSource.localeCompare(b.parsedSource);
      });
      arr_sources.forEach(value => {
        textToShare += value.parsedSource + "<br><br>";
        errNum += value.errors.length;
      });

      if (errNum > 0 && !this.settings.get("ignoreErrors")) {
        this.alertCtrl.present({
          title: "PROJECT.DETAIL.POPUP.SHARE_TEXT",
          message: "PROJECT.DETAIL.POPUP.ERRORS_SOURCES",
          buttons: [
            {
              text: "COMMON.CANCEL"
            },
            {
              text: "PROJECT.DETAIL.POPUP.SHARE",
              handler: () => {
                SocialSharing.shareViaEmail(
                  textToShare,
                  this.project.name,
                  [],
                  [],
                  [],
                  []
                ).then(() => {
                  this.promptForAdvanced();
                }).catch(() => {});
              }
            }
          ]
        }, undefined, { errNum: errNum });
      } else {
        SocialSharing.shareViaEmail(
          textToShare,
          this.project.name,
          [],
          [],
          [],
          []
        ).then(() => {
          this.promptForAdvanced();
        }).catch(() => {});
      }
    });
  }

  promptForAdvanced() {
    if (!this.settings.get("advanced")) {
      let alert = this.alertCtrl.present({
        title: "PROJECT.DETAIL.POPUP.ADVANCED_MODE",
        message: "PROJECT.DETAIL.POPUP.ADVANCED_MODE_MESSAGE",
        buttons: [
          {
            text: "PROJECT.DETAIL.POPUP.NO_THANKS"
          },
          {
            text: "PROJECT.DETAIL.POPUP.DETAILS",
            handler: () => {
              alert.then(obj => {
                obj.dismiss().then(() => {
                  this.nav.push(AdvancedModePage);
                });
              });
              return false;
            }
          }
        ]
      });
    }
  }

  updateSearch() {
    this.filteredSources = this.sources;

    let q = this.searchQuery;

    if (q.trim() == "") {
      return;
    }

    let qa = q.trim().split(" ");

    this.filteredSources = this.filteredSources.filter((v) => {
      if (qa.length > 1) {
        for (var i = 0; i < qa.length; i++) {
          if (v.parsedSource.toLowerCase().indexOf(qa[i].toLowerCase()) > -1 || v.parsedType.toLowerCase().indexOf(qa[i].toLowerCase()) > -1) {
          }else {
            return false;
          }
        }
        return true;
      }else {
        if (v.parsedSource.toLowerCase().indexOf(qa[0].toLowerCase()) > -1 || v.parsedType.toLowerCase().indexOf(qa[0].toLowerCase()) > -1) {
          return true;
        }
      }
      return false;
    });
  }

  openSourcePage(source: Source) {
    this.nav.push(SourcePage, {
      pId: this.projectId,
      id: source._id
    });
  }

  openPendingPage() {
    this.nav.push(PendingsPage, {
      pId: this.projectId
    });
  }
}
