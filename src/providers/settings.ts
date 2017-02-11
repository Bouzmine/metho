import { Injectable, EventEmitter } from "@angular/core";

import { Storage } from "@ionic/storage";

import { AppStorage } from "./app-storage";


@Injectable()
export class Settings {
  // CONSTANTS
  public static isAdvanced = "advanced";
  public static wasScanBoardingShown = "scanBoardingDone";
  public static wasCdAlertShown = "cdAlertShown";
  public static userFirstname = "firstname";
  public static userLastname = "lastname";
  public static overridenLanguage = "overideLang";
  public static shouldIgnoreErrors = "ignoreErrors";

  public settings: SettingsList = {};
  public defaults: SettingsList = {
    [Settings.isAdvanced]: false,
    [Settings.wasScanBoardingShown]: false,
    [Settings.wasCdAlertShown]: false,
    [Settings.userFirstname]: "",
    [Settings.userLastname]: "",
    [Settings.overridenLanguage]: "",
    [Settings.shouldIgnoreErrors]: false
  };

  public loadEvents: EventEmitter<any> = new EventEmitter();
  public isLoaded: boolean = false;

  constructor(
    public storage: AppStorage,
    public localStorage: Storage
  ) {
    this.load();
  }

  load() {
    var settings = {};
    this.localStorage.forEach((value, key) => {
      key = key.replace("setting-", "");
      if (value != null) {
        settings[key] = this.transformIfBool(value);
      }else {
        if (key == Settings.overridenLanguage && !this.isEmpty(settings)) {
          settings[key] = "";
        }
      }
    }).then(() => {
      if (this.isEmpty(settings)) { // LocalStorage may have been cleared by iOS or it's 1st boot
        this.storage.getSettings().then(backup => {
          if (this.isEmpty(backup)) { // Make defaults (1st boot)
            Object.keys(this.defaults).forEach((value, index) => {
              this.set(value, this.defaults[value]);
            });
            this.isLoaded = true;
            this.loadEvents.emit(true);
          }else { // LocalStorage has been cleared by iOS but backup is there
            Object.keys(backup).forEach((value, index) => {
              this.set(value, backup[value]);
            });
            this.isLoaded = true;
            this.loadEvents.emit(true);
          }
        }).catch(err => console.log(err));
      }else { // Everything is normal after 1st boot
        this.settings = settings;
        this.isLoaded = true;
        this.loadEvents.emit(true);
        console.log(this.settings);
      }
    });
  }

  getAsync(key: string): Promise<any> {
    if (this.isLoaded) {
      return Promise.resolve(this.settings[key]);
    }else {
      return new Promise(resolve => {
        this.loadEvents.subscribe(() => {
          resolve(this.settings[key]);
        });
      });
    }
  }

  get(key: string): any {
    return this.settings[key];
  }

  set(key: string, set: boolean|string): void {
    this.settings[key] = this.transformIfBool(set);
    this.localStorage.set("setting-" + key, set.toString());
    this.storage.setSetting(key, set);
  }

  getAll(): SettingsList {
    return this.settings;
  }

  transformIfBool(input: string|boolean): boolean|string {
    if (input == "true") {
      return true;
    }else if (input == "false") {
      return false;
    }else {
      return input;
    }
  }

  isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }
}
