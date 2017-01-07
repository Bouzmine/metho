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

import { SourceModalBase } from "../source-modal/source-modal";

@Component({
  selector: "source-modal-book",
  templateUrl: "source-modal-book.html"
})
export class SourceModalBookPage extends SourceModalBase {
  public type = "book";
  // Scan
  public url: string;
  public hideScan: boolean;
  public showBrowser: boolean;
  public isAdvanced: boolean;
  public insertingFromScan: boolean;

  // Instant Search
  public _timeout: any;
  public instantList: Array<any> = [];
  public instantStatus: any = {
    isLoading: false,
    noResult: false,
    serverError: false,
    notOnline: false,
    isDone: false,
    isShown: false,
    timeoutError: false,
    showStatus: false
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
    super(viewCtrl, params, actionSheetCtrl, storage, parse);

    if (this.params.get("hideScan") == true) {
      this.hideScan = true;
    }else {
      this.hideScan = false;
    }

    if (typeof this.params.get("url") !== "undefined") {
      this.url = this.params.get("url");
      this.showBrowser = true;
      SafariViewController.mayLaunchUrl(this.url);
      this.viewCtrl.didEnter.subscribe(() => {
        this.openBrowser();
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

  search() {
    if (!this.isAdvanced) return;
    if (!navigator.onLine) return;

    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeout = setTimeout(() => {
      const title = this.form.value.title;
      const firstname = this.form.value.author1firstname;
      const lastname = this.form.value.author1lastname;

      if (title) {
        this.instantSearchIsLoading();
        const hasAuthor = (firstname || lastname);
        let query = `${title} ${firstname} ${lastname}`.trim();
        this.fetch.fromName(query, hasAuthor).then(suggestions => {
          if (suggestions.length) {
            this.instantList = suggestions;
            this.instantSearchIsDone();
          }else {
            this.instantSearchHasNone();
          }
        }).catch(err => {
          if (err.status >= 500 && err.status < 599) {
            this.instantSearchErr500();
          }else if (err.status == 408) {
            this.instantSearchTimeout();
          }
        });
      }else {
        this.instantList = [];
        this.resetInstantSearchVars();
      }
      this._timeout = null;
    }, 500);
  }

  resetInstantSearchVars() {
    this.instantStatus.isDone = false;
    this.instantStatus.isLoading = false;
    this.instantStatus.noResult = false;
    this.instantStatus.serverError = false;
    this.instantStatus.isShown = false;
    this.instantStatus.timeoutError = false;
    this.instantStatus.showStatus = false;
  }

  instantSearchIsLoading() {
    this.resetInstantSearchVars();
    this.instantStatus.showStatus = true;
    this.instantStatus.isLoading = true;
  }

  instantSearchIsDone() {
    this.resetInstantSearchVars();
    this.instantStatus.showStatus = true;
    this.instantStatus.isDone = true;
  }

  instantSearchHasNone() {
    this.resetInstantSearchVars();
    this.instantStatus.showStatus = true;
    this.instantStatus.noResult = true;
  }

  instantSearchErr500() {
    this.resetInstantSearchVars();
    this.instantStatus.showStatus = true;
    this.instantStatus.serverError = true;
  }

  instantSearchTimeout() {
    this.resetInstantSearchVars();
    this.instantStatus.showStatus = true;
    this.instantStatus.serverError = true;
    this.instantStatus.timeoutError = true;
  }

  toggleInstantSearch() {
    this.instantStatus.isShown = !this.instantStatus.isShown;
  }

  openExplaining() {
    if (this.instantStatus.noResult) {
      this.alertCtrl.present({
        title: "PROJECT.DETAIL.POPUP.NO_SUGGESTIONS",
        message: "PROJECT.DETAIL.POPUP.NO_SUGGESTIONS_DESC",
        buttons: [
          {
            text: "COMMON.OK"
          }
        ]
      });
    }else if (this.instantStatus.timeoutError) {
      this.alertCtrl.present({
        title: "PROJECT.DETAIL.POPUP.TIMEOUT_TITLE",
        message: "PROJECT.DETAIL.POPUP.TIMEOUT_SEARCH",
        buttons: [
          {
            text: "COMMON.OK"
          }
        ]
      });
    }else if (this.instantStatus.serverError) {
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
    if (this.isEmpty(["title"])) {
      this.updateValues(suggestion);
      this.instantStatus.isShown = false;
      this.insertingFromScan = true;
    }else {
      this.askIfOverwrite(() => {
        this.updateValues(suggestion);
        this.instantStatus.isShown = false;
        this.insertingFromScan = true;
      });
    }
  }

  scan() {
    this.scanProvider.scan().then((response) => {
      if (response.data) {
        if (this.isEmpty()) {
          this.updateValues(response.data);
          this.insertingFromScan = true;
        }else {
          response.transition.then(() => {
            this.askIfOverwrite(() => {
              this.updateValues(response.data);
              this.insertingFromScan = true;
            });
          });
        }
      }else if (response.addPending) {
        this.addPending(response.isbn, response.transition);
      }
    });
  }

  askIfOverwrite(callbackIfYes: () => void) {
    this.alertCtrl.present({
      title: "PROJECT.DETAIL.POPUP.AUTO_FILL_TITLE",
      message: "PROJECT.DETAIL.POPUP.AUTO_FILL_DESC",
      buttons: [
        {
          text: "COMMON.CANCEL"
        },
        {
          text: "PROJECT.DETAIL.POPUP.OVERWRITE",
          handler: callbackIfYes
        }
      ]
    });
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

  openBrowser() {
    SafariViewController.isAvailable().then(avail => {
      if (avail) {
        SafariViewController.show({
          url: this.url
        });
      }
    });
  }
}
