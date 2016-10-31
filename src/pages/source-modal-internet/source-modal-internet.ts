import { Component } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

import { ViewController, NavParams } from "ionic-angular";
import { Keyboard } from "ionic-native";

import { AppStorage } from "../../providers/app-storage";
import { Language } from "../../providers/language";
import { Parse } from "../../providers/parse";
import { Settings } from "../../providers/settings";
import { TranslatedActionSheetController } from "../../providers/translated-action-sheet-controller";


@Component({
  selector: "source-modal-internet",
  templateUrl: "source-modal-internet.html"
})
export class SourceModalInternetPage {
  public isNew: boolean;
  public noData: boolean;
  public previous: Source;
  public pendingId: string;
  public projectId: string;
  public isAdvanced: boolean;
  public hasConfirmed: boolean = false;

  public form: FormGroup;
  public monthList: string;
  public monthShortList: string;
  public weekdayList: string;
  public weekdayShortList: string;

  constructor(
    public viewCtrl: ViewController,
    public params: NavParams,
    public actionSheetCtrl: TranslatedActionSheetController,
    public storage: AppStorage,
    public language: Language,
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

    this.isAdvanced = this.settings.get("advanced");

    let moment = this.language.getMoment();
    this.form = fb.group({
      hasAuthors: [this.noData ? false : this.previous.hasAuthors],
      author1firstname: [this.noData ? "" : this.previous.author1firstname],
      author1lastname: [this.noData ? "" : this.previous.author1lastname],
      title: [this.noData ? "" : this.previous.title],
      editor: [this.noData ? "" : this.previous.editor],
      url: [this.noData ? "" : this.previous.url],
      consultationDate: [this.noData ? moment().utcOffset(0).subtract(-moment().utcOffset(), "minutes").toISOString() : this.previous.consultationDate]
    });
    this.generateLabels();
  }

  generateLabels() {
    this.monthList = this.language.getMoment().months().join(",");
    this.monthShortList = this.language.getMoment().monthsShort().join(",");
    this.weekdayList = this.language.getMoment().weekdays().join(",");
    this.weekdayShortList = this.language.getMoment().weekdaysShort().join(",");
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
    values.type = "internet";
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

  updateValues(response: any) {
    this.form = this.fb.group(this.mergeObjects(this.form.value, response));
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

  isEmpty() {
    if (!this.form.value.author1firstname && !this.form.value.author1lastname && !this.form.value.editor && !this.form.value.hasAuthors && !this.form.value.url) {
      return true;
    }else {
      return false;
    }
  }
}
