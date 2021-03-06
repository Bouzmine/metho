import { Component } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

import { ViewController, NavParams } from "ionic-angular";
import { Keyboard } from "@ionic-native/keyboard";

import { AppStorage } from "../../providers/app-storage";
import { Language } from "../../providers/language";
import { Parse } from "../../providers/parse";
import { TranslatedActionSheetController } from "../../providers/translated-action-sheet-controller";

import { SourceModalBase } from "../source-modal/source-modal";


@Component({
  selector: "source-modal-article",
  templateUrl: "source-modal-article.html"
})
export class SourceModalArticlePage extends SourceModalBase {
  public type: string = "article";

  constructor(
    public viewCtrl: ViewController,
    public params: NavParams,
    public actionSheetCtrl: TranslatedActionSheetController,
    public storage: AppStorage,
    public parse: Parse,
    public fb: FormBuilder,
    public keyboard: Keyboard,
  ) {
    super(viewCtrl, params, actionSheetCtrl, storage, parse, keyboard);

    this.form = fb.group({
      author1firstname: [this.noData ? "" : this.previous.author1firstname],
      author1lastname: [this.noData ? "" : this.previous.author1lastname],
      author2firstname: [this.noData ? "" : this.previous.author2firstname],
      author2lastname: [this.noData ? "" : this.previous.author2lastname],
      author3firstname: [this.noData ? "" : this.previous.author3firstname],
      author3lastname: [this.noData ? "" : this.previous.author3lastname],
      title: [this.noData ? "" : this.previous.title],
      editor: [this.noData ? "" : this.previous.editor],
      editionNumber: [this.noData ? "" : this.previous.editionNumber],
      publicationDate: [this.noData ? "" : this.previous.publicationDate],
      startPage: [this.noData ? "" : this.previous.startPage],
      endPage: [this.noData ? "" : this.previous.endPage]
    });
  }
}
