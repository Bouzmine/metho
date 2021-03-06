import { ViewChild, Component } from "@angular/core";

import { NavController, NavParams, ModalController, List, Content } from "ionic-angular";
import { Clipboard } from "@ionic-native/clipboard";
import { SocialSharing } from "@ionic-native/social-sharing";
import { TranslateService } from "@ngx-translate/core";

import getModalFromType from "../source-modal/choose-modal";
import { AdvancedModePage } from "../advanced-mode/advanced-mode";
import { SourcePage } from "../source/source";
import { PendingsPage } from "../pendings/pendings";

import { AppStorage } from "../../providers/app-storage";
import { Settings } from "../../providers/settings";
import { TranslatedActionSheetController } from "../../providers/translated-action-sheet-controller";
import { TranslatedAlertController } from "../../providers/translated-alert-controller";
import { TranslatedToastController } from "../../providers/translated-toast-controller";


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
  public typeTable: SourceTypes = {
    "PROJECT.TYPES.BOOK": "",
    "PROJECT.TYPES.ARTICLE": "",
    "PROJECT.TYPES.INTERNET": "",
    "PROJECT.TYPES.CD_PARSE": "",
    "PROJECT.TYPES.MOVIE": "",
    "PROJECT.TYPES.INTERVIEW": ""
  };
  @ViewChild(List) list: List;
  @ViewChild(Content) content: Content;

  constructor(
    public nav: NavController,
    public params: NavParams,
    public translate: TranslateService,
    public actionSheetCtrl: TranslatedActionSheetController,
    public alertCtrl: TranslatedAlertController,
    public toastCtrl: TranslatedToastController,
    public modalCtrl: ModalController,
    public storage: AppStorage,
    public settings: Settings,
    public clipboard: Clipboard,
    public socialSharing: SocialSharing,
  ) {
    this.projectId = params.get("id");
    this.loadProjectInfo();
    this.generateTypeTable();

    this.translate.onLangChange.subscribe(() => {
      this.generateTypeTable();
    });
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

  async loadSources() {
    this.sources = await this.storage.getSourcesFromProjectId(this.projectId);
    this.updateSearch();
    this.sources.sort((a, b) => {
      if (a.title && b.title) {
        return a.title.localeCompare(b.title);
      } else if (a.title) {
        return a.title.localeCompare(b.parsedSource);
      } else if (b.title) {
        return a.parsedSource.localeCompare(b.title);
      }
    });
  }

  generateTypeTable() {
    this.translate.get([
      "PROJECT.TYPES.BOOK",
      "PROJECT.TYPES.ARTICLE",
      "PROJECT.TYPES.INTERNET",
      "PROJECT.TYPES.CD_PARSE",
      "PROJECT.TYPES.MOVIE",
      "PROJECT.TYPES.INTERVIEW"
    ]).subscribe(translations => {
      this.typeTable = {
        "PROJECT.TYPES.BOOK": translations["PROJECT.TYPES.BOOK"],
        "PROJECT.TYPES.ARTICLE": translations["PROJECT.TYPES.ARTICLE"],
        "PROJECT.TYPES.INTERNET": translations["PROJECT.TYPES.INTERNET"],
        "PROJECT.TYPES.CD_PARSE": translations["PROJECT.TYPES.CD_PARSE"],
        "PROJECT.TYPES.MOVIE": translations["PROJECT.TYPES.MOVIE"],
        "PROJECT.TYPES.INTERVIEW": translations["PROJECT.TYPES.INTERVIEW"]
      };
    });
  }

  async loadProjectInfo() {
    this.project = await this.storage.getProjectFromId(this.projectId);
  }

  async loadPendingNumber() {
    this.pendingNumber = await this.storage.getPendingNumber(this.projectId);

    this.storage.loadPendingsFromProjectId(this.projectId);
  }

  createSource() {
    let actionsheet = this.actionSheetCtrl.present({
      title: "PROJECT.DETAIL.CHOOSE_TYPE",
      buttons: [
        {
          text: "PROJECT.TYPES.BOOK",
          icon: "book",
          handler: () => {
            actionsheet.then(obj => {
              this.openModal("book", obj.dismiss());
            });
            return false;
          }
        },
        {
          text: "PROJECT.TYPES.ARTICLE",
          icon: "paper",
          handler: () => {
            actionsheet.then(obj => {
              this.openModal("article", obj.dismiss());
            });
            return false;
          }
        },
        {
          text: "PROJECT.TYPES.INTERNET",
          icon: "at",
          handler: () => {
            actionsheet.then(obj => {
              this.openModal("internet", obj.dismiss());
            });
            return false;
          }
        },
        {
          text: "PROJECT.TYPES.CD",
          icon: "disc",
          handler: () => {
            actionsheet.then(obj => {
              this.openModal("cd", obj.dismiss());
            });
            return false;
          }
        },
        {
          text: "PROJECT.TYPES.MOVIE",
          icon: "film",
          handler: () => {
            actionsheet.then(obj => {
              this.openModal("movie", obj.dismiss());
            });
            return false;
          }
        },
        {
          text: "PROJECT.TYPES.INTERVIEW",
          icon: "quote",
          handler: () => {
            actionsheet.then(obj => {
              this.openModal("interview", obj.dismiss());
            });
            return false;
          }
        },
        {
          role: "cancel",
          text: "COMMON.CANCEL"
        }
      ]
    });
  }

  openModal(type: string, transition: Promise<any> = Promise.resolve(), openScan: boolean = false, editing: boolean = false, source: Source = undefined) {
    const navParams = {
      projectId: this.projectId,
      data: source,
      editing: editing,
      scan: openScan
    };
    const modalOpts = {
      enableBackdropDismiss: false
    };

    let modal = this.modalCtrl.create(getModalFromType(type), navParams, modalOpts);

    modal.onWillDismiss(() => {
      !!this.list && this.list.closeSlidingItems();
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
    let action = this.actionSheetCtrl.present({
      title: "",
      buttons: [
        {
          text: "PROJECT.DETAIL.COPY",
          handler: () => {
            action.then(sheet => {
              sheet.dismiss().then(() => this.exportViaCopy());
            });
            return false;
          }
        },
        {
          text: "PROJECT.DETAIL.EXPORT_EMAIL",
          handler: () => {
            action.then(sheet => {
              sheet.dismiss().then(() => this.exportViaEmail());
            });
            return false;
          }
        },
        {
          text: "COMMON.CANCEL",
          role: "cancel"
        }
      ]
    });
  }

  exportViaEmail() {
    this.translate.get("PROJECT.DETAIL.SHARE_TEXT", {
      project_title: this.project.name
    }).subscribe(header => {
      let content = this.getExportText(false, header);
      let numberOfErrors = this.getNumberOfErrors();

      if (numberOfErrors > 0 && !this.settings.get(Settings.shouldIgnoreErrors)) {
        this.askIfIgnoreErrors(numberOfErrors, () => {
          this.openEmailComposer(this.project.name, content).then(() => {
            this.promptForAdvanced();
          }).catch((err) => console.log(err));
        });
      } else {
        this.openEmailComposer(this.project.name, content).then(() => {
          this.promptForAdvanced();
        }).catch((err) => console.log(err));
      }
    });
  }

  getExportText(removeHTML: boolean, header: string = ""): string {
    const lineEnding = removeHTML ? "\n\n" : "<br><br>";

    let textWithHTML = this.sources.concat().sort((a, b) => {
      return a.parsedSource.replace(/[<][/]?[a-z]+[>]/g, "").localeCompare(b.parsedSource.replace(/[<][/]?[a-z]+[>]/g, ""));
    }).reduce((accumulator, current) => {
      return accumulator + current.parsedSource + lineEnding;
    }, header);

    if (removeHTML) {
      return textWithHTML.replace(/[<][/]?[a-z]+[>]/g, "");
    }else {
      return textWithHTML;
    }
  }

  getNumberOfErrors(): number {
    return this.sources.reduce((acc, item) => {
      return acc + item.errors.length;
    }, 0);
  }

  askIfIgnoreErrors(numberOfErrors: number, callback: () => void) {
    this.alertCtrl.present({
      title: "PROJECT.DETAIL.POPUP.SHARE_TEXT",
      message: "PROJECT.DETAIL.POPUP.ERRORS_SOURCES",
      buttons: [
        {
          text: "COMMON.CANCEL"
        },
        {
          text: "PROJECT.DETAIL.POPUP.SHARE",
          handler: callback
        }
      ]
    }, {}, { errNum: numberOfErrors });
  }

  openEmailComposer(title: string, body: string): Promise<void> {
    return this.socialSharing.shareViaEmail(
        body,
        title,
        [],
        [],
        [],
        []
      );
  }

  copyTextToClipboard(text: string) {
    this.clipboard.copy(text).then(() => {
      this.toastCtrl.present({
        message: "PROJECT.DETAIL.COPIED",
        duration: 1500,
        dismissOnPageChange: true,
        showCloseButton: false,
        position: "top"
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  exportViaCopy() {
    let numberOfErrors = this.getNumberOfErrors();
    let text = this.getExportText(true);
    if (numberOfErrors > 0 && !this.settings.get(Settings.shouldIgnoreErrors)) {
      this.askIfIgnoreErrors(numberOfErrors, () => {
        this.copyTextToClipboard(text);
      });
    }else {
      this.copyTextToClipboard(text);
    }
  }



  promptForAdvanced() {
    if (!this.settings.get(Settings.isAdvanced)) {
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

    let query = this.searchQuery;

    if (query.trim() == "") {
      return;
    }

    let wordList = query.trim().split(" ");

    this.filteredSources = this.filteredSources.filter((v) => {
      for (let word of wordList) {
        if (v.parsedSource.toLowerCase().indexOf(word.toLowerCase()) > -1 || this.typeTable[v.parsedType].toLowerCase().indexOf(word.toLowerCase()) > -1) {
        }else {
          return false;
        }
      }
      return true;
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
