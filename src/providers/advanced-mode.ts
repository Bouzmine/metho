import { Injectable, EventEmitter } from "@angular/core";

import { Device } from "@ionic-native/device";
import { InAppPurchase } from "@ionic-native/in-app-purchase";

import { Report } from "./report";
import { Settings } from "./settings";
import { TranslatedAlertController } from "./translated-alert-controller";


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
    public device: Device,
    public inAppPurchase: InAppPurchase,
  ) {}

  init(retryOnFail: boolean) {
    const isOnline = navigator.onLine;
    const isAlreadyLoaded = (this.hasLoaded);
    if (isOnline && !isAlreadyLoaded) {
      this.inAppPurchase.getProducts(["com.fclavette.metho.advanced"]).then(products => {
        let product = products[0];
        this.completeInit(product.price, product.productId);
      }).catch(err => {
        if (err != "cordova_not_available") {
          this.report.report(err);
        }
        this.completeInit("1,39$", "");
      });
    }else if (!isAlreadyLoaded && retryOnFail) {
      setTimeout(() => {
        this.init(true);
      }, 5000);
    }
  }

  completeInit(price: string, productId: string) {
    this.price = price;
    this.productId = productId;
    this.hasLoaded = true;
    this.loadEvents.emit(true);
  }

  enable(): Promise<any> {
    if (!this.settings.get(Settings.isAdvanced) && "cordova" in window) {
      return new Promise((resolve, reject) => {
        if (navigator.onLine && this.hasLoaded) {
          this.inAppPurchase.buy(this.productId).then((data) => {
            this.settings.set(Settings.isAdvanced, true);
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
      this.settings.set(Settings.isAdvanced, true);
      return Promise.resolve();
    }
  }

  restore(): Promise<any> {
    if (!this.settings.get(Settings.isAdvanced)) {
      return new Promise((resolve, reject) => {
        if (navigator.onLine) {
          this.inAppPurchase.restorePurchases().then((data) => {
            if (data.length && data[0].productId == this.productId) {
              this.settings.set(Settings.isAdvanced, true);
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
    this.settings.set(Settings.isAdvanced, false);
  }

  isEnabled() {
    return this.settings.get(Settings.isAdvanced);
  }

  isAvailable(): boolean {
    if (this.device.platform == "iOS") {
      if (this.prohibited.indexOf(this.device.model) > -1) {
        return false;
      }else {
        return true;
      }
    }else {
      return true;
    }
  }
}
