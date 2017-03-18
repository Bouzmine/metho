import { Injectable } from "@angular/core";

import { ModalController, LoadingController } from "ionic-angular";
import { BarcodeScanner } from "ionic-native";

import { BoardingScanPage } from "../pages/boarding-scan/boarding-scan";

import { Fetch } from "./fetch";
import { Report } from "./report";
import { Settings } from "./settings";
import { TranslatedAlertController } from "./translated-alert-controller";


@Injectable()
export class Scan {

  constructor(
    public alertCtrl: TranslatedAlertController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public fetch: Fetch,
    public report: Report,
    public settings: Settings,
  ) {}

  scan(): Promise<ScanResponse> {
    return new Promise((resolve, reject) => {
      if (!this.settings.get(Settings.wasScanBoardingShown)) {
        let modal = this.modalCtrl.create(BoardingScanPage);
        modal.onDidDismiss(() => {
          this.openScanner()
          .then((data) => resolve(data))
          .catch(err => reject(err));
        });
        this.settings.set(Settings.wasScanBoardingShown, true);
        modal.present();
      }else {
        this.openScanner()
        .then((data) => resolve(data))
        .catch(err => reject(err));
      }
    });
  }

  public openScanner(): Promise<ScanResponse> {
    return new Promise((resolve, reject) => {
      BarcodeScanner.scan().then((data: BarcodeScannerResponse) => {
        if (!data.cancelled) {
          if (data.format == "EAN_13") {
            this.fetchFromISBN(data.text).then(data => {
              resolve(data);
            });
          }else {
            this.alertWrongBarcode(resolve);
          }
        }
      }).catch((err) => {
        this.alertScanUnavailable(resolve);
      });
    });
  }

  public fetchFromISBN(isbn: string, transition: Promise<void> = Promise.resolve()): Promise<ScanResponse> {
    return new Promise((resolve, reject) => {
      transition.then(() => {
        if (navigator.onLine) {
          if (!this.fetch.isISBNCached(isbn)) {
            var loading = this.loadingCtrl.create();
            var isLoading = true;
            loading.present();
          }else {
            var isLoading = false;
          }
          this.fetch.fromISBN(isbn).then((response) => {
            if (isLoading) {
              var loadingTransition = loading.dismiss();
            }
            resolve({
              data: response,
              transition: loadingTransition || Promise.resolve()
            });
          }).catch((response) => {
            var transition = <Promise<void>>Promise.resolve();
            if (isLoading) {
              transition = loading.dismiss();
            }
            transition.then(() => {
              switch (response) {
                case 404:
                this.alert404(resolve);
                break;
                case 408:
                this.alert408(resolve, isbn);
                break;
                case 500:
                this.alert500(resolve);
                break;
                default:
                resolve({});
                this.report.report(response);
              }
            });
          });
        }else {
          this.alertOffline(resolve, isbn);
        }
      });
    });
  }

  public alert404(resolve: (data: any) => any) {
    let alert = this.alertCtrl.present({
      title: "PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE",
      message: "PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TEXT",
      buttons: [
        {
          text: "COMMON.OK",
          handler: () => {
            resolve({});
          }
        }
      ]
    });
  }

  public alert408(resolve: (data: any) => void, isbn: string) {
    let alert = this.alertCtrl.present({
      title: "PROJECT.DETAIL.POPUP.TIMEOUT_TITLE",
      message: "PROJECT.DETAIL.POPUP.TIMEOUT_TEXT",
      buttons: [
        {
          text: "PROJECT.DETAIL.POPUP.RETRY",
          handler: () => {
            alert.then(obj => {
              this.fetchFromISBN(isbn, obj.dismiss()).then((response) => {
                resolve(response);
              });
            });
            return false;
          }
        },
        {
          text: "PROJECT.DETAIL.POPUP.ADD",
          handler: () => {
            alert.then(obj => {
              resolve({
                isbn: isbn,
                addPending: true,
                transition: obj.dismiss()
              });
            });
            return false;
          }
        }
      ]
    });
  }

  public alert500(resolve: (data: any) => void) {
    let alert = this.alertCtrl.present({
      title: "PROJECT.DETAIL.POPUP.ERROR",
      message: "PROJECT.DETAIL.POPUP.ERROR_500",
      buttons: [
        {
          text: "COMMON.OK",
          handler: () => {
            resolve({});
          }
        }
      ]
    });
  }

  public alertOffline(resolve: (data: any) => void, isbn: string) {
    let alert = this.alertCtrl.present({
      title: "PROJECT.DETAIL.POPUP.NO_CONNECTION",
      message: "PROJECT.DETAIL.POPUP.ADD_TO_PENDINGS",
      buttons: [
        {
          text: "PROJECT.DETAIL.POPUP.RETRY",
          handler: () => {
            alert.then(obj => {
              this.fetchFromISBN(isbn, obj.dismiss()).then(response => {
                resolve(response);
              });
            });
            return false;
          }
        },
        {
          text: "PROJECT.DETAIL.POPUP.ADD",
          handler: () => {
            alert.then(obj => {
              resolve({
                isbn: isbn,
                addPending: true,
                transition: obj.dismiss()
              });
            });
            return false;
          }
        }
      ]
    });
  }

  public alertScanUnavailable(resolve: (data: any) => void) {
    this.alertCtrl.present({
      title: "PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN",
      message: "PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN_TEXT",
      buttons: [
        {
          text: "COMMON.OK",
          handler: () => {
            resolve({});
          }
        }
      ]
    });
  }

  public alertWrongBarcode(resolve: (data: any) => void) {
    this.alertCtrl.present({
      title: "PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE",
      message: "PROJECT.DETAIL.POPUP.NOT_RIGHT_BARCODE_TYPE",
      buttons: [
        {
          text: "COMMON.OK",
          handler: () => {
            resolve({});
          }
        }
      ]
    });
  }
}
