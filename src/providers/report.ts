import { Injectable } from "@angular/core";

import { AppVersion } from "@ionic-native/app-version";
import { Device } from "@ionic-native/device";
import { SocialSharing } from "@ionic-native/social-sharing";
import { SplashScreen } from "@ionic-native/splash-screen";
import { TranslateService } from "@ngx-translate/core";

import { TranslatedAlertController } from "./translated-alert-controller";

@Injectable()
export class Report {
  constructor(
    public translate: TranslateService,
    public alertCtrl: TranslatedAlertController,
    public appVersion: AppVersion,
    public device: Device,
    public socialSharing: SocialSharing,
    public splashscreen: SplashScreen,
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
                this.socialSharing.shareViaEmail(
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

  askForRefresh(transition: Promise<void> = Promise.resolve()) {
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
              this.splashscreen.show();
              document.location.reload();
            }
          }
        ]
      });
    });
  }

  diagnostics(): Promise<string> {
    return new Promise(resolve => {
      Promise.all([this.appVersion.getVersionNumber(), this.appVersion.getVersionCode()]).then(result => {
        resolve(`${this.device.platform} ${this.device.version}<br>
          ${this.device.manufacturer} ${this.device.model}<br>
          ${window.screen.width * window.devicePixelRatio}x${window.screen.height * window.devicePixelRatio}<br>
          Cordova ${this.device.cordova}<br>
          Metho v${result[0]}(${result[1]})`);
      }).catch(err => {
        resolve(`${this.device.platform} ${this.device.version}<br>
          ${this.device.manufacturer} ${this.device.model}<br>
          ${window.screen.width * window.devicePixelRatio}x${window.screen.height * window.devicePixelRatio}<br>
          Cordova ${this.device.cordova}`);
      });
    });
  }
}
