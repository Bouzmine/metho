import { Component } from "@angular/core";

import { ModalController, NavController, NavParams } from "ionic-angular";

import { References } from "../../providers/references";

import { ReferenceCardExamplePage } from "../reference-card-example/reference-card-example";


@Component({
  selector: "references-sub",
  templateUrl: "references-sub.html"
})
export class ReferencesSubPage {
  public name: string = "";
  public text: string = "";
  public card_example: Card[] = [];

  constructor(
    public nav: NavController,
    public modalCtrl: ModalController,
    public params: NavParams,
    public references: References,
  ) {
    let reference = this.params.data;
    this.name = reference.name;
    this.text = reference.text;
    this.card_example = reference.card_example;
  }

  openCard(card: Card) {
    this.modalCtrl.create(ReferenceCardExamplePage, card).present();
  }
}
