import { Component } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

import { ViewController, NavParams } from "ionic-angular";
import { SafariViewController, Keyboard } from "ionic-native";

import { AppStorage } from "../../providers/app-storage";
import { Fetch } from "../../providers/fetch";
import { Language } from "../../providers/language";
import { Parse } from "../../providers/parse";
import { Scan } from "../../providers/scan";
import { Settings } from "../../providers/settings";
import { TranslatedActionSheetController } from "../../providers/translated-action-sheet-controller";
import { TranslatedAlertController } from "../../providers/translated-alert-controller";


@Component({
  selector: "source-modal-book",
  templateUrl: "source-modal-book.html"
})
export class SourceModalBookPage {
  public isNew: boolean;
  public noData: boolean;
  public previous: Source;
  public url: string;
  public pendingId: string;
  public projectId: string;
  public hideScan: boolean;
  public showBrowser: boolean;
  public isAdvanced: boolean;
  public insertingFromScan: boolean;
  public firstname: string;
  public lastname: string;
  public hasConfirmed: boolean = false;

  public form: FormGroup;
  public _timeout: any;
  public instantList: Array<any>;
  public instantStatus: any = {
    loading: false,
    none: false,
    err500: false,
    noConnection: false,
    ok: false,
    shown: false,
    timeout: false
  };

  constructor(
    public viewCtrl: ViewController,
    public params: NavParams,
    public actionSheetCtrl: TranslatedActionSheetController,
    public alertCtrl: TranslatedAlertController,
    public storage: AppStorage,
    public fetch: Fetch,
    public language: Language,
    public parse: Parse,
    public scanProvider: Scan,
    public settings: Settings,
    public fb: FormBuilder,
  ) {
    if(this.params.get("editing") == true) {
      this.isNew = false;
    }else {
      this.isNew = true;
    }

    if (typeof this.params.get("data") !== "undefined") {
      this.noData = false;
      this.previous = this.params.get("data");
    }else {
      this.noData = true;
    }

    this.projectId = this.params.get("projectId");

    if (this.params.get("hideScan") == true) {
      this.hideScan = true;
    }else {
      this.hideScan = false;
    }

    if (typeof this.params.get("pendingId") !== "undefined") {
      this.pendingId = this.params.get("pendingId");
    }

    if (typeof this.params.get("url") !== "undefined") {
      this.url = this.params.get("url");
      this.showBrowser = true;
      SafariViewController.mayLaunchUrl(this.url);
      this.viewCtrl.didEnter.subscribe(() => {
        this.browser();
      });
    }else {
      this.showBrowser = false;
    }

    if (this.params.get("scan") == true) {
      this.viewCtrl.didEnter.subscribe(() => {
        this.scan();
      });
    }

    this.isAdvanced = this.settings.get("advanced");

    this.form = fb.group({
      hasAuthors: [this.noData ? "" : this.previous.hasAuthors],
      author1lastname: [this.noData ? "" : this.previous.author1lastname],
      author1firstname: [this.noData ? "" : this.previous.author1firstname],
      author2lastname: [this.noData ? "" : this.previous.author2lastname],
      author2firstname: [this.noData ? "" : this.previous.author2firstname],
      author3lastname: [this.noData ? "" : this.previous.author3lastname],
      author3firstname: [this.noData ? "" : this.previous.author3firstname],
      title: [this.noData ? "" : this.previous.title],
      editor: [this.noData ? "" : this.previous.editor],
      publicationDate: [this.noData ? "" : this.previous.publicationDate],
      publicationLocation: [this.noData ? "" : this.previous.publicationLocation],
      pageNumber: [this.noData ? "" : this.previous.pageNumber],
      editionNumber: [this.noData ? "" : this.previous.editionNumber],
      volumeNumber: [this.noData ? "" : this.previous.volumeNumber],
      collection: [this.noData ? "" : this.previous.collection],
      hasBeenTranslated: [this.noData ? false : this.previous.hasBeenTranslated],
      translatedFrom: [this.noData ? "" : this.previous.translatedFrom],
      translator1firstname: [this.noData ? "" : this.previous.translator1firstname],
      translator1lastname: [this.noData ? "" : this.previous.translator1lastname],
      translator2firstname: [this.noData ? "" : this.previous.translator2firstname],
      translator2lastname: [this.noData ? "" : this.previous.translator2lastname]
    });
  }

  dismiss() {
    if (!this.isEmpty(true) && this.isNew && !this.pendingId) {
      let actionsheet = this.actionSheetCtrl.present({
        buttons: [
          {
            text: "PROJECT.DETAIL.MODAL.DELETE_DRAFT",
            role: "destructive",
            handler: () => {
              actionsheet.then(obj => {
                obj.dismiss().then(() => {
                  this.viewCtrl.dismiss();
                });
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
    }else {
      this.viewCtrl.dismiss();
    }
  }

  submitIfEnter(event) {
    if (event.keyCode == 13 && !this.hasConfirmed) {
      this.confirm();
      this.hasConfirmed = true;
    }
  }

  confirm() {
    let values = this.form.value;
    values.type = "book";
    let parsed = this.parse.parse(values);
    parsed.project_id = this.projectId;

    if (this.isNew) {
      this.storage.createSource(parsed);
      if (this.pendingId) {
        this.storage.deletePending(this.pendingId);
      }
    }else {
      this.storage.setSourceFromId(this.previous._id, parsed);
    }

    Keyboard.close();
    this.viewCtrl.dismiss();
  }

  // Instant Search
  search() {
    if (this.isAdvanced) {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      this._timeout = setTimeout(() => {
        this.instantStatus.ok = false;
        this.instantStatus.loading = false;
        this.instantStatus.none = false;
        this.instantStatus.err500 = false;
        this.instantStatus.shown = false;
        this.instantStatus.timeout = false;
        if (this.form.value.title) {
          this.instantStatus.loading = true;
          let query: string = "";
          let includeAuthors: boolean;
          if (this.form.value.author1lastname || this.form.value.author1firstname) {
            query = this.form.value.title + " " + this.form.value.author1lastname + " " + this.form.value.author1firstname;
            includeAuthors = true;
          }else {
            query = this.form.value.title;
            includeAuthors = false;
          }
          this.fetch.fromName(query, includeAuthors).then(list => {
            if (list.length != 0) {
              this.instantList = list;
              this.instantStatus.loading = false;
              this.instantStatus.ok = true;
            }else {
              this.instantStatus.loading = false;
              this.instantStatus.none = true;
            }
          }, err => {
            if (err.status >= 500 && err.status < 599) {
              this.instantStatus.err500 = true;
              this.instantStatus.loading = false;
            }else if (err.status == 408) {
              this.instantStatus.err500 = true;
              this.instantStatus.timeout = true;
              this.instantStatus.loading = false;
            }
          });
        }
        this._timeout = null;
      }, 500);
    }
  }

  toggleInstantSearch() {
    this.instantStatus.shown = !this.instantStatus.shown;
  }

  openExplaining() {
    if (this.instantStatus.none) {
      this.alertCtrl.present({
        title: "PROJECT.DETAIL.POPUP.NO_SUGGESTIONS",
        message: "PROJECT.DETAIL.POPUP.NO_SUGGESTIONS_DESC",
        buttons: [
          {
            text: "COMMON.OK"
          }
        ]
      });
    }else if (this.instantStatus.timeout) {
      this.alertCtrl.present({
        title: "PROJECT.DETAIL.POPUP.TIMEOUT_TITLE",
        message: "PROJECT.DETAIL.POPUP.TIMEOUT_SEARCH",
        buttons: [
          {
            text: "COMMON.OK"
          }
        ]
      });
    }else if (this.instantStatus.err500) {
      this.alertCtrl.present({
        title: "PROJECT.DETAIL.POPUP.ERROR",
        message: "PROJECT.DETAIL.POPUP.ERROR_500",
        buttons: [
          {
            text: "COMMON.OK"
          }
        ]
      });
    }
  }

  fillInfos(suggestion: any) {
    if (this.isEmpty(false)) {
      this.updateValues(suggestion);
      this.instantStatus.shown = false;
      this.insertingFromScan = true;
    }else {
      this.alertCtrl.present({
        title: "PROJECT.DETAIL.POPUP.AUTO_FILL_TITLE",
        message: "PROJECT.DETAIL.POPUP.AUTO_FILL_DESC",
        buttons: [
          {
            text: "COMMON.CANCEL"
          },
          {
            text: "PROJECT.DETAIL.POPUP.OVERWRITE",
            handler: () => {
              this.updateValues(suggestion);
              this.instantStatus.shown = false;
              this.insertingFromScan = true;
            }
          }
        ]
      });
    }
  }

  // Scan
  scan() {
    this.scanProvider.scan().then((response) => {
      if (response.data) {
        if (this.isEmpty(true)) {
          this.updateValues(response.data);
          this.insertingFromScan = true;
        }else {
          response.transition.then(() => {
            this.alertCtrl.present({
              title: "PROJECT.DETAIL.POPUP.AUTO_FILL_TITLE",
              message: "PROJECT.DETAIL.POPUP.AUTO_FILL_DESC",
              buttons: [
                {
                  text: "COMMON.CANCEL"
                },
                {
                  text: "PROJECT.DETAIL.POPUP.OVERWRITE",
                  handler: () => {
                    this.updateValues(response.data);
                    this.insertingFromScan = true;
                  }
                }
              ]
            });
          });
        }
      }else if (response.addPending) {
        this.addPending(response.isbn, response.transition);
      }
    });
  }

  updateValues(response: any) {
    this.form.patchValue(this.mergeObjects(this.form.value, response));
  }

  addPending(isbn: string, transition=Promise.resolve()) {
    var creating = {
      isbn: isbn,
      date: this.language.getMoment()().toObject(),
      project_id: this.projectId
    };

    this.storage.createPending(creating);
    transition.then(() => {
      this.viewCtrl.dismiss();
    });
  }

  isEmpty(includeTitle: boolean) {
    if (!this.form.value.author1firstname && !this.form.value.author1lastname && !this.form.value.author2firstname && !this.form.value.author2lastname && !this.form.value.author3firstname && !this.form.value.author3lastname && !this.form.value.editor && !this.form.value.hasAuthors && !this.form.value.pageNumber && !this.form.value.publicationDate && !this.form.value.publicationLocation) {
      if (includeTitle) {
        if (!this.form.value.title) {
          return true;
        }else {
          return false;
        }
      }else {
        return true;
      }
    }else {
      return false;
    }
  }

  mergeObjects(obj1: any, obj2: any) {
    for (var variable in obj2) {
      if (obj2.hasOwnProperty(variable)) {
        if (obj2[variable] != "") {
          obj1[variable] = [obj2[variable]];
        }else {
          obj1[variable] = [obj1[variable]];
        }
      }
    }
    return obj1;
  }

  browser() {
    SafariViewController.isAvailable().then(avail => {
      if (avail) {
        SafariViewController.show({
          url: this.url
        });
      }
    });
  }
}
