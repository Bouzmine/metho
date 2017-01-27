import { ViewChild, Component } from "@angular/core";

import { NavController, List } from "ionic-angular";

import { AdvancedModePage } from "../advanced-mode/advanced-mode";
import { AttributionsPage } from "../attributions/attributions";
import { FeedbackPage } from "../feedback/feedback";

import { AdvancedMode } from "../../providers/advanced-mode";
import { Language } from "../../providers/language";
import { Settings } from "../../providers/settings";
import { TranslatedAlertController } from "../../providers/translated-alert-controller";

import deepcopy from "deepcopy";

@Component({
  selector: "settings",
  templateUrl: "settings.html"
})
export class SettingsPage {
  public settings: SettingsList = {};
  public enableAdvanced: boolean = false;
  public advancedDeviceAllowed: boolean = true;
  public advancedPage: any;
  public attributionsPage: any;
  public feedbackPage: any;
  @ViewChild(List) list: List;

  public showIlluminatiEaster: boolean = false;

  constructor(
    public nav: NavController,
    public alertCtrl: TranslatedAlertController,
    public advanced: AdvancedMode,
    public language: Language,
    public settingService: Settings,
  ) {
    this.advancedPage = AdvancedModePage;
    this.attributionsPage = AttributionsPage;
    this.feedbackPage = FeedbackPage;
    if (this.advanced.hasLoaded) {
      this.enableAdvanced = true;
      this.settings[Settings.isAdvanced] = this.settingService.get(Settings.isAdvanced);
    }else {
      this.advanced.loadEvents.subscribe(() => {
        this.enableAdvanced = true;
        this.settings[Settings.isAdvanced] = this.settingService.get(Settings.isAdvanced);
      });
    }
    this.advancedDeviceAllowed = this.advanced.isAvailable();
    this.advanced.init(true);
  }

  loadSettings() {
    this.settings = deepcopy(this.settingService.getAll());
    if (!this.enableAdvanced) {
      this.settings[Settings.isAdvanced] = false;
    }
  }

  ionViewWillEnter() {
    this.loadSettings();
  }

  toggleAdvanced() {
    if (this.settings[Settings.isAdvanced] != this.settingService.get(Settings.isAdvanced)) {
      if (this.settings[Settings.isAdvanced]) {
        this.advanced.enable().then(() => {

        }).catch(err => {
          this.settings[Settings.isAdvanced] = false;
        });
      }else {
        this.advanced.disable();
      }
    }
  }

  toggleIgnoreErrors() {
    if (this.settings[Settings.shouldIgnoreErrors] != this.settingService.get(Settings.shouldIgnoreErrors)) {
      this.settingService.set(Settings.shouldIgnoreErrors, this.settings[Settings.shouldIgnoreErrors]);
    }
  }

  editName() {
      this.alertCtrl.present({
        title: "SETTINGS.EDIT_NAME",
        inputs: [
          {
            type: "text",
            name: "firstname",
            value: this.settings[Settings.userFirstname]
          },
          {
            type: "text",
            name: "lastname",
            value: this.settings[Settings.userLastname]
          }
        ],
        buttons: [
          {
            text: "COMMON.CANCEL",
            handler: () => {
              this.list.closeSlidingItems();
            }
          },
          {
            text: "COMMON.EDIT",
            handler: results => {
              this.settingService.set(Settings.userFirstname, results.firstname);
              this.settingService.set(Settings.userLastname, results.lastname);
              this.loadSettings();
              this.list.closeSlidingItems();
            }
          }
        ]
      });
  }

  forgetName() {
    this.settingService.set(Settings.userFirstname, "");
    this.settingService.set(Settings.userLastname, "");
    this.loadSettings();
  }

  changeLanguage() {
    if (this.settings[Settings.overridenLanguage] != this.settingService.get(Settings.overridenLanguage)) {
      this.language.change(this.settings[Settings.overridenLanguage]);
    }
  }

  illuminatiEasterEgg() {
    this.showIlluminatiEaster = true;
    setTimeout(() => this.showIlluminatiEaster = false, 5250);
  }

  explainUnavailable() {
    if (!this.enableAdvanced) {
      this.alertCtrl.present({
        title: "SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK_TITLE",
        message: "SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK",
        buttons: [
          {
            text: "COMMON.OK"
          }
        ]
      });
    }else if (!this.advancedDeviceAllowed) {
      this.alertCtrl.present({
        title: "SETTINGS.ADVANCED_MODE.POPUP.UNSUPPORTED_DEVICE_TITLE",
        message: "SETTINGS.ADVANCED_MODE.POPUP.UNSUPPORTED_DEVICE",
        buttons: [
          {
            text: "COMMON.OK"
          }
        ]
      });
    }
  }
}
