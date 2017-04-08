import { Component } from "@angular/core";
import { ViewController, NavParams } from "ionic-angular";


@Component({
  selector: "page-reference-card-example",
  templateUrl: "reference-card-example.html"
})
export class ReferenceCardExamplePage {
  public card: Card = null;

  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
    this.card = this.navParams.data;
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
