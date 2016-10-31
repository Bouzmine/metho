import { Component } from "@angular/core";

import { NavController, NavParams } from "ionic-angular";

import { ReferencesSubPage } from "../references-sub/references-sub";

import { References } from "../../providers/references";


@Component({
  selector: "references-detail",
  templateUrl: "references-detail.html"
})
export class ReferencesDetailPage {
  public name: string = "";
  public text: string = "";
  public entries: any[] = [];
  public id: string;

  constructor(
    public nav: NavController,
    public params: NavParams,
    public references: References,
  ) {
    this.id = this.params.get("id");
    this.references.load().then(data => {
      this.text = data[this.id].text;
      this.entries = data[this.id].subPages;
      this.name = data[this.id].name;
    });
  }

  goToReferenceSubPage(id: number) {
    this.nav.push(ReferencesSubPage, {
      id: this.id,
      subId: id
    });
  }
}
