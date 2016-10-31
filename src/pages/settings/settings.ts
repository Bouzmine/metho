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
  public advancedAvailable: boolean = true;
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
      this.settings.advanced = this.settingService.get("advanced");
    }else {
      this.advanced.loadEvents.subscribe(() => {
        this.enableAdvanced = true;
        this.settings.advanced = this.settingService.get("advanced");
      });
    }
    this.advancedAvailable = this.advanced.isAvailable();
  }

  loadSettings() {
    this.settings = deepcopy(this.settingService.getAll());
    if (!this.enableAdvanced) {
      this.settings.advanced = false;
    }
  }

  ionViewWillEnter() {
    this.loadSettings();
  }

  toggleAdvanced() {
    if (this.settings.advanced != this.settingService.getAll().advanced) {
      if (this.settings.advanced) {
        this.advanced.enable().then(() => {

        }).catch(err => {
          this.settings.advanced = false;
        });
      }else {
        this.advanced.disable();
      }
    }
  }

  toggleIgnoreErrors() {
    if (this.settings.ignoreErrors != this.settingService.getAll().ignoreErrors) {
      this.settingService.set("ignoreErrors", this.settings.ignoreErrors);
    }
  }

  editName() {
      this.alertCtrl.present({
        title: "SETTINGS.EDIT_NAME",
        inputs: [
          {
            type: "text",
            name: "firstname",
            value: this.settings.firstname
          },
          {
            type: "text",
            name: "lastname",
            value: this.settings.lastname
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
              this.settingService.set("firstname", results.firstname);
              this.settingService.set("lastname", results.lastname);
              this.loadSettings();
              this.list.closeSlidingItems();
            }
          }
        ]
      });
  }

  forgetName() {
    this.settingService.set("firstname", "");
    this.settingService.set("lastname", "");
    this.loadSettings();
  }

  changeLanguage() {
    if (this.settings.overideLang != this.settingService.getAll().overideLang) {
      this.language.change(this.settings.overideLang);
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
    }else if (!this.advancedAvailable) {
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
