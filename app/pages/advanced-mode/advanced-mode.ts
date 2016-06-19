import {Page, NavController} from 'ionic-angular';

import {TranslatePipe, TranslateService} from 'ng2-translate/ng2-translate';

import {AdvancedMode} from '../../providers/advanced-mode/advanced-mode';

@Page({
  templateUrl: 'build/pages/advanced-mode/advanced-mode.html',
  pipes: [TranslatePipe]
})
export class AdvancedModePage {
  public isAdvanced: boolean = false;

  constructor(public nav: NavController, public advanced: AdvancedMode, public translate: TranslateService) {
    this.isAdvanced = this.advanced.isEnabled();
  }

  enable() {
    this.advanced.enable().then(() => {
      this.nav.pop();
    }).catch(err => {

    });
  }
}
