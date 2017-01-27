import { Component } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

import { ViewController, NavParams, NavController } from "ionic-angular";
import { Keyboard } from "ionic-native";

import { AppStorage } from "../../providers/app-storage";
import { Language } from "../../providers/language";
import { Parse } from "../../providers/parse";
import { Settings } from "../../providers/settings";
import { TranslatedActionSheetController } from "../../providers/translated-action-sheet-controller";
import { TranslatedAlertController } from "../../providers/translated-alert-controller";

import { SourceModalBase } from "../source-modal/source-modal";

@Component({
  selector: "source-modal-interview",
  templateUrl: "source-modal-interview.html"
})
export class SourceModalInterviewPage extends SourceModalBase {
  public type = "interview";

  constructor(
    public viewCtrl: ViewController,
    public params: NavParams,
    public actionSheetCtrl: TranslatedActionSheetController,
    public alertCtrl: TranslatedAlertController,
    public storage: AppStorage,
    public language: Language,
    public parse: Parse,
    public settings: Settings,
    public fb: FormBuilder,
  ) {
    super(viewCtrl, params, actionSheetCtrl, storage, parse);

    let moment = this.language.getMoment();
    this.generateLabels(moment);
    this.form = fb.group({
      author1firstname: [this.noData ? this.settings.get(Settings.userFirstname) : this.previous.author1firstname],
      author1lastname: [this.noData ? this.settings.get(Settings.userLastname) : this.previous.author1lastname],
      civility: [this.noData ? "" : this.previous.civility],
      interviewed1firstname: [this.noData ? "" : this.previous.interviewed1firstname],
      interviewed1lastname: [this.noData ? "" : this.previous.interviewed1lastname],
      interviewedTitle: [this.noData ? "" : this.previous.interviewedTitle],
      publicationLocation: [this.noData ? "" : this.previous.publicationLocation],
      consultationDate: [this.noData ? this.getCorrectedDate(moment) : this.previous.consultationDate],
    });
  }

  submitIfEnter(event) {
    super.submitIfEnter(event, this.close);
  }

  confirm() {
    super.confirm(this.close);
  }

  close() {
    if (this.form.value.author1firstname && this.form.value.author1lastname && !this.settings.get(Settings.userFirstname) && !this.settings.get(Settings.userLastname)) {
      let alert = this.alertCtrl.present({
        title: "PROJECT.DETAIL.MODAL.INTERVIEW.INTERVIEWER_NAME",
        message: "PROJECT.DETAIL.POPUP.SAVE_INTERVIEWER_NAME",
        buttons: [
          {
            text: "COMMON.NO",
            handler: () => {
              Keyboard.close();
              this.viewCtrl.dismiss();
            }
          },
          {
            text: "COMMON.YES",
            handler: () => {
              alert.then(obj => {
                let transition = obj.dismiss();
                this.settings.set(Settings.userFirstname, this.form.value.author1firstname);
                this.settings.set(Settings.userLastname, this.form.value.author1lastname);

                transition.then(() => {
                  Keyboard.close();
                  this.viewCtrl.dismiss();
                });
              });
              return false;
            }
          }
        ]
      });
    }else {
      Keyboard.close();
      this.viewCtrl.dismiss();
    }
  }

  isEmpty() {
    let exclusions = [];
    if (this.settings.get(Settings.userFirstname) != "") {
      exclusions.push("author1firstname");
    }

    if (this.settings.get(Settings.userLastname) != "") {
      exclusions.push("author1lastname");
    }

    return super.isEmpty(exclusions);
  }
}
