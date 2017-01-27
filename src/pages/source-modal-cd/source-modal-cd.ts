import { Component } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

import { ViewController, NavParams } from "ionic-angular";
import { Keyboard } from "ionic-native";

import { AppStorage } from "../../providers/app-storage";
import { Parse } from "../../providers/parse";
import { Settings } from "../../providers/settings";
import { TranslatedActionSheetController } from "../../providers/translated-action-sheet-controller";
import { TranslatedAlertController } from "../../providers/translated-alert-controller";

import { SourceModalBase } from "../source-modal/source-modal";

@Component({
  selector: "source-modal-cd",
  templateUrl: "source-modal-cd.html"
})
export class SourceModalCdPage extends SourceModalBase {
  public type = "cd";

  constructor(
    public viewCtrl: ViewController,
    public params: NavParams,
    public actionSheetCtrl: TranslatedActionSheetController,
    public alertCtrl: TranslatedAlertController,
    public storage: AppStorage,
    public parse: Parse,
    public settings: Settings,
    public fb: FormBuilder,
  ) {
    super(viewCtrl, params, actionSheetCtrl, storage, parse);

    this.form = fb.group({
      hasAuthors: [this.noData ? false : this.previous.hasAuthors],
      author1firstname: [this.noData ? "" : this.previous.author1firstname],
      author1lastname: [this.noData ? "" : this.previous.author1lastname],
      author2firstname: [this.noData ? "" : this.previous.author2firstname],
      author2lastname: [this.noData ? "" : this.previous.author2lastname],
      title: [this.noData ? "" : this.previous.title],
      editor: [this.noData ? "" : this.previous.editor],
      publicationLocation: [this.noData ? "" : this.previous.publicationLocation],
      publicationDate: [this.noData ? "" : this.previous.publicationDate]
    });
  }

  ionViewDidEnter() {
    if (!this.settings.get(Settings.wasCdAlertShown)) {
      this.showCdAlert();
      this.settings.set(Settings.wasCdAlertShown, true);
    }
  }

  showCdAlert() {
    this.alertCtrl.present({
      title: "PROJECT.DETAIL.POPUP.CAUTION",
      message: "PROJECT.DETAIL.POPUP.USE_CD_FOR_INFORMATION",
      buttons: [
        {
          text: "COMMON.OK"
        }
      ]
    });
  }
}
