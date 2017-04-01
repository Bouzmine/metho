import { Injectable } from "@angular/core";
import { Http } from "@angular/http";

import { HTTP } from "@ionic-native/http";
import { TimeoutError } from "rxjs";

@Injectable()
export default class HTTPMock extends HTTP {
  constructor(public http: Http) {
    super();
  }

  get(url: string): Promise<any> {
    console.info("HTTP: get");
    return new Promise((resolve, reject) => {
      this.http.get(url)
      .timeout(10000)
      .subscribe(data => {
        (data as any).data = (data as any)._body;
        resolve(data);
      }, err => {
        if (err instanceof TimeoutError) {
          err = 408;
        }
        reject(err);
      });
    });
  }
}
