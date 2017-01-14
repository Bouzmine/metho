import { Component } from "@angular/core";

import { NavController } from "ionic-angular";
import { SafariViewController } from "ionic-native";

import { LicensePage } from "../license/license";

import { Attributions } from "../../providers/attributions";


@Component({
  selector: "attributions",
  templateUrl: "attributions.html"
})
export class AttributionsPage {
  public data: any = {
    libraries: [],
    plugins: [],
    licenses: []
  };

  constructor(
    public nav: NavController,
    public attributions: Attributions
  ) {
    SafariViewController.warmUp();
    this.attributions.load().then(data => {
      this.data = data;
    });
  }

  showLicense(licenseObj: any) {
    this.nav.push(LicensePage, { titleToken: licenseObj.token, content: licenseObj.content });
  }

  openWebsite(url: string) {
    SafariViewController.show({ url: url });
  }
}
