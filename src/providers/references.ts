import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";


@Injectable()
export class References {
  data: any;

  constructor(
    private http: Http,
  ) {}

  load() {
    if (this.data) {
      return Promise.resolve(this.data);
    }

    return new Promise(resolve => {
      this.http.get("assets/reference.json")
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          this.loadImages();
          resolve(this.data);
        });
    });
  }

  loadImages() {
    for (var i = 0; i < this.data.length; i++) {
      let img = new Image();
      img.src = this.data[i].icon;
    }
  }
}
