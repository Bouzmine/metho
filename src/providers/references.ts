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

  search(q: string): any {
    let qa = q.trim().split(" ");

    let filteredList = [];

    this.data.forEach(v => {
      let currentObj = {
        title: v.name,
        id: v.id,
        content: []
      };
      if (this.containsOneOf(qa, v.name)) {
        currentObj.content.push(v);
      }

      v.subPages.forEach(sub => {
        if (this.containsOneOf(qa, sub.name) || this.containsOneOf(qa, sub.text)) {
          currentObj.content.push(sub);
        }
      });

      if (currentObj.content.length > 0) {
        filteredList.push(currentObj);
      }
    });

    return filteredList;
  }

  containsOneOf(qa: Array<string>, str: string): boolean {
    for (var i = 0; i < qa.length; i++) {
      if (str.toLowerCase().indexOf(qa[i].toLowerCase()) > -1) {
      }else {
        return false;
      }
    }
    return true;
  }
}
