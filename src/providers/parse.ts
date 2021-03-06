import { Injectable } from "@angular/core";

import { TranslateService } from "@ngx-translate/core";

import ModalType from "../pages/source-modal/modals";
import { AuthorNumber, MediaType, CivilityTitle } from "../pages/source-modal/source-enums";


@Injectable()
export class Parse {
  constructor(
    public translate: TranslateService,
  ) {}

  parse(source: Source) {
    let sourceToParse = source;
    sourceToParse.parsedSource = "";
    sourceToParse.parsedType = this.parseType(sourceToParse.type);
    sourceToParse.errors = [];
    sourceToParse.warnings = [];

    switch (sourceToParse.type) {
      case ModalType.BOOK:
        return this.parseBook(sourceToParse);
      case ModalType.ARTICLE:
        return this.parseArticle(sourceToParse);
      case ModalType.INTERNET:
        return this.parseInternet(sourceToParse);
      case ModalType.CD:
        return this.parseCd(sourceToParse);
      case ModalType.MOVIE:
        return this.parseMovie(sourceToParse);
      case ModalType.INTERVIEW:
        return this.parseInterview(sourceToParse);
      default:
        return null;
    }
  }

  public addError(errorId: string, variable: string): SourceError {
    return {
      errorTitle: "PROJECT.PARSE." + errorId + ".DESC",
      promptTitle: "PROJECT.PARSE." + errorId + ".TITLE",
      promptText: "PROJECT.PARSE." + errorId + ".TEXT",
      inputs: [
        {
          example: "PROJECT.PARSE." + errorId + ".EXAMPLE",
          var: variable
        }
      ]
    };
  }

  public addMultiInputError(inputs: {errorId: string, variable: string}[], errorId: string): SourceError {
    return {
      errorTitle: "PROJECT.PARSE." + errorId + ".DESC",
      promptTitle: "PROJECT.PARSE." + errorId + ".TITLE",
      promptText: "PROJECT.PARSE." + errorId + ".TEXT",
      inputs: inputs.map(value => {
        return {
          example: "PROJECT.PARSE." + value.errorId + ".EXAMPLE",
          var: value.variable
        };
      })
    };
  }

  public addComplexError(errorId: string, variable: string, complex: ComplexSourceError): SourceError {
    return {
      errorTitle: "PROJECT.PARSE." + errorId + ".DESC",
      promptTitle: "PROJECT.PARSE." + errorId + ".TITLE",
      promptText: "PROJECT.PARSE." + errorId + ".TEXT",
      var: variable,
      complex: true,
      type: complex.type,
      options: complex.options ? complex.options : []
    };
  }

  parseType(type: string): string {
    switch (type) {
      case ModalType.BOOK:
        return "PROJECT.TYPES.BOOK";
      case ModalType.ARTICLE:
        return "PROJECT.TYPES.ARTICLE";
      case ModalType.INTERNET:
        return "PROJECT.TYPES.INTERNET";
      case ModalType.CD:
        return "PROJECT.TYPES.CD_PARSE";
      case ModalType.MOVIE:
        return "PROJECT.TYPES.MOVIE";
      case ModalType.INTERVIEW:
        return "PROJECT.TYPES.INTERVIEW";
    }
  }

  public capitalizeFirstLetter(input: string) {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  public formatDateLocale(str: string): string {
    let datestring = str.replace(/-/g, "\/").replace(/T.+/, ""); // Outputs : "YYYY/MM/DD" to prevent timezone alteration
    return new Date(datestring).toLocaleDateString("fr-CA", {year: "numeric", month: "long", day: "numeric"});
  }

  public format(num: number) {
    let numString = num.toString();
    let after = "";
    let count = 0;
    for (var i = numString.length-1; i >= 0; i--) {
      if (count != 0 && count % 3 == 0) {
        after = numString[i] + " " + after;
      } else {
        after = numString[i] + after;
      }
      count++;
    }
    return after;
  }

  private parseBookOneToThreeAuthors(sourceToParse: Source): Source {
    if (sourceToParse.author1lastname || sourceToParse.author1firstname) {
      if (sourceToParse.author1lastname) {
        sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase().trim() + ", ";
      } else {
        sourceToParse.errors.push(this.addError("FIRST_AUTHOR_LASTNAME", "author1lastname"));
        sourceToParse.parsedSource += "?, ";
      }

      if (sourceToParse.author1firstname) {
        sourceToParse.parsedSource += sourceToParse.author1firstname.trim();
      } else {
        sourceToParse.errors.push(this.addError("FIRST_AUTHOR_FIRSTNAME", "author1firstname"));
        sourceToParse.parsedSource += "?";
      }
    } else {
      sourceToParse.errors.push(this.addMultiInputError([{errorId: "FIRST_AUTHOR_FIRSTNAME", variable: "author1firstname"}, {errorId: "FIRST_AUTHOR_LASTNAME", variable: "author1lastname"}], "FIRST_AUTHOR"));
      sourceToParse.parsedSource += "?";
    }

    if (sourceToParse.author2lastname || sourceToParse.author2firstname) {
      if (sourceToParse.author2lastname) {
        sourceToParse.parsedSource += ", " + sourceToParse.author2lastname.toUpperCase().trim();
      } else {
        sourceToParse.errors.push(this.addError("SECOND_AUTHOR_LASTNAME", "author2lastname"));
        sourceToParse.parsedSource += ", ?";
      }

      if (sourceToParse.author2firstname) {
        sourceToParse.parsedSource += ", " + sourceToParse.author2firstname.trim();
      } else {
        sourceToParse.errors.push(this.addError("SECOND_AUTHOR_FIRSTNAME", "author2firstname"));
        sourceToParse.parsedSource += ", ?";
      }
    }

    if (sourceToParse.author3lastname || sourceToParse.author3firstname) {
      if (sourceToParse.author3firstname) {
        sourceToParse.parsedSource += " et " + sourceToParse.author3firstname.trim();
      } else {
        sourceToParse.errors.push(this.addError("THIRD_AUTHOR_FIRSTNAME", "author3firstname"));
        sourceToParse.parsedSource += " et ?";
      }

      if (sourceToParse.author3lastname) {
        sourceToParse.parsedSource += " " + sourceToParse.author3lastname.toUpperCase().trim() + ". ";
      } else {
        sourceToParse.errors.push(this.addError("THIRD_AUTHOR_LASTNAME", "author3lastname"));
        sourceToParse.parsedSource += " ?. ";
      }
    } else {
      sourceToParse.parsedSource += ". ";
    }

    return sourceToParse;
  }

  private parseBookMoreThanThreeAuthors(sourceToParse: Source): Source {
    if (sourceToParse.author1lastname || sourceToParse.author1firstname) {
      if (sourceToParse.author1lastname) {
        sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase().trim() + ", ";
      } else {
        sourceToParse.errors.push(this.addError("FIRST_AUTHOR_LASTNAME", "author1lastname"));
        sourceToParse.parsedSource += "?, ";
      }

      if (sourceToParse.author1firstname) {
        sourceToParse.parsedSource += sourceToParse.author1firstname.trim();
      } else {
        sourceToParse.errors.push(this.addError("FIRST_AUTHOR_FIRSTNAME", "author1firstname"));
        sourceToParse.parsedSource += "?";
      }
    } else {
      sourceToParse.errors.push(this.addMultiInputError([{errorId: "FIRST_AUTHOR_FIRSTNAME", variable: "author1firstname"}, {errorId: "FIRST_AUTHOR_LASTNAME", variable: "author1lastname"}], "FIRST_AUTHOR"));
      sourceToParse.parsedSource += "?";
    }

    if (sourceToParse.author2lastname || sourceToParse.author2firstname) {
      if (sourceToParse.author2lastname) {
        sourceToParse.parsedSource += ", " + sourceToParse.author2lastname.toUpperCase().trim();
      } else {
        sourceToParse.errors.push(this.addError("SECOND_AUTHOR_LASTNAME", "author2lastname"));
        sourceToParse.parsedSource += "?, ";
      }

      if (sourceToParse.author2firstname) {
        sourceToParse.parsedSource += ", " + sourceToParse.author2firstname.trim();
      } else {
        sourceToParse.errors.push(this.addError("SECOND_AUTHOR_FIRSTNAME", "author2firstname"));
        sourceToParse.parsedSource += "?";
      }

      sourceToParse.parsedSource += " et al. ";
    } else {
      sourceToParse.parsedSource += " et al. ";
    }

    return sourceToParse;
  }

  private parseBookCollectiveAuthors(sourceToParse: Source): Source {
    if (sourceToParse.author1lastname || sourceToParse.author1firstname) {
      if (sourceToParse.author1lastname) {
        sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase().trim() + ", ";
      } else {
        sourceToParse.errors.push(this.addError("FIRST_AUTHOR_LASTNAME", "author1lastname"));
        sourceToParse.parsedSource += "?, ";
      }

      if (sourceToParse.author1firstname) {
        sourceToParse.parsedSource += sourceToParse.author1firstname.trim();
      } else {
        sourceToParse.errors.push(this.addError("FIRST_AUTHOR_FIRSTNAME", "author1firstname"));
        sourceToParse.parsedSource += "?";
      }
    }

    if (sourceToParse.author2lastname || sourceToParse.author2firstname) {
      if (sourceToParse.author2lastname) {
        sourceToParse.parsedSource += ", " + sourceToParse.author2lastname.toUpperCase().trim();
      } else {
        sourceToParse.errors.push(this.addError("SECOND_AUTHOR_LASTNAME", "author2lastname"));
        sourceToParse.parsedSource += ", ?";
      }

      if (sourceToParse.author2firstname) {
        sourceToParse.parsedSource += ", " + sourceToParse.author2firstname.trim();
      } else {
        sourceToParse.errors.push(this.addError("SECOND_AUTHOR_FIRSTNAME", "author2firstname"));
        sourceToParse.parsedSource += ", ?";
      }
      sourceToParse.parsedSource += " (dir.). ";
    } else {
      if (sourceToParse.parsedSource) {
        sourceToParse.parsedSource += " (dir.). ";
      }
    }

    return sourceToParse;
  }

  private parseBook(sourceToParse: Source): Source {
    switch (sourceToParse.hasAuthors) {
      case AuthorNumber.OneToThree:
        sourceToParse = this.parseBookOneToThreeAuthors(sourceToParse);
        break;
      case AuthorNumber.MoreThanThree:
        sourceToParse = this.parseBookMoreThanThreeAuthors(sourceToParse);
        break;
      case AuthorNumber.Collective:
        sourceToParse = this.parseBookCollectiveAuthors(sourceToParse);
        break;
      default:
        sourceToParse.parsedSource += "?. ";
        sourceToParse.errors.push(this.addComplexError("AUTHOR_NUMBER", "hasAuthors", {
          options: [
            {
              text: "PROJECT.PARSE.AUTHOR_NUMBER.AUTHOR_1TO3",
              value: AuthorNumber.OneToThree
            },
            {
              text: "PROJECT.PARSE.AUTHOR_NUMBER.AUTHOR_MORE_3",
              value: AuthorNumber.MoreThanThree
            },
            {
              text: "PROJECT.PARSE.AUTHOR_NUMBER.AUTHOR_COLLECTIVE",
              value: AuthorNumber.Collective
            }
          ],
          type: "select"
        }));
    }

    // Titre
    if (sourceToParse.title) {
      sourceToParse.parsedSource += "<em>" + sourceToParse.title.trim() + "</em>, ";
    } else {
      sourceToParse.errors.push(this.addError("BOOK_TITLE", "title"));
      sourceToParse.parsedSource += "<em>?</em>, ";
    }

    // Édition
    if (sourceToParse.editionNumber) {
      switch (sourceToParse.editionNumber) {
        case 1:
        sourceToParse.parsedSource += "1<sup>re</sup> ";
        break;
        default:
        sourceToParse.parsedSource += sourceToParse.editionNumber + "<sup>e</sup> ";
      }
      sourceToParse.parsedSource += "édition, ";
    }

    // Collection
    if (sourceToParse.collection) {
      sourceToParse.parsedSource += "coll. " + sourceToParse.collection.trim() + ", ";
    }

    // Traduction
    if (sourceToParse.hasBeenTranslated) {
      // Langue
      if (sourceToParse.translatedFrom) {
        if ((/^[aeiou]$/i).test(sourceToParse.translatedFrom.substr(0, 1))) {
          sourceToParse.parsedSource += "trad. de l'" + sourceToParse.translatedFrom.toLowerCase().trim() + " ";
        } else if (sourceToParse.translatedFrom.toLowerCase().substr(0, 1) == "h") {
          var arr_la = ["hawaïen", "hébreu", "hindi"];
          var arr_du = ["hongrois", "huron"];
          if (arr_la.indexOf(sourceToParse.translatedFrom.toLowerCase().trim()) != -1) {
            sourceToParse.parsedSource += "trad. de l'" + sourceToParse.translatedFrom.toLowerCase().trim() + " ";
          } else if (arr_du.indexOf(sourceToParse.translatedFrom.toLowerCase().trim()) != -1) {
            sourceToParse.parsedSource += "trad. du " + sourceToParse.translatedFrom.toLowerCase().trim() + " ";
          } else {
            sourceToParse.parsedSource += "trad. de l'" + sourceToParse.translatedFrom.toLowerCase().trim() + " ";
          }
        } else {
          sourceToParse.parsedSource += "trad. du " + sourceToParse.translatedFrom.toLowerCase().trim() + " ";
        }
      } else {
        sourceToParse.errors.push(this.addError("TRANSLATION_LANGUAGE", "translatedFrom"));
        sourceToParse.parsedSource += "trad. de ? ";
      }

      // Traducteurs
      if (sourceToParse.translator1lastname || sourceToParse.translator1firstname) {
        sourceToParse.parsedSource += "par ";
        // Translator"s first name
        if (sourceToParse.translator1firstname) {
          sourceToParse.parsedSource += sourceToParse.translator1firstname.trim() + " ";
        } else {
          sourceToParse.errors.push(this.addError("FIRST_TRANSLATOR_FIRSTNAME", "translator1firstname"));
          sourceToParse.parsedSource += "? ";
        }
        // Translator"s last name
        if (sourceToParse.translator1lastname) {
          sourceToParse.parsedSource += sourceToParse.translator1lastname.trim();
        } else {
          sourceToParse.errors.push(this.addError("FIRST_TRANSLATOR_LASTNAME", "translator1lastname"));
          sourceToParse.parsedSource += "? ";
        }
      } else {
        sourceToParse.errors.push(this.addMultiInputError([{errorId: "FIRST_TRANSLATOR_FIRSTNAME", variable: "translator1firstname"}, {errorId: "FIRST_TRANSLATOR_LASTNAME", variable: "translator1lastname"}], "FIRST_TRANSLATOR"));
        sourceToParse.parsedSource += "?";
      }

      if (sourceToParse.translator2lastname || sourceToParse.translator2firstname) {
        // Translator 2 first name
        if (sourceToParse.translator2firstname) {
          sourceToParse.parsedSource += ", " + sourceToParse.translator2firstname.trim();
        } else {
          sourceToParse.errors.push(this.addError("SECOND_TRANSLATOR_FIRSTNAME", "translator2firstname"));
          sourceToParse.parsedSource += "?";
        }
        // Translator 2 last name
        if (sourceToParse.translator2lastname) {
          sourceToParse.parsedSource += " " + sourceToParse.translator2lastname.trim() + ", ";
        } else {
          sourceToParse.errors.push(this.addError("SECOND_TRANSLATOR_LASTNAME", "translator2lastname"));
          sourceToParse.parsedSource += "?, ";
        }
      } else {
        sourceToParse.parsedSource += ", ";
      }
    }

    // Lieu
    if (sourceToParse.publicationLocation) {
      sourceToParse.parsedSource += this.capitalizeFirstLetter(sourceToParse.publicationLocation.trim()) + ", ";
    } else {
      sourceToParse.parsedSource += "s.l., ";
      sourceToParse.warnings.push(this.addError("EDITION_LOCATION", "publicationLocation"));
    }

    // Éditeur
    if (sourceToParse.editor) {
      sourceToParse.parsedSource += sourceToParse.editor.trim() + ", ";
    } else {
      sourceToParse.parsedSource += "?, ";
      sourceToParse.errors.push(this.addError("EDITOR", "editor"));
    }

    // Date
    if (sourceToParse.publicationDate) {
      sourceToParse.parsedSource += sourceToParse.publicationDate + ", ";
      var today = new Date();
      if (today.getFullYear() < Number(sourceToParse.publicationDate)) {
        sourceToParse.warnings.push(this.addError("EDITION_DATE_TOO_HIGH", "publicationDate"));
      }
    } else {
      sourceToParse.parsedSource += "s.d., ";
      sourceToParse.warnings.push(this.addError("EDITION_DATE", "publicationDate"));
    }

    // Volume
    if (sourceToParse.volumeNumber) {
      sourceToParse.parsedSource += "vol. " + sourceToParse.volumeNumber + ", ";
    }

    // Nombre de pages
    let pageNumber = Number(sourceToParse.pageNumber);
    if (pageNumber && !isNaN(pageNumber)) {
      if (pageNumber >= 1000) {
        sourceToParse.parsedSource += this.format(pageNumber) + " p.";
      }else {
        sourceToParse.parsedSource += pageNumber + " p.";
      }

      if (pageNumber > 15000) {
        sourceToParse.warnings.push(this.addError("PAGE_NUMBER_TOO_HIGH", "pageNumber"));
      } else if (pageNumber <= 0) {
        sourceToParse.warnings.push(this.addError("PAGE_NUMBER_TOO_LOW", "pageNumber"));
      }
      sourceToParse.pageNumber = pageNumber;
    } else {
      sourceToParse.parsedSource += "? p.";
      sourceToParse.pageNumber = "";
      sourceToParse.errors.push(this.addError("PAGE_NUMBER", "pageNumber"));
    }
    return sourceToParse;
  }

  private parseArticle(sourceToParse: Source): Source {
    sourceToParse = this.parseBookOneToThreeAuthors(sourceToParse);

    // Titre de l"Article
    if (sourceToParse.title) {
      sourceToParse.parsedSource += "«" + sourceToParse.title + "», ";
    } else {
      sourceToParse.parsedSource += "«?», ";
      sourceToParse.errors.push(this.addError("ARTICLE_TITLE", "title"));
    }

    // Nom du périodique
    if (sourceToParse.editor) {
      sourceToParse.parsedSource += "<em>" + sourceToParse.editor + "</em>, ";
    } else {
      sourceToParse.parsedSource += "<em>?</em>, ";
      sourceToParse.errors.push(this.addError("PERIODIC_NAME", "editor"));
    }

    // Numéro du périodique
    if (sourceToParse.editionNumber) {
      sourceToParse.parsedSource += sourceToParse.editionNumber + ", ";
    } else {
      sourceToParse.parsedSource += "?, ";
      sourceToParse.errors.push(this.addError("PERIODIC_NUMBER", "editionNumber"));
    }

    // Date de publication
    if (sourceToParse.publicationDate) {
      sourceToParse.parsedSource += sourceToParse.publicationDate + ", ";
    } else {
      sourceToParse.parsedSource += "?, ";
      sourceToParse.errors.push(this.addError("EDITION_DATE", "publicationDate"));
    }

    // Indication des pages
    if (sourceToParse.endPage || sourceToParse.startPage) {
      if (sourceToParse.startPage) {
        sourceToParse.parsedSource += "p. " + sourceToParse.startPage;
      } else {
        sourceToParse.parsedSource += "p. ?";
        sourceToParse.errors.push(this.addError("START_PAGE", "startPage"));
      }
      sourceToParse.parsedSource += "-";

      if (sourceToParse.endPage) {
        sourceToParse.parsedSource += sourceToParse.endPage;
      } else {
        sourceToParse.parsedSource += "?";
        sourceToParse.errors.push(this.addError("END_PAGE", "endPage"));
      }
      sourceToParse.parsedSource += ".";
    } else {
      sourceToParse.parsedSource += "p. ?-?.";
      sourceToParse.errors.push(this.addMultiInputError([{errorId: "START_PAGE", variable: "startPage"}, {errorId: "END_PAGE", variable: "endPage"}], "START_END_PAGE"));
    }

    return sourceToParse;
  }

  private parseInternet(sourceToParse: Source): Source {
    if (sourceToParse.hasAuthors) {
      if (sourceToParse.author1lastname || sourceToParse.author1firstname) {
        // Author last name
        if (sourceToParse.author1lastname) {
          sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase().trim() + ", ";
        } else {
          sourceToParse.errors.push(this.addError("FIRST_AUTHOR_LASTNAME", "author1lastname"));
          sourceToParse.parsedSource += "?, ";
        }
        // Author first name
        if (sourceToParse.author1firstname) {
          sourceToParse.parsedSource += sourceToParse.author1firstname.trim() + ". ";
        } else {
          sourceToParse.errors.push(this.addError("FIRST_AUTHOR_FIRSTNAME", "author1firstname"));
          sourceToParse.parsedSource += "?. ";
        }
      } else {
        sourceToParse.errors.push(this.addMultiInputError([{errorId: "FIRST_AUTHOR_FIRSTNAME", variable: "author1firstname"}, {errorId: "FIRST_AUTHOR_LASTNAME", variable: "author1lastname"}], "FIRST_AUTHOR"));
        sourceToParse.parsedSource += "?. ";
      }
    } else {
      if (sourceToParse.editor) {
        sourceToParse.parsedSource += "<em>" + sourceToParse.editor + "</em>, ";
      } else {
        sourceToParse.parsedSource += "?, ";
        sourceToParse.errors.push(this.addError("HOMEPAGE_TITLE", "editor"));
      }
    }

    // Titre de l"article
    if (sourceToParse.title) {
      sourceToParse.parsedSource += "«" + sourceToParse.title + "», ";
    } else {
      sourceToParse.parsedSource += "«?», ";
      sourceToParse.errors.push(this.addError("PAGE_TITLE", "title"));
    }

    // Titre de la page d'accueil (si il y a des auteurs)
    if (sourceToParse.hasAuthors) {
      if (sourceToParse.editor) {
        sourceToParse.parsedSource += "<em>" + sourceToParse.editor + "</em>, ";
      } else {
        sourceToParse.parsedSource += "<em>?</em>, ";
        sourceToParse.errors.push(this.addError("HOMEPAGE_TITLE", "editor"));
      }
    }

    // Type de support
    sourceToParse.parsedSource += "[en ligne]. ";

    // URL
    if (sourceToParse.url) {
      if (sourceToParse.url.search(/^((http|https):\/\/){1}(www\.){1}[^\/._]{2,}\.{1}[a-z]{2,}$/) != -1) {
        sourceToParse.parsedSource += "[" + sourceToParse.url + "] ";
      }else if (sourceToParse.url.search(/^((http|https):\/\/)?(www\.)?[^\/_]{2,}\.{1}[a-z]{2,}(\/.*)?$/i) != -1) {
        var http = sourceToParse.url.search(/^(http:\/\/){1}/);
        var https = sourceToParse.url.search(/^(https:\/\/){1}/);
        sourceToParse.url = sourceToParse.url.replace(/www.|http:\/\/|https:\/\//gi, "");
        let slashIndex = sourceToParse.url.search(/\/.*$/);
        if (slashIndex != -1) {
          let afterSlash = slashIndex - sourceToParse.url.length;
          sourceToParse.url = sourceToParse.url.slice(0, afterSlash);
          console.log(sourceToParse.url);
        }

        sourceToParse.url = "www." + sourceToParse.url;

        if (http != -1) {
          sourceToParse.url = "http://" + sourceToParse.url;
        }else if (https != -1) {
          sourceToParse.url = "https://" + sourceToParse.url;
        }else {
          sourceToParse.url = "http://" + sourceToParse.url;
        }

        sourceToParse.parsedSource += "[" + sourceToParse.url + "] ";
      }else {
        sourceToParse.parsedSource += "[" + sourceToParse.url + "] ";
        sourceToParse.warnings.push(this.addError("INVALID_URL", "url"));
      }
    } else {
      sourceToParse.parsedSource += "[?] ";
      sourceToParse.errors.push(this.addError("URL", "url"));
    }

    // Date de consultation
    if (sourceToParse.consultationDate) {
      sourceToParse.parsedSource += "(" + this.formatDateLocale(sourceToParse.consultationDate) + ")";
    } else {
      sourceToParse.parsedSource += "(?)";
    }

    return sourceToParse;
  }

  private parseCd(sourceToParse: Source): Source {
    if (sourceToParse.hasAuthors) {
      if (sourceToParse.author1lastname || sourceToParse.author1firstname) {
        // Author last name
        if (sourceToParse.author1lastname) {
          sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase().trim() + ", ";
        } else {
          sourceToParse.errors.push(this.addError("FIRST_AUTHOR_LASTNAME", "author1lastname"));
          sourceToParse.parsedSource += "?, ";
        }
        // Author first name
        if (sourceToParse.author1firstname) {
          sourceToParse.parsedSource += sourceToParse.author1firstname.trim();
        } else {
          sourceToParse.errors.push(this.addError("FIRST_AUTHOR_FIRSTNAME", "author1firstname"));
          sourceToParse.parsedSource += "?";
        }
      } else {
        sourceToParse.errors.push(this.addMultiInputError([{errorId: "FIRST_AUTHOR_FIRSTNAME", variable: "author1firstname"}, {errorId: "FIRST_AUTHOR_LASTNAME", variable: "author1lastname"}], "FIRST_AUTHOR"));
        sourceToParse.parsedSource += "?";
      }

      if (sourceToParse.author2lastname || sourceToParse.author2firstname) {
        // Author 2 last name
        if (sourceToParse.author2lastname) {
          sourceToParse.parsedSource += ", " + sourceToParse.author2lastname.toUpperCase().trim();
        } else {
          sourceToParse.errors.push(this.addError("SECOND_AUTHOR_LASTNAME", "author2lastname"));
          sourceToParse.parsedSource += ", ?";
        }
        // Author 2 first name
        if (sourceToParse.author2firstname) {
          sourceToParse.parsedSource += ", " + sourceToParse.author2firstname.trim() + ". ";
        } else {
          sourceToParse.errors.push(this.addError("SECOND_AUTHOR_FIRSTNAME", "author2firstname"));
          sourceToParse.parsedSource += ", ?. ";
        }
      }else {
        sourceToParse.parsedSource += ". ";
      }
    }

    // Titre de l"article
    if (sourceToParse.title) {
      sourceToParse.parsedSource += "<em>" + sourceToParse.title + "</em>, ";
    } else {
      sourceToParse.parsedSource += "<em>?</em>, ";
      sourceToParse.errors.push(this.addError("DOCUMENT_TITLE", "title"));
    }

    // Type de support
    sourceToParse.parsedSource += "[cédérom], ";

    // Lieu de publication
    if (sourceToParse.publicationLocation) {
      sourceToParse.parsedSource += sourceToParse.publicationLocation + ", ";
    } else {
      sourceToParse.parsedSource += "s.l., ";
      sourceToParse.warnings.push(this.addError("PUBLICATION_LOCATION", "publicationLocation"));
    }

    // Éditeur
    if (sourceToParse.editor) {
      sourceToParse.parsedSource += sourceToParse.editor + ", ";
    } else {
      sourceToParse.parsedSource += "?, ";
      sourceToParse.errors.push(this.addError("EDITOR", "editor"));
    }

    // Date de publication
    if (sourceToParse.publicationDate) {
      sourceToParse.parsedSource += sourceToParse.publicationDate + ".";
    } else {
      sourceToParse.parsedSource += "s.d.";
      sourceToParse.warnings.push(this.addError("PUBLICATION_DATE", "publicationDate"));
    }

    return sourceToParse;
  }

  private parseMovie(sourceToParse: Source): Source {
    if (sourceToParse.author1lastname || sourceToParse.author1firstname) {
      // Author last name
      if (sourceToParse.author1lastname) {
        sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase().trim() + ", ";
      } else {
        sourceToParse.errors.push(this.addError("DIRECTOR_LASTNAME", "author1lastname"));
        sourceToParse.parsedSource += "?, ";
      }
      // Author first name
      if (sourceToParse.author1firstname) {
        sourceToParse.parsedSource += sourceToParse.author1firstname.trim();
      } else {
        sourceToParse.errors.push(this.addError("DIRECTOR_FIRSTNAME", "author1firstname"));
        sourceToParse.parsedSource += "?";
      }
    } else {
      sourceToParse.errors.push(this.addMultiInputError([{errorId: "DIRECTOR_FIRSTNAME", variable: "author1firstname"}, {errorId: "DIRECTOR_LASTNAME", variable: "author1lastname"}], "DIRECTOR"));
      sourceToParse.parsedSource += "?";
    }

    if (sourceToParse.hasAuthors) {
      sourceToParse.parsedSource += " et al. ";
    } else {
      sourceToParse.parsedSource += ". ";
    }

    // Titre de l"épisode
    if (sourceToParse.episodeTitle) {
      sourceToParse.parsedSource += "«" + sourceToParse.episodeTitle + "», ";
    }

    // Nom de l"émission ou du document
    if (sourceToParse.title) {
      sourceToParse.parsedSource += "<em>" + sourceToParse.title + "</em>, ";
    } else {
      sourceToParse.parsedSource += "<em>?</em>, ";
      sourceToParse.errors.push(this.addError("EMISSION_TITLE", "title"));
    }

    // Lieu de production
    if (sourceToParse.productionLocation) {
      sourceToParse.parsedSource += sourceToParse.productionLocation + ", ";
    } else {
      sourceToParse.parsedSource += "s.l., ";
      sourceToParse.warnings.push(this.addError("PRODUCTION_LOCATION", "productionLocation"));
    }

    // Producteur
    if (sourceToParse.productor) {
      sourceToParse.parsedSource += sourceToParse.productor + ", ";
    } else {
      sourceToParse.parsedSource += "?, ";
      sourceToParse.errors.push(this.addError("PRODUCTOR", "productor"));
    }

    // Diffuseur
    if (sourceToParse.broadcaster) {
      sourceToParse.parsedSource += sourceToParse.broadcaster + ", ";
    } else {
      sourceToParse.warnings.push(this.addError("BROADCASTER", "broadcaster"));
    }

    // Durée
    if (sourceToParse.duration) {
      sourceToParse.parsedSource += sourceToParse.duration + " min., ";
    } else {
      sourceToParse.parsedSource += "?, ";
      sourceToParse.errors.push(this.addError("LENGTH", "duration"));
    }

    // Date de publication
    if (sourceToParse.publicationDate) {
      sourceToParse.parsedSource += sourceToParse.publicationDate;
    } else {
      sourceToParse.warnings.push(this.addError("PUBLICATION_DATE", "publicationDate"));
      sourceToParse.parsedSource += "s.d.";
    }

    // Support
    if (sourceToParse.support) {
      switch (sourceToParse.support) {
        case MediaType.DVD:
          sourceToParse.parsedSource += ", [DVD]";
          break;
        case MediaType.CD:
          sourceToParse.parsedSource += ", [CD]";
          break;
        case MediaType.INTERNET:
          sourceToParse.parsedSource += ", [en ligne]";
          break;
      }
    }else {
      sourceToParse.warnings.push(this.addComplexError("SUPPORT", "support", {
        type: "select",
        options: [
          {
            text: "PROJECT.DETAIL.MODAL.MOVIE.SUPPORT_DVD",
            value: MediaType.DVD
          },
          {
            text: "PROJECT.DETAIL.MODAL.MOVIE.SUPPORT_CD",
            value: MediaType.CD
          },
          {
            text: "PROJECT.DETAIL.MODAL.MOVIE.SUPPORT_INTERNET",
            value: MediaType.INTERNET
          }
        ]
      }));
    }

    // Date de visionnement
    if (sourceToParse.consultationDate) {
      sourceToParse.parsedSource += ", (" + this.formatDateLocale(sourceToParse.consultationDate) + ")";
    }

    sourceToParse.parsedSource += sourceToParse.parsedSource.endsWith(".") ? "" : ".";

    return sourceToParse;
  }

  private parseInterview(sourceToParse: Source): Source {
    sourceToParse.title = "";
    if (sourceToParse.author1lastname || sourceToParse.author1firstname) {
      // Author last name
      if (sourceToParse.author1lastname) {
        sourceToParse.parsedSource += sourceToParse.author1lastname.toUpperCase().trim() + ", ";
      } else {
        sourceToParse.errors.push(this.addError("INTERVIEWER_LASTNAME", "author1lastname"));
        sourceToParse.parsedSource += "?, ";
      }
      // Author first name
      if (sourceToParse.author1firstname) {
        sourceToParse.parsedSource += sourceToParse.author1firstname.trim() + ". ";
      } else {
        sourceToParse.errors.push(this.addError("INTERVIEWER_FIRSTNAME", "author1firstname"));
        sourceToParse.parsedSource += "?. ";
      }
    } else {
      sourceToParse.errors.push(this.addMultiInputError([{errorId: "INTERVIEWER_FIRSTNAME", variable: "author1firstname"}, {errorId: "INTERVIEWER_LASTNAME", variable: "author1lastname"}], "INTERVIEWER"));
      sourceToParse.parsedSource += "?. ";
    }
    // Texte
    sourceToParse.parsedSource += "Entrevue avec ";
    // Titre de civilité
    switch (sourceToParse.civility) {
      case CivilityTitle.Mr:
      sourceToParse.parsedSource += "M. ";
      break;
      case CivilityTitle.Ms:
      sourceToParse.parsedSource += "M<sup>me</sup> ";
      break;
      case CivilityTitle.Mlle:
      sourceToParse.parsedSource += "M<sup>lle</sup> ";
      break;
      default:
      sourceToParse.errors.push(this.addComplexError("CIVILITY_TITLE", "civility", {
        options: [
          {
            text: "PROJECT.DETAIL.MODAL.INTERVIEW.CIVILITY_MISTER",
            value: CivilityTitle.Mr
          },
          {
            text: "PROJECT.DETAIL.MODAL.INTERVIEW.CIVILITY_MISS",
            value: CivilityTitle.Ms
          },
          {
            text: "PROJECT.DETAIL.MODAL.INTERVIEW.CIVILITY_MISS_YOUNG",
            value: CivilityTitle.Mlle
          }
        ],
        type: "select"
      }));
      sourceToParse.parsedSource += "? ";
    }
    // Personne rencontrée
    if (sourceToParse.interviewed1lastname || sourceToParse.interviewed1firstname) {
      // interviewed first name
      if (sourceToParse.interviewed1firstname) {
        sourceToParse.parsedSource += sourceToParse.interviewed1firstname.trim() + " ";
        sourceToParse.title += sourceToParse.interviewed1firstname.trim() + " ";
      } else {
        sourceToParse.errors.push(this.addError("INTERVIEWED_FIRSTNAME", "interviewed1firstname"));
        sourceToParse.parsedSource += "? ";
        sourceToParse.title += "? ";
      }
      // interviewed last name
      if (sourceToParse.interviewed1lastname) {
        sourceToParse.parsedSource += sourceToParse.interviewed1lastname.trim() + ", ";
        sourceToParse.title += sourceToParse.interviewed1lastname.trim();
      } else {
        sourceToParse.errors.push(this.addError("INTERVIEWED_LASTNAME", "interviewed1lastname"));
        sourceToParse.parsedSource += "?, ";
        sourceToParse.title += "?";
      }
    } else {
      sourceToParse.errors.push(this.addMultiInputError([{errorId: "INTERVIEWED_FIRSTNAME", variable: "interviewed1firstname"}, {errorId: "INTERVIEWED_LASTNAME", variable: "interviewed1lastname"}], "INTERVIEWED"));
      sourceToParse.parsedSource += "?, ";
    }

    // Titre de la personne
    if (sourceToParse.interviewedTitle) {
      sourceToParse.parsedSource += sourceToParse.interviewedTitle + ", ";
    } else {
      sourceToParse.parsedSource += "?, ";
      sourceToParse.errors.push(this.addError("INTERVIEWED_TITLE", "interviewedTitle"));
    }

    // Location
    if (sourceToParse.publicationLocation) {
      sourceToParse.parsedSource += sourceToParse.publicationLocation + ", ";
    } else {
      sourceToParse.parsedSource += "?, ";
      sourceToParse.errors.push(this.addError("INTERVIEW_LOCATION", "publicationLocation"));
    }

    // Date de l"entrevue
    if (sourceToParse.consultationDate) {
      sourceToParse.parsedSource += "le " + this.formatDateLocale(sourceToParse.consultationDate) + ".";
    } else {
      sourceToParse.parsedSource += "le ?.";
    }

    return sourceToParse;
  }
}
