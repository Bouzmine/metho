import { Injectable } from "@angular/core";

import { ActionSheetController, ActionSheetOptions } from "ionic-angular";
import { TranslateService } from "ng2-translate/ng2-translate";


@Injectable()
export class TranslatedActionSheetController {

  constructor(
    public actionSheetCtrl: ActionSheetController,
    public translate: TranslateService,
  ) {}

  present(opts: ActionSheetOptions, translationOpts: any = {}): Promise<{ dismiss: () => Promise<any> }> {
    let tokens = [
      opts.title,
      opts.subTitle
    ];
    if (opts.buttons) {
      opts.buttons.forEach((value) => {
        tokens.push(value.text);
      });
    }

    let cleanTokens = tokens.filter(element => element !== undefined);
    console.log(cleanTokens);

    return new Promise(resolve => {
      this.translate.get(cleanTokens, translationOpts).subscribe(translations => {
        let actionOpts: ActionSheetOptions = {
          title: translations[opts.title],
          subTitle: translations[opts.subTitle]
        };
        actionOpts.buttons = [];

        if (opts.buttons) {
          opts.buttons.forEach((value) => {
            actionOpts.buttons.push({
              text: translations[value.text],
              handler: value.handler,
              role: value.role,
              icon: value.icon
            });
          });
        }

        let actionsheet = this.actionSheetCtrl.create(actionOpts);
        actionsheet.present();
        resolve(actionsheet);
      });
    });
  }
}
