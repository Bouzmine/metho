import { Component } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

import { ViewController, NavParams } from "ionic-angular";
import { Keyboard } from "ionic-native";

import { AppStorage } from "../../providers/app-storage";
import { Language } from "../../providers/language";
import { Parse } from "../../providers/parse";
import { TranslatedActionSheetController } from "../../providers/translated-action-sheet-controller";


@Component({
  selector: "source-modal-article",
  templateUrl: "source-modal-article.html"
})
export class SourceModalArticlePage {
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
    public storage: AppStorage,
    public parse: Parse,
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
      author1firstname: [this.noData ? "" : this.previous.author1firstname],
      author1lastname: [this.noData ? "" : this.previous.author1lastname],
      title: [this.noData ? "" : this.previous.title],
      editor: [this.noData ? "" : this.previous.editor],
      editionNumber: [this.noData ? "" : this.previous.editionNumber],
      publicationDate: [this.noData ? "" : this.previous.publicationDate],
      startPage: [this.noData ? "" : this.previous.startPage],
      endPage: [this.noData ? "" : this.previous.endPage]
    });
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
    let values = this.form.value;
    values.type = "article";
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
    if (!this.form.value.author1firstname && !this.form.value.author1lastname && !this.form.value.editor && !this.form.value.editionNumber && !this.form.value.publicationDate && !this.form.value.startPage && !this.form.value.endPage && !this.form.value.title) {
      return true;
    }else {
      return false;
    }
  }
}
