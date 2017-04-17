import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";


@Injectable()
export class References {
  data: ReferenceObject[];

  constructor(
    private http: Http,
  ) {}

  load(): Promise<ReferenceObject[]> {
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
    for (let section of this.data) {
      let img = new Image();
      img.src = section.icon;
    }
  }

  search(q: string): SearchReferenceObject[] {
    let qa = q.trim().split(" ");

    let filteredList: SearchReferenceObject[] = [];

    this.data.forEach(v => {
      let currentObj = {
        title: v.name,
        content: []
      };
      if (this.containsOneOf(qa, v.name)) {
        currentObj.content.push(v);
      }

      v.subPages.forEach(sub => {
        if (sub.header) {
          return;
        }
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

  containsOneOf(wordList: Array<string>, str: string): boolean {
    if (!str || !wordList.length) {
      return false;
    }
    for (let word of wordList) {
      if (str.toLowerCase().indexOf(word.toLowerCase()) > -1) {
      }else {
        return false;
      }
    }
    return true;
  }
}
