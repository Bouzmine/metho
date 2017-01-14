import { Component } from "@angular/core";

import { NavController, NavParams } from "ionic-angular";


@Component({
  selector: "license",
  templateUrl: "license.html"
})
export class LicensePage {
  public titleToken: string = "";
  public content: string = "";

  constructor(
    public nav: NavController,
    public params: NavParams,
  ) {
    this.titleToken = this.params.get("titleToken");
    this.content = this.params.get("content");
  }
}
