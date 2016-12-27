import { Component } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

import { ViewController, NavParams } from "ionic-angular";
import { Keyboard } from "ionic-native";

import { AppStorage } from "../../providers/app-storage";
import { Language } from "../../providers/language";
import { Parse } from "../../providers/parse";
import { Settings } from "../../providers/settings";
import { TranslatedActionSheetController } from "../../providers/translated-action-sheet-controller";

import { SourceModalBase } from "../source-modal/source-modal";

@Component({
  selector: "source-modal-internet",
  templateUrl: "source-modal-internet.html"
})
export class SourceModalInternetPage extends SourceModalBase {
  public type = "internet";

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
    super(viewCtrl, params, actionSheetCtrl, storage, parse);

    let moment = this.language.getMoment();
    this.generateLabels(moment);
    this.form = fb.group({
      hasAuthors: [this.noData ? "" : this.previous.hasAuthors],
      author1firstname: [this.noData ? "" : this.previous.author1firstname],
      author1lastname: [this.noData ? "" : this.previous.author1lastname],
      organization: [this.noData ? "" : this.previous.organization],
      title: [this.noData ? "" : this.previous.title],
      editor: [this.noData ? "" : this.previous.editor],
      url: [this.noData ? "" : this.previous.url],
      consultationDate: [this.noData ? this.getCorrectedDate(moment) : this.previous.consultationDate]
    });
  }
}
