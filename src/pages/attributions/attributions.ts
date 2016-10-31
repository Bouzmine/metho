import { Component } from "@angular/core";

import { NavController } from "ionic-angular";
import { SafariViewController } from "ionic-native";

import { LicensePage } from "../license/license";


@Component({
  selector: "attributions",
  templateUrl: "attributions.html"
})
export class AttributionsPage {
  constructor(
    public nav: NavController,
  ) {
    SafariViewController.warmUp();
  }

  showLicense(type: string) {
    this.nav.push(LicensePage, { type: type });
  }

  openWebsite(url: string) {
    SafariViewController.show({ url: url });
  }
}
