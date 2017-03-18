import { Component } from "@angular/core";
import ModalType from "./modals";

import { SourceModalBookPage } from "../source-modal-book/source-modal-book";
import { SourceModalArticlePage } from "../source-modal-article/source-modal-article";
import { SourceModalInternetPage } from "../source-modal-internet/source-modal-internet";
import { SourceModalCdPage } from "../source-modal-cd/source-modal-cd";
import { SourceModalMoviePage } from "../source-modal-movie/source-modal-movie";
import { SourceModalInterviewPage } from "../source-modal-interview/source-modal-interview";

export default function getModalFromType (type: string): Component {
  switch (type) {
    case ModalType.BOOK:
      return SourceModalBookPage;
    case ModalType.ARTICLE:
      return SourceModalArticlePage;
    case ModalType.INTERNET:
      return SourceModalInternetPage;
    case ModalType.CD:
      return SourceModalCdPage;
    case ModalType.MOVIE:
      return SourceModalMoviePage;
    case ModalType.INTERVIEW:
      return SourceModalInterviewPage;
  }
}
