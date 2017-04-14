import { Component } from "@angular/core";

import { NavController, ModalController, NavParams } from "ionic-angular";

import { ReferenceCardExamplePage } from "../reference-card-example/reference-card-example";


@Component({
  selector: "references-detail",
  templateUrl: "references-detail.html"
})
export class ReferencesDetailPage {
  public name: string = "";
  public text: string = "";
  public entries: ReferenceObject[] = [];
  public cardExample: Card[] = [];

  constructor(
    public nav: NavController,
    public modalCtrl: ModalController,
    public params: NavParams,
  ) {
    let reference = this.params.data;
    this.text = reference.text;
    this.entries = reference.subPages || [];
    this.name = reference.name;
    this.cardExample = reference.card_example || [];
  }

  goToReferenceSubPage(entry: ReferenceObject) {
    this.nav.push(ReferencesDetailPage, entry);
  }

  openCard(card: Card) {
    this.modalCtrl.create(ReferenceCardExamplePage, card).present();
  }
}
