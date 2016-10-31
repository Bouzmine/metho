import { Component } from "@angular/core";

import { NavController, NavParams } from "ionic-angular";


@Component({
  selector: "license",
  templateUrl: "license.html"
})
export class LicensePage {
  public type: string = "";

  constructor(
    public nav: NavController,
    public params: NavParams,
  ) {
    this.type = this.params.get("type");
  }
}
