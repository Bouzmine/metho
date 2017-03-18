import { Injectable } from "@angular/core";

import { ToastController, ToastOptions } from "ionic-angular";
import { TranslateService } from "ng2-translate/ng2-translate";


@Injectable()
export class TranslatedToastController {

  constructor(
    public toastCtrl: ToastController,
    public translate: TranslateService,
  ) {}

  present(opts: ToastOptions, translationOpts: TranslationOptions = {}): Promise<{ dismiss: () => Promise<void> }> {
    let tokens = [
      opts.message,
      opts.closeButtonText
    ];
    let cleanTokens = tokens.filter(element => element !== undefined);

    return new Promise(resolve => {
      this.translate.get(cleanTokens, translationOpts).subscribe(translations => {
        let toastOpts: ToastOptions = {
          message: translations[opts.message],
          closeButtonText: translations[opts.closeButtonText],
          duration: opts.duration,
          showCloseButton: opts.showCloseButton,
          position: opts.position,
          dismissOnPageChange: opts.dismissOnPageChange
        };

        let toast = this.toastCtrl.create(toastOpts);
        toast.present();
        resolve(toast);
      });
    });
  }
}
