import { Component } from "@angular/core";

import { NavController } from "ionic-angular";

import { ReferencesDetailPage } from "../references-detail/references-detail";
import { ReferencesSubPage } from "../references-sub/references-sub";

import { References } from "../../providers/references";
import { Settings } from "../../providers/settings";


@Component({
  selector: "references",
  templateUrl: "references.html"
})
export class ReferencesPage {
  public searchQuery: string = "";
  public referenceData: ReferenceObject[] = [];
  public searchData: SearchReferenceObject[] = [];
  public advanced: boolean;

  constructor(
    public nav: NavController,
    public references: References,
  ) {
    this.references.load().then(data => {
      this.referenceData = data;
    });
  }

  updateSearch() {
    if (this.searchQuery.trim() != "") {
      this.searchData = this.references.search(this.searchQuery);
    }
  }

  goToReferenceDetailPage(id: number) {
    this.nav.push(ReferencesDetailPage, {
      id: id
    });
  }

  goToReferenceSubPage(id: number, subId: number) {
    this.nav.push(ReferencesSubPage, {
      id: id,
      subId: subId
    });
  }
}
