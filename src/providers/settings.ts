import { Injectable, EventEmitter } from "@angular/core";

import { Storage } from "@ionic/storage";

import { AppStorage } from "./app-storage";


@Injectable()
export class Settings {
  public settings: SettingsList = {};
  public defaults: SettingsList = {
    advanced: false,
    scanBoardingDone: false,
    cdAlertShown: false,
    firstname: "",
    lastname: "",
    overideLang: "",
    lastLang: "",
    ignoreErrors: false
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
    Object.keys(this.defaults).map((value, index) => {
      this.localStorage.get("setting-" + value).then(res => {
        if (res != null) {
          settings[value] = this.transformIfBool(res);
        }else {
          if (value == "overideLang" && !this.isEmpty(settings)) {
            settings[value] = "";
          }
        }

        if (index == 6) {
          if (this.isEmpty(settings)) { // LocalStorage may have been cleared by iOS or it"s 1st boot
            this.storage.getSettings().then(backup => {
              if (this.isEmpty(backup)) { // Make defaults (1st boot)
                Object.keys(this.defaults).map((value, index) => {
                  this.set(value, this.defaults[value]);

                  if (index == 7) {
                    this.isLoaded = true;
                    this.loadEvents.emit(true);
                  }
                });
              }else { // LocalStorage has been cleared by iOS but backup is there
                Object.keys(backup).map((value, index) => {
                  this.set(value, backup[value]);

                  if (index == (Object.keys(backup).length - 1)) {
                    this.isLoaded = true;
                    this.loadEvents.emit(true);
                  }
                });
              }
            }).catch(err => console.log(err));
          }else { // Everything is normal after 1st boot
            this.settings = settings;
            this.isLoaded = true;
            this.loadEvents.emit(true);
            console.log(this.settings);
          }
        }
      });
    });
  }

  getAsync(key: string): any {
    if (this.isLoaded) {
      return Promise.resolve(this.settings[key]);
    }else {
      return new Promise(resolve => {
        this.loadEvents.subscribe(() => {
          resolve(this.settings[key]);
        })
      });
    }
  }

  get(key: string): any {
    return this.settings[key];
  }

  set(key: string, set: any): void {
    this.settings[key] = this.transformIfBool(set);
    this.localStorage.set("setting-" + key, set.toString());
    this.storage.setSetting(key, set);
  }

  getAll(): SettingsList {
    return this.settings;
  }

  transformIfBool(input: string): boolean|string {
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
