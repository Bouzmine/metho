import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/Rx";

import { HTTP } from "ionic-native";

interface CordovaWindow extends Window {
  cordova: any;
}
declare var window: CordovaWindow;

@Injectable()
export class ReactiveHttp {

  constructor(
    public http: Http
  ) {}

  get(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!!window.cordova) {
        HTTP.get(url, {}, {}).then(success => {
          if (success.status == 200) {
            resolve(JSON.parse(success.data));
          }else {
            reject(success.status);
          }
        }).catch(err => {
          reject(err);
        });
      }else {
        this.http.get(url)
          .timeout(2000, 408)
          .map(res => res.json())
          .subscribe(data => {
            resolve(data);
          }, err => {
            reject(err);
          });
      }
    });
  }

}
