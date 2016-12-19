import { Component } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

import { ViewController, NavParams } from "ionic-angular";
import { Keyboard } from "ionic-native";

import { AppStorage } from "../../providers/app-storage";
import { Language } from "../../providers/language";
import { Parse } from "../../providers/parse";
import { TranslatedActionSheetController } from "../../providers/translated-action-sheet-controller";


export abstract class SourceModalBase {
  public isNew: boolean;
  public noData: boolean;
  public previous: Source;
  public pendingId: string;
  public projectId: string;
  public hasConfirmed: boolean = false;

  public form: FormGroup;

  public monthList: string;
  public monthShortList: string;
  public weekdayList: string;
  public weekdayShortList: string;

  public abstract type: string;

  constructor(
    public viewCtrl: ViewController,
    public params: NavParams,
    public actionSheetCtrl: TranslatedActionSheetController,
    public storage: AppStorage,
    public parse: Parse,
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

  submitIfEnter(event, closeFunc?: () => void) {
    if (event.keyCode == 13 && !this.hasConfirmed) {
      this.confirm(closeFunc);
      this.hasConfirmed = true;
    }
  }

  confirm(closeFunc = () => {
    Keyboard.close();
    this.viewCtrl.dismiss();
  }) {
    let values = this.form.value;
    values.type = this.type;
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

    closeFunc.bind(this)();
  }

  abstract isEmpty(includeTitle?: boolean): boolean;

  updateValues(newValue: any) {
    this.form.patchValue(newValue);
  }

  generateLabels(moment) {
    this.monthList = moment.months().join(",");
    this.monthShortList = moment.monthsShort().join(",");
    this.weekdayList = moment.weekdays().join(",");
    this.weekdayShortList = moment.weekdaysShort().join(",");
  }

  getCorrectedDate(moment) {
    return moment().utcOffset(0).subtract(-moment().utcOffset(), "minutes").toISOString();
  }
}
