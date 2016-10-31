import { Injectable, EventEmitter } from "@angular/core";

import { InAppPurchase, Device } from "ionic-native";

import { Report } from "./report";
import { Settings } from "./settings";
import { TranslatedAlertController } from "./translated-alert-controller";

interface CordovaWindow extends Window {
  cordova: any;
}
declare var window: CordovaWindow;


@Injectable()
export class AdvancedMode {
  public price: string = "";
  public hasLoaded: boolean = false;
  public loadEvents: EventEmitter<any> = new EventEmitter();
  public productId: string = "";
  public prohibited = [
    // iPod Touch 5
    "iPod5,1",
    // iPhone 4S
    "iPhone4,1",
    // iPad 2
    "iPad2,1",
    "iPad2,2",
    "iPad2,3",
    "iPad2,4",
    // iPad mini original
    "iPad2,5",
    "iPad2,6",
    "iPad2,7"
  ];

  constructor(
    public alertCtrl: TranslatedAlertController,
    public report: Report,
    public settings: Settings,
  ) {
    this.init();
  }

  init() {
    if (navigator.onLine) {
      InAppPurchase.getProducts(["com.fclavette.metho.advanced"]).then(products => {
        let product = products[0];
        this.price = product.price;
        this.productId = product.productId;
        this.hasLoaded = true;
        this.loadEvents.emit(true);
      }).catch(err => {
        if (err != "cordova_not_available") {
          this.report.report(err);
        }
        this.price = "1,39$";
        this.hasLoaded = true;
        this.loadEvents.emit(true);
      });
    }else {
      setTimeout(() => {
        this.init();
      }, 5000);
    }
  }

  enable(): Promise<any> {
    if (!this.settings.get("advanced") && !!window.cordova) {
      return new Promise((resolve, reject) => {
        if (navigator.onLine && this.hasLoaded) {
          InAppPurchase.buy(this.productId).then((data) => {
            this.settings.set("advanced", true);
            resolve();
          }).catch(err => {
            reject();
          });
        }else {
          this.alertCtrl.present({
            title: "SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK_TITLE",
            message: "SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK",
            buttons: [
              {
                text: "COMMON.OK",
                handler: () => {
                  reject();
                }
              }
            ]
          });
        }
      });
    }else {
      this.settings.set("advanced", true);
      return Promise.resolve();
    }
  }

  restore(): Promise<any> {
    if (!this.settings.get("advanced")) {
      return new Promise((resolve, reject) => {
        if (navigator.onLine) {
          InAppPurchase.restorePurchases().then((data) => {
            if (data.length && data[0].productId == this.productId) {
              this.settings.set("advanced", true);
              resolve();
            }else {
              this.alertCtrl.present({
                title: "SETTINGS.ADVANCED_MODE.POPUP.RESTORE",
                message: "SETTINGS.ADVANCED_MODE.POPUP.RESTORE_NO_FOUND",
                buttons: [
                  {
                    text: "COMMON.OK"
                  }
                ]
              });
            }
          }).catch(err => {
            this.report.report("catch-restore" + err);
            reject();
          });
        }else {
          this.alertCtrl.present({
            title: "SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK_TITLE",
            message: "SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK",
            buttons: [
              {
                text: "COMMON.OK",
                handler: () => {
                  reject();
                }
              }
            ]
          });
        }
      });
    }else {
      return Promise.resolve();
    }
  }

  disable() {
    this.settings.set("advanced", false);
  }

  isEnabled() {
    return this.settings.get("advanced");
  }

  isAvailable(): boolean {
    if (Device.device.platform == "iOS") {
      if (this.prohibited.indexOf(Device.device.model) > -1) {
        return false;
      }else {
        return true;
      }
    }else {
      return true;
    }
  }
}
