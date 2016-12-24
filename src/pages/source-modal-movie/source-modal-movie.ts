import { Component } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

import { ViewController, NavParams } from "ionic-angular";
import { Keyboard } from "ionic-native";

import { AppStorage } from "../../providers/app-storage";
import { Language } from "../../providers/language";
import { Parse } from "../../providers/parse";
import { TranslatedActionSheetController } from "../../providers/translated-action-sheet-controller";

import { SourceModalBase } from "../source-modal/source-modal";

@Component({
  selector: "source-modal-movie",
  templateUrl: "source-modal-movie.html"
})
export class SourceModalMoviePage extends SourceModalBase {
  public type = "movie";

  constructor(
    public viewCtrl: ViewController,
    public params: NavParams,
    public actionSheetCtrl: TranslatedActionSheetController,
    public storage: AppStorage,
    public language: Language,
    public parse: Parse,
    public fb: FormBuilder,
  ) {
    super(viewCtrl, params, actionSheetCtrl, storage, parse);

    this.generateLabels(this.language.getMoment());
    this.form = fb.group({
      hasAuthors: [this.noData ? false : this.previous.hasAuthors],
      author1firstname: [this.noData ? "" : this.previous.author1firstname],
      author1lastname: [this.noData ? "" : this.previous.author1lastname],
      title: [this.noData ? "" : this.previous.title],
      episodeTitle: [this.noData ? "" : this.previous.episodeTitle],
      productionLocation: [this.noData ? "" : this.previous.productionLocation],
      productor: [this.noData ? "" : this.previous.productor],
      broadcaster: [this.noData ? "" : this.previous.broadcaster],
      duration: [this.noData ? "" : this.previous.duration],
      publicationDate: [this.noData ? "" : this.previous.publicationDate],
      support: [this.noData ? "" : this.previous.support],
      consultationDate: [this.noData ? "" : this.previous.consultationDate],
    });
  }
}
