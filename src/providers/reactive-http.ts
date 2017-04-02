import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { TimeoutError } from "rxjs";

import { HTTP } from "@ionic-native/http";


@Injectable()
export class ReactiveHttp {

  constructor(
    public http: Http,
    public nativeHttp: HTTP,
  ) {}

  get(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if ("cordova" in window) {
        this.nativeHttp.get(url, {}, {}).then(success => {
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
          .timeout(2000)
          .map(res => res.json())
          .subscribe(data => {
            resolve(data);
          }, err => {
            if (err instanceof TimeoutError) {
              err = 408;
            }
            reject(err);
          });
      }
    });
  }

}
