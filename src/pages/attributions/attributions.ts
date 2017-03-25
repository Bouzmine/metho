import { Component } from "@angular/core";

import { NavController } from "ionic-angular";
import { SafariViewController } from "@ionic-native/safari-view-controller";

import { LicensePage } from "../license/license";

import { Attributions } from "../../providers/attributions";


@Component({
  selector: "attributions",
  templateUrl: "attributions.html"
})
export class AttributionsPage {
  public libraries: LibraryObject[] = [];
  public plugins: string[] = [];
  public licenses: LicenseObject[] = [];

  constructor(
    public nav: NavController,
    public attributions: Attributions,
    public safariViewController: SafariViewController
  ) {
    this.safariViewController.warmUp();
    this.attributions.load().then(data => {
      this.libraries = data.libraries;
      this.plugins = data.plugins;
      this.licenses = data.licenses;
    });
  }

  showLicense(licenseObj: LicenseObject) {
    this.nav.push(LicensePage, { titleToken: licenseObj.token, content: licenseObj.content });
  }

  openWebsite(url: string) {
    this.safariViewController.show({ url: url });
  }
}
