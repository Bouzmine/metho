import { Component } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

import { ViewController, NavParams } from "ionic-angular";
import { Keyboard } from "@ionic-native/keyboard";
import { SafariViewController } from "@ionic-native/safari-view-controller";

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
    public keyboard: Keyboard,
    public safariViewController: SafariViewController
  ) {
    super(viewCtrl, params, actionSheetCtrl, storage, parse, keyboard);

    if (this.params.get("hideScan") == true) {
      this.hideScan = true;
    }else {
      this.hideScan = false;
    }

    if (typeof this.params.get("url") !== "undefined") {
      this.url = this.params.get("url");
      this.showBrowser = true;
      this.safariViewController.mayLaunchUrl(this.url);
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

    this.isAdvanced = this.settings.get(Settings.isAdvanced);

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

  fillInfos(suggestion: SourceFields) {
    if (this.isEmpty(["title"])) {
      this.updateValues(suggestion);
      this.insertingFromScan = true;
    }else {
      this.askIfOverwrite(() => {
        this.updateValues(suggestion);
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

  addPending(isbn: string, transition = Promise.resolve()) {
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

  async openBrowser() {
    if (await this.safariViewController.isAvailable()) {
      this.safariViewController.show({
        url: this.url
      });
    }
  }
}
