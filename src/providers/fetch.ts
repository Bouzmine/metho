import { Injectable } from "@angular/core";

import { ReactiveHttp } from "./reactive-http";


@Injectable()
export class Fetch {
  public cacheByISBN: any = {};
  public cacheByName: any = {};
  public cacheByNameWithAuthors: any = {};
  public ISBNdbApiKeys: Array<string> = [
    "S07CWYQY",
    "YVFT6RLV"
  ];

  constructor(
    public http: ReactiveHttp
  ) {}

  fromISBN(isbn: string) {
    if (this.cacheByISBN[isbn]) {
      return Promise.resolve(this.cacheByISBN[isbn]);
    }

    return this.fromISBNdbByIsbn(isbn);
  }

  isISBNCached(isbn: string) {
    if (this.cacheByISBN[isbn]) {
      return true;
    }else {
      return false;
    }
  }

  fromName(name: string, includeAuthors: boolean) {
    name = encodeURI(name);

    if (includeAuthors) {
      if (this.cacheByNameWithAuthors[name]) {
        return Promise.resolve(this.cacheByNameWithAuthors[name]);
      }
    }else {
      if (this.cacheByName[name]) {
        return Promise.resolve(this.cacheByName[name]);
      }
    }

    return this.fromISBNdbByName(name, includeAuthors);
  }

  fromOpenLibraryByIsbn(isbn) {
    return new Promise((resolve, reject) => {
      this.http.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`).then(response => {
        if (`ISBN:${isbn}` in response) {
          let parsed = this.parseFromOpenLibrary(response[`ISBN:${isbn}`]);
          this.cacheByISBN[isbn] = parsed;
          resolve(parsed);
        }else {
          reject(404);
        }
      }).catch(error => {
        reject(error);
      });
    });
  }

  fromISBNdbByIsbn(isbn) {
    return new Promise((resolve, reject) => {
      this.http.get("http://isbndb.com/api/v2/json/" + this.pickISBNdbApiKey() + "/book/" + isbn).then(response => {
        if (!!response.error) {
          reject(404);
        }else {
          let parsed = this.parseFromISBNdb(response.data[0]);
          this.cacheByISBN[isbn] = parsed;
          resolve(parsed);
        }
      }).catch(error => {
        reject(error);
      });
    });
  }

  fromISBNdbByName(name, includeAuthors) {
    return new Promise((resolve, reject) => {
      if (includeAuthors) {
        this.http.get("http://isbndb.com/api/v2/json/" + this.pickISBNdbApiKey() + "/books?q=" + name + "&i=combined").then(response => {
          if (!!response.data.error) {
            reject(404);
          }else {
            let books = [];
            response.data.forEach(book => {
              books.push(this.parseFromISBNdb(book));
            });
            this.cacheByNameWithAuthors[name] = books;
            resolve(books);
          }
        }).catch(error => {
          reject(error);
        });
      }else {
        this.http.get("http://isbndb.com/api/v2/json/" + this.pickISBNdbApiKey() + "/books?q=" + name + "&i=combined").then(response => {
          if (!!response.error) {
            reject(404);
          }else {
            let books = [];
            response.data.forEach(book => {
              books.push(this.parseFromISBNdb(book));
            });
            this.cacheByName[name] = books;
            resolve(books);
          }
        }).catch(error => {
          reject(error);
        });
      }
    });
  }

  parseFromISBNdb(response: any): Source {
    var newobj: any = {};
    // Titre
    if (response.title.toUpperCase() == response.title) {
      newobj.title = this.capitalizeEveryFirstLetter(response.title.replace(/\ufffd/g, "é").trim().toLowerCase());
    }else if (response.title.toLowerCase() == response.title) {
      newobj.title = this.capitalizeEveryFirstLetter(response.title.replace(/\ufffd/g, "é").trim());
    }else {
      newobj.title = response.title.replace(/\ufffd/g, "é").trim();
    }
    // Publisher/Editor
    newobj.editor = this.capitalizeEveryFirstLetter(response.publisher_name.replace(/\ufffd/g, "é").trim().toLowerCase());
    // Date de publication
    if (!!response.edition_info && response.edition_info.match(/[0-9]{4}/)) {
      newobj.publicationDate = response.edition_info.match(/[0-9]{4}/)[0].trim();
    } else if (!!response.publisher_text && response.publisher_text.match(/[0-9]{4}/)) {
      newobj.publicationDate = response.publisher_text.match(/[0-9]{4}/)[0].trim();
    } else {
      newobj.publicationDate = "";
    }

    // Lieu de publication
    if (response.publisher_text != "") {
      newobj.publicationLocation = this.capitalizeEveryFirstLetter(response.publisher_text.replace(/\ufffd/g, "é").replace(response.publisher_name, "").replace(newobj.publicationDate, "").replace(/[^a-zA-z\s]/g, "").trim().toLowerCase());
    }
    // Nombre de pages
    if (response.physical_description_text != "") {
      var arr_pages = response.physical_description_text.split(" ");
      if (arr_pages.indexOf("p.") != -1) {
        newobj.pageNumber = arr_pages[arr_pages.indexOf("p.") - 1];
      } else if (arr_pages.indexOf("pages") != -1) {
        newobj.pageNumber = arr_pages[arr_pages.indexOf("pages") - 1];
      }
    }
    // Auteur
    if (response.author_data.length) {
      for (var i = 0; i < response.author_data.length; i++) {
        if (response.author_data[i].name.split(",")[0] == response.author_data[i].name) {
          newobj["author" + String(i + 1) + "firstname"] = this.capitalizeFirstLetter(response.author_data[i].name.split(" ")[0].replace(/\ufffd/g, "é").trim());
          if (response.author_data[i].name.split(" ").length > 1) {
            newobj["author" + String(i + 1) + "lastname"] = this.capitalizeFirstLetter(response.author_data[i].name.split(" ")[1].replace(/\ufffd/g, "é").trim());
          }
        } else {
          newobj["author" + String(i + 1) + "lastname"] = this.capitalizeFirstLetter(response.author_data[i].name.split(",")[0].replace(/\ufffd/g, "é").trim());
          newobj["author" + String(i + 1) + "firstname"] = this.capitalizeFirstLetter(response.author_data[i].name.split(",")[1].replace(/\ufffd/g, "é").trim());
        }
      }
      if (response.author_data.length > 3) {
        newobj.hasAuthors = "more3";
      }else if (response.author_data.length == 0) {
        newobj.hasAuthors = "collective";
      }else {
        newobj.hasAuthors = "13";
      }
    }

    return newobj;
  }

  parseFromOpenLibrary(response: any): Source {
    let newobj: any = {};

    // Titre
    if (response.title.toUpperCase() == response.title) {
      newobj.title = this.capitalizeEveryFirstLetter(response.title.trim().toLowerCase());
    }else if (response.title.toLowerCase() == response.title) {
      newobj.title = this.capitalizeEveryFirstLetter(response.title.trim());
    }else {
      newobj.title = response.title.trim();
    }
    // Publisher/Editor
    if (response.publishers.length) {
      newobj.editor = this.capitalizeEveryFirstLetter(response.publishers[0].name.trim().toLowerCase());
    }
    // Date de publication
    if (response.publish_date) {
      newobj.publicationDate = response.publish_date;
    } else {
      newobj.publicationDate = "";
    }

    // Lieu de publication
    if ("publish_places" in response && response.publish_places.length) {
      newobj.publicationLocation = this.capitalizeEveryFirstLetter(response.publish_places[0].name.trim());
    }
    // Nombre de pages
    if (response.number_of_pages) {
      newobj.pageNumber = response.number_of_pages;
    }else if (response.pagination) {
      var arr_pages = response.pagination.split(" ");
      if (arr_pages.indexOf("p.") != -1) {
        newobj.pageNumber = arr_pages[arr_pages.indexOf("p.") - 1];
      } else if (arr_pages.indexOf("pages") != -1) {
        newobj.pageNumber = arr_pages[arr_pages.indexOf("pages") - 1];
      }
    }
    // Auteur
    if ("authors" in response && response.authors.length) {
      for (var i = 0; i < response.authors.length; i++) {
        if (response.authors[i].name.split(",")[0] == response.authors[i].name) {
          let spaceSeparated = response.authors[i].name.split(" ");
          if (spaceSeparated.length > 1) {
            var firstName = [...spaceSeparated].splice(0, spaceSeparated.length - 1).join(" ");
          }else {
            var firstName = <string>spaceSeparated[0];
          }

          newobj["author" + String(i + 1) + "firstname"] = this.capitalizeFirstLetter(firstName.trim());
          if (spaceSeparated.length > 1) {
            newobj["author" + String(i + 1) + "lastname"] = this.capitalizeFirstLetter(spaceSeparated[spaceSeparated.length - 1].trim());
          }
        } else {
          newobj["author" + String(i + 1) + "lastname"] = this.capitalizeFirstLetter(response.authors[i].name.split(",")[0].trim());
          newobj["author" + String(i + 1) + "firstname"] = this.capitalizeFirstLetter(response.authors[i].name.split(",")[1].trim());
        }
      }
      if (response.authors.length > 3) {
        newobj.hasAuthors = "more3";
      }else if (response.authors.length == 0) {
        newobj.hasAuthors = "collective";
      }else {
        newobj.hasAuthors = "13";
      }
    }

    return newobj;
  }

  pickISBNdbApiKey(): string {
    let index = Math.floor(Math.random()*(this.ISBNdbApiKeys.length-1-0+1)+0);
    return this.ISBNdbApiKeys[index];
  }

  capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  capitalizeEveryFirstLetter(str: string) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }
}
