import { Component } from "@angular/core";

import { NavController, NavParams, ModalController } from "ionic-angular";
import { Clipboard } from "@ionic-native/clipboard";
import { Keyboard } from "@ionic-native/keyboard";

import getModalFromType from "../source-modal/choose-modal";

import { AppStorage } from "../../providers/app-storage";
import { Parse } from "../../providers/parse";
import { TranslatedAlertController } from "../../providers/translated-alert-controller";
import { TranslatedToastController } from "../../providers/translated-toast-controller";


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
    public toastCtrl: TranslatedToastController,
    public storage: AppStorage,
    public parse: Parse,
    public clipboard: Clipboard,
    public keyboard: Keyboard,
  ) {
    this.id = this.params.get("id");
  }

  ionViewWillEnter() {
    this.loadSource();
  }

  async loadSource() {
    this.source = await this.storage.getSourceFromId(this.id);
  }

  solve(error: SourceError) {
    let alertOpts = {
      title: error.promptTitle,
      message: error.promptText,
      buttons: [
        {
          text: "COMMON.CANCEL",
          handler: () => {
            this.keyboard.close();
          }
        },
        {
          text: "COMMON.OK",
          handler: data => {
            this.keyboard.close();
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
      inputs: [],
      enableBackdropDismiss: false
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
    const navParams = {
      data: this.source,
      editing: true,
      projectId: this.source.project_id
    };
    const modalOpts = {
      enableBackdropDismiss: false
    };

    var modal = this.modalCtrl.create(getModalFromType(this.source.type), navParams, modalOpts);

    modal.onWillDismiss(() => {
      this.loadSource();
    });

    modal.present();
  }

  copy() {
    let sourceWithoutHTML = this.source.parsedSource.replace(/[<][/]?[a-z]+[>]/g, "");
    this.clipboard.copy(sourceWithoutHTML).then(() => {
      this.toastCtrl.present({
        message: "PROJECT.SOURCE.COPIED",
        duration: 1250,
        dismissOnPageChange: true,
        showCloseButton: false,
        position: "top"
      });
    }).catch((err) => {
      console.log(err);
    });
  }
}
