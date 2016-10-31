import { Component } from "@angular/core";

import { NavController, NavParams, ModalController } from "ionic-angular";
import { Keyboard } from "ionic-native";

import { SourceModalBookPage } from "../source-modal-book/source-modal-book";
import { SourceModalArticlePage } from "../source-modal-article/source-modal-article";
import { SourceModalInternetPage } from "../source-modal-internet/source-modal-internet";
import { SourceModalCdPage } from "../source-modal-cd/source-modal-cd";
import { SourceModalMoviePage } from "../source-modal-movie/source-modal-movie";
import { SourceModalInterviewPage } from "../source-modal-interview/source-modal-interview";

import { AppStorage } from "../../providers/app-storage";
import { Parse } from "../../providers/parse";
import { TranslatedAlertController } from "../../providers/translated-alert-controller";


@Component({
  selector: "source",
  templateUrl: "source.html"
})
export class SourcePage {
  public source: Source = {
    warnings: [],
    errors: [],
    type: "",
    title: ""
  };
  public id: string;

  constructor(
    public nav: NavController,
    public params: NavParams,
    public alertCtrl: TranslatedAlertController,
    public modalCtrl: ModalController,
    public storage: AppStorage,
    public parse: Parse,
  ) {
    this.id = this.params.get("id");
  }

  ionViewWillEnter() {
    this.loadSource();
  }

  loadSource() {
    this.storage.getSourceFromId(this.id).then(source => {
      this.source = source;
    });
  }

  solve(error: SourceError) {
    let alertOpts = {
      title: error.promptTitle,
      message: error.promptText,
      buttons: [
        {
          text: "COMMON.CANCEL",
          handler: () => {
            Keyboard.close();
          }
        },
        {
          text: "COMMON.OK",
          handler: data => {
            Keyboard.close();
            if (error.complex) {
              if (error.type == "select") {
                this.source[error.var] = data;
              }
            }else {
              error.inputs.forEach((value) => {
                this.source[value.var] = data[value.var];
              });
            }
            this.source = this.parse.parse(this.source);
            this.storage.setSourceFromId(this.id, this.source);
          }
        }
      ],
      inputs: []
    };
    if (error.complex) {
      if (error.type == "select") {
        error.options.forEach(option => {
          alertOpts.inputs.push({
            type: "radio",
            label: option.text,
            value: option.value,
            checked: false
          });
        });
      }
    }else {
      error.inputs.forEach((value) => {
        alertOpts.inputs.push({
          name: value.var,
          placeholder: value.example
        });
      });
    }

    this.alertCtrl.present(alertOpts);
  }

  edit() {
    switch (this.source.type) {
      case "book":
        var modal = this.modalCtrl.create(SourceModalBookPage, {
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        }, {
          enableBackdropDismiss: false
        });
        break;
      case "article":
        var modal = this.modalCtrl.create(SourceModalArticlePage, {
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        }, {
          enableBackdropDismiss: false
        });
        break;
      case "internet":
        var modal = this.modalCtrl.create(SourceModalInternetPage, {
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        }, {
          enableBackdropDismiss: false
        });
        break;
      case "cd":
        var modal = this.modalCtrl.create(SourceModalCdPage, {
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        }, {
          enableBackdropDismiss: false
        });
        break;
      case "movie":
        var modal = this.modalCtrl.create(SourceModalMoviePage, {
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        }, {
          enableBackdropDismiss: false
        });
        break;
      case "interview":
        var modal = this.modalCtrl.create(SourceModalInterviewPage, {
          data: this.source,
          editing: true,
          projectId: this.source.project_id
        }, {
          enableBackdropDismiss: false
        });
        break;
    }

    modal.onWillDismiss(() => {
      this.loadSource();
    });

    modal.present();
  }
}
