import { Component } from "@angular/core";

import { NavController } from "ionic-angular";

import { ReferencesDetailPage } from "../references-detail/references-detail";

import { References } from "../../providers/references";
import { Settings } from "../../providers/settings";


@Component({
  selector: "references",
  templateUrl: "references.html"
})
export class ReferencesPage {
  public referenceData: any[] = [];
  public advanced: boolean;

  constructor(
    public nav: NavController,
    public references: References,
  ) {
    this.references.load().then(data => {
      this.referenceData = data;
    });
  }

  goToReferenceDetailPage(id: number) {
    this.nav.push(ReferencesDetailPage, {
      id: id
    });
  }
}
