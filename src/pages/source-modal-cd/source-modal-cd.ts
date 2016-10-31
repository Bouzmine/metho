import { Component } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

import { ViewController, NavParams } from "ionic-angular";
import { Keyboard } from "ionic-native";

import { AppStorage } from "../../providers/app-storage";
import { Parse } from "../../providers/parse";
import { Settings } from "../../providers/settings";
import { TranslatedActionSheetController } from "../../providers/translated-action-sheet-controller";
import { TranslatedAlertController } from "../../providers/translated-alert-controller";


@Component({
  selector: "source-modal-cd",
  templateUrl: "source-modal-cd.html"
})
export class SourceModalCdPage {
  public isNew: boolean;
  public noData: boolean;
  public previous: Source;
  public pendingId: string;
  public projectId: string;
  public hasConfirmed: boolean = false;

  public form: FormGroup;

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

    if (typeof this.params.get("pendingId") !== "undefined") {
      this.pendingId = this.params.get("pendingId");
    }

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
    if (!this.settings.get("cdAlertShown")) {
      let alert = this.alertCtrl.present({
        title: "PROJECT.DETAIL.POPUP.CAUTION",
        message: "PROJECT.DETAIL.POPUP.USE_CD_FOR_INFORMATION",
        buttons: [
          {
            text: "COMMON.OK"
          }
        ]
      });
      this.settings.set("cdAlertShown", true);
    }
  }

  dismiss() {
    if (!this.isEmpty() && this.isNew) {
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
    var values = this.form.value;
    values.type = "cd";
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

  isEmpty() {
    if (!this.form.value.author1firstname && !this.form.value.author1lastname && !this.form.value.author2firstname && !this.form.value.author2lastname && !this.form.value.editor && !this.form.value.title && !this.form.value.hasAuthors && !this.form.value.publicationDate && !this.form.value.publicationLocation) {
      return true;
    }else {
      return false;
    }
  }
}
