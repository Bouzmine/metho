import { Injectable } from "@angular/core";

import { AlertController, AlertOptions, NavOptions } from "ionic-angular";
import { TranslateService } from "@ngx-translate/core";


@Injectable()
export class TranslatedAlertController {

  constructor(
    public alertCtrl: AlertController,
    public translate: TranslateService,
  ) {}

  present(opts: AlertOptions, nav?: NavOptions, translationOpts: TranslationOptions = {}): Promise<{ dismiss: () => Promise<void> }> {
    let tokens = [
      opts.title,
      opts.subTitle,
      opts.message
    ];
    if (opts.buttons) {
      opts.buttons.forEach((value) => {
        if (this.isAlertButton(value)) {
          tokens.push(value.text);
        }
      });
    }
    if (opts.inputs) {
      opts.inputs.forEach((value) => {
        if (value.placeholder) {
          tokens.push(value.placeholder);
        }
        if (value.label) {
          tokens.push(value.label);
        }
      });
    }

    let cleanTokens = tokens.filter(element => element !== undefined);

    return new Promise(resolve => {
      this.translate.get(cleanTokens, translationOpts).subscribe(translations => {
        let alertOpts: AlertOptions = {
          title: translations[opts.title],
          subTitle: translations[opts.subTitle],
          message: translations[opts.message]
        };
        alertOpts.buttons = [];
        alertOpts.inputs = [];

        if (opts.buttons) {
          opts.buttons.forEach((value) => {
            if (this.isAlertButton(value)) {
              alertOpts.buttons.push({
                text: translations[value.text],
                handler: value.handler
              });
            }
          });
        }
        if (opts.inputs) {
          opts.inputs.forEach((value) => {
            alertOpts.inputs.push({
              name: value.name,
              placeholder: value.placeholder ? translations[value.placeholder] : undefined,
              type: value.type,
              value: value.value,
              label: value.label ? translations[value.label] : undefined,
              checked: value.checked,
              id: value.id
            });
          });
        }

        let alert = this.alertCtrl.create(alertOpts);
        alert.present(nav);
        resolve(alert);
      });
    });
  }

  isAlertButton(arg: any): arg is AlertButton {
    return arg.text !== undefined && arg.handler !== undefined;
  }
}
