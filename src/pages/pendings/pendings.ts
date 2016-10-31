import { Component } from "@angular/core";

import { NavController, NavParams, ModalController, LoadingController } from "ionic-angular";

import { SourceModalBookPage } from "../source-modal-book/source-modal-book";

import { AppStorage } from "../../providers/app-storage";
import { Fetch } from "../../providers/fetch";
import { Language } from "../../providers/language";
import { TranslatedAlertController } from "../../providers/translated-alert-controller";


@Component({
  selector: "pendings",
  templateUrl: "pendings.html"
})
export class PendingsPage {
  public projectId: string;
  public pendings: Pending[] = [];

  constructor(
    public nav: NavController,
    public params: NavParams,
    public alertCtrl: TranslatedAlertController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public storage: AppStorage,
    public fetch: Fetch,
    public language: Language,
  ) {
    this.projectId = params.get("pId");
  }

  loadPendings(dismissOnEmpty?: boolean) {
    let moment = this.language.getMoment();
    this.storage.getPendingsFromProjectId(this.projectId).then(pendings => {
      this.pendings = pendings.map(pending => {
        pending.datestring = moment(pending.date).format("LL");
        return pending;
      });
      if (dismissOnEmpty && this.pendings.length == 0) {
        this.nav.pop();
      }
    });
  }

  solvePending(pending: Pending) {
    let index = this.pendings.indexOf(pending);
    if (!this.fetch.isISBNCached(pending.isbn)) {
      var loading = this.loadingCtrl.create();
      var isLoading = true;
      loading.present();
    }else {
      var isLoading = false;
    }
    this.fetch.fromISBN(pending.isbn).then(data => {
      if (isLoading) {
        var loadingTransition = loading.dismiss();
      }
      this.pendings[index].isLoaded = true;
      this.pendings[index].data = data;
      this.storage.setPendingFromId(this.pendings[index]._id, this.pendings[index]);
      if (isLoading) {
        loadingTransition.then(() => {
          this.openAfterLoad(data, pending._id);
        });
      }else {
        this.openAfterLoad(data, pending._id);
      }
    }).catch(err => {
      loading.dismiss();
      if (err == 404) {
        this.pendings[index].notAvailable = true;
        this.storage.setPendingFromId(this.pendings[index]._id, this.pendings[index]);
        this.alert404(index);
      }else if (err == 408) {
        this.alert408(pending);
      }else if (err >= 500 && err <= 599) {
        this.alert500();
      }
    });
  }

  openAfterLoad(data: Source, id: string) {
    let modal = this.modalCtrl.create(SourceModalBookPage, {
      data: data,
      projectId: this.projectId,
      pendingId: id,
      hideScan: true
    });

    modal.onWillDismiss(() => {
      this.loadPendings(true);
    });

    modal.present();
  }

  openModalWithBrowser(pending: Pending, transition: Promise<any> = Promise.resolve()) {
    let modal = this.modalCtrl.create(SourceModalBookPage, {
      projectId: this.projectId,
      pendingId: pending._id,
      url: "http://google.ca/search?q=isbn+" + pending.isbn
    });

    modal.onWillDismiss(() => {
      this.loadPendings(true);
    });


    transition.then(() => {
      modal.present();
    });
  }

  deletePending(pending: Pending) {
    this.storage.deletePending(pending._id).then(() => {
      this.loadPendings(true);
    });
  }

  ionViewWillEnter() {
    this.loadPendings();
  }

  alert404(index: number) {
    let alert = this.alertCtrl.present({
      title: "PROJECT.PENDING.POPUP.BOOK_UNAVAILABLE_TITLE",
      message: "PROJECT.PENDING.POPUP.BOOK_UNAVAILABLE_TEXT",
      buttons: [
        {
          text: "PROJECT.PENDING.POPUP.SEARCH",
          handler: () => {
            alert.then(obj => {
              this.openModalWithBrowser(this.pendings[index], obj.dismiss());
            });
            return false;
          }
        },
        {
          text: "PROJECT.PENDING.POPUP.LATER"
        }
      ]
    });
  }

  alert408(pending: Pending) {
    this.alertCtrl.present({
      title: "PROJECT.PENDING.POPUP.TIMEOUT_TITLE",
      message: "PROJECT.PENDING.POPUP.TIMEOUT_TEXT",
      buttons: [
        {
          text: "COMMON.CANCEL"
        },
        {
          text: "PROJECT.PENDING.POPUP.RETRY",
          handler: () => {
            this.solvePending(pending);
          }
        }
      ]
    });
  }

  alert500() {
    this.alertCtrl.present({
      title: "PROJECT.DETAIL.POPUP.ERROR",
      message: "PROJECT.DETAIL.POPUP.ERROR_500",
      buttons: [
        {
          text: "COMMON.OK"
        }
      ]
    });
  }
}
