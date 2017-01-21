import { ViewChild, Component } from "@angular/core";

import { NavController, ViewController, Slides } from "ionic-angular";

import { Settings } from "../../providers/settings";

@Component({
  selector: "boarding-scan",
  templateUrl: "boarding-scan.html"
})
export class BoardingScanPage {
  @ViewChild("slider") slider: Slides;
  public currentIndex: number = 0;

  constructor(
    public viewCtrl: ViewController,
    public settings: Settings,
  ) {}

  dismiss() {
    this.settings.set("scanBoardingDone", true);
    this.viewCtrl.dismiss();
  }

  onSlideChange() {
    this.currentIndex = this.slider.getActiveIndex();
  }
}
