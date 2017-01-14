import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class Attributions {
  public data: any;

  constructor(
    private http: Http,
  ) {}

  load() {
    console.log("load start");
    if (this.data) {
      return Promise.resolve(this.data);
    }

    return new Promise(resolve => {
      this.http.get("assets/attributions.json")
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          console.log("load end");
          resolve(this.data);
        });
    });
  }
}
