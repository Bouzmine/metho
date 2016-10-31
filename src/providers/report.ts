import { Injectable } from "@angular/core";

import { SocialSharing, Device, AppVersion, Splashscreen } from "ionic-native";
import { TranslateService } from "ng2-translate/ng2-translate";

import { TranslatedAlertController } from "./translated-alert-controller";

@Injectable()
export class Report {
  constructor(
    public translate: TranslateService,
    public alertCtrl: TranslatedAlertController,
  ) {}

  report(err: any) {
    console.log(err);
    let errStr: string = err;
    let stacktrace: string = "";
    if (typeof err != "string") {
      errStr = err.toString();
    }

    if (typeof err == "object") {
      try {
        stacktrace = err.stack;
      } catch (e) {
        console.log(e);
        stacktrace = "";
      }
    }
    this.translate.get([
      "REPORT.ERROR"
    ]).subscribe(translations => {
      this.diagnostics().then(diags => {
        let alert = this.alertCtrl.present({
          title: "REPORT.UNKNOWN",
          message: "REPORT.REPORT_?",
          buttons: [
            {
              text: "COMMON.NO",
              handler: () => {
                alert.then(obj => {
                  this.askForRefresh(obj.dismiss());
                });
                return false;
              }
            },
            {
              text: "COMMON.YES",
              handler: () => {
                SocialSharing.shareViaEmail(
                  `<b>${translations["REPORT.DESC"]}</b><br><br><br>
                  <b>${translations["REPORT.DO_NOT_EDIT"]}</b><br>
                  ${diags}</p><br>
                  ${errStr}<br>
                  ${stacktrace}`,
                  translations["REPORT.ERROR"],
                  ["methoappeei@gmail.com"],
                  [],
                  [],
                  []
                ).then(() => {
                  this.askForRefresh();
                });
              }
            }
          ]
        });
      });
    });
  }

  askForRefresh(transition:Promise<any> = Promise.resolve()) {
    transition.then(() => {
      this.alertCtrl.present({
        title: "REPORT.ERROR",
        message: "REPORT.RELOAD?",
        buttons: [
          {
            text: "COMMON.NO"
          },
          {
            text: "COMMON.YES",
            handler: () => {
              Splashscreen.show();
              document.location.reload();
            }
          }
        ]
      });
    });
  }

  diagnostics(): Promise<string> {
    return new Promise(resolve => {
      Promise.all([AppVersion.getVersionNumber(), AppVersion.getVersionCode()]).then(result => {
        resolve(`${Device.device.platform} ${Device.device.version}<br>
          ${Device.device.manufacturer} ${Device.device.model}<br>
          ${window.screen.width * window.devicePixelRatio}x${window.screen.height * window.devicePixelRatio}<br>
          Cordova ${Device.device.cordova}<br>
          Metho v${result[0]}(${result[1]})`);
      }).catch(err => {
        resolve(`${Device.device.platform} ${Device.device.version}<br>
          ${Device.device.manufacturer} ${Device.device.model}<br>
          ${window.screen.width * window.devicePixelRatio}x${window.screen.height * window.devicePixelRatio}<br>
          Cordova ${Device.device.cordova}`);
      });
    });
  }
}
