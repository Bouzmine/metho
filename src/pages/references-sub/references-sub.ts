import { Component } from "@angular/core";

import { NavController, NavParams } from "ionic-angular";

import { References } from "../../providers/references";


@Component({
  selector: "references-sub",
  templateUrl: "references-sub.html"
})
export class ReferencesSubPage {
  public name: string = "";
  public text: string = "";

  constructor(
    public nav: NavController,
    public params: NavParams,
    public references: References,
  ) {
    let index = this.params.get("id");
    let subIndex = this.params.get("subId");
    this.references.load().then(data => {
      let reference = data[index].subPages[subIndex];
      this.name = reference.name;
      this.text = reference.text;
    });
  }
}
