import { Component } from "@angular/core";

import { NavController, NavParams } from "ionic-angular";

import { ReferencesSubPage } from "../references-sub/references-sub";



@Component({
  selector: "references-detail",
  templateUrl: "references-detail.html"
})
export class ReferencesDetailPage {
  public name: string = "";
  public text: string = "";
  public entries: ReferenceObject[] = [];

  constructor(
    public nav: NavController,
    public params: NavParams,
  ) {
    let reference = this.params.data;
    this.text = reference.text;
    this.entries = reference.subPages || [];
    this.name = reference.name;
  }

  goToReferenceSubPage(entry: ReferenceObject) {
    this.nav.push(ReferencesSubPage, entry);
  }
}
