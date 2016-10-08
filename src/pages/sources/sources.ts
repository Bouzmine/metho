import { ViewChild, Component } from '@angular/core';

import { NavController, NavParams, ModalController, AlertController, List, Content, FabContainer } from 'ionic-angular';
import { SocialSharing } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { AdvancedModePage } from '../advanced-mode/advanced-mode';
import { SourceModalBookPage } from '../source-modal-book/source-modal-book';
import { SourceModalArticlePage } from '../source-modal-article/source-modal-article';
import { SourceModalInternetPage } from '../source-modal-internet/source-modal-internet';
import { SourceModalCdPage } from '../source-modal-cd/source-modal-cd';
import { SourceModalMoviePage } from '../source-modal-movie/source-modal-movie';
import { SourceModalInterviewPage } from '../source-modal-interview/source-modal-interview';
import { SourcePage } from '../source/source';
import { PendingsPage } from '../pendings/pendings';

import { AppStorage } from '../../providers/app-storage';
import { Settings } from '../../providers/settings';


@Component({
  selector: 'sources',
  templateUrl: 'sources.html'
})
export class SourcesPage {
  public projectId: string;
  public sources: Source[] = [];
  public project: Project = {name: "", matter: ""};
  public pendingNumber: number = 0;
  public searchQuery: string = "";
  public filteredSources: Source[] = [];
  @ViewChild(List) list: List;
  @ViewChild(Content) content: Content;
  @ViewChild(FabContainer) fab: FabContainer;

  constructor(
    public nav: NavController,
    public params: NavParams,
    public translate: TranslateService,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public storage: AppStorage,
    public settings: Settings,
  ) {
    this.projectId = params.get('id');
    this.loadProjectInfo();
  }

  ionViewWillEnter() {
    this.loadSources();
    this.loadPendingNumber();
  }

  ionViewDidEnter() {
    if (this.sources.length == 0 && this.pendingNumber != 0) {
      this.content.scrollToBottom(250);
    }
  }

  loadSources() {
    this.storage.getSourcesFromProjectId(this.projectId).then(sources => {
      this.sources = sources;
      this.filteredSources = sources;
      this.sources.sort((a, b) => {
        if (a.title && b.title) {
          return a.title.localeCompare(b.title);
        } else if (a.title) {
          return a.title.localeCompare(b.parsedSource);
        } else if (b.title) {
          return a.parsedSource.localeCompare(b.title);
        }
      });
      this.updateSearch();
    });
  }

  loadProjectInfo() {
    this.storage.getProjectFromId(this.projectId).then(project => {
      this.project = project;
    });
  }

  loadPendingNumber() {
    this.storage.getPendingNumber(this.projectId).then(num => {
      this.pendingNumber = num;
    });

    this.storage.loadPendingsFromProjectId(this.projectId);
  }

  openModal(type: string, openScan: boolean = false, editing: boolean = false, source?: Source) {
    switch (type) {
      case 'book':
        var modal = this.modalCtrl.create(SourceModalBookPage, {
          projectId: this.projectId,
          data: source,
          editing: editing,
          scan: openScan
        }, {
          enableBackdropDismiss: false
        });
        break;
      case 'article':
        var modal = this.modalCtrl.create(SourceModalArticlePage, {
          projectId: this.projectId,
          data: source,
          editing: editing,
        }, {
          enableBackdropDismiss: false
        });
        break;
      case 'internet':
        var modal = this.modalCtrl.create(SourceModalInternetPage, {
          projectId: this.projectId,
          data: source,
          editing: editing,
        }, {
          enableBackdropDismiss: false
        });
        break;
      case 'cd':
        var modal = this.modalCtrl.create(SourceModalCdPage, {
          projectId: this.projectId,
          data: source,
          editing: editing,
        }, {
          enableBackdropDismiss: false
        });
        break;
      case 'movie':
        var modal = this.modalCtrl.create(SourceModalMoviePage, {
          projectId: this.projectId,
          data: source,
          editing: editing,
        }, {
          enableBackdropDismiss: false
        });
        break;
      case 'interview':
        var modal = this.modalCtrl.create(SourceModalInterviewPage, {
          projectId: this.projectId,
          data: source,
          editing: editing,
        }, {
          enableBackdropDismiss: false
        });
        break;
    }

    modal.onWillDismiss(() => {
      this.loadSources();
      this.loadPendingNumber();
    });

    modal.present().then(() => {
      this.fab.close();
    });
  }

  editSource(source: Source) {
    this.openModal(source.type, false, true, source);
  }

  deleteSource(source: Source) {
    this.translate.get(["PROJECT.DETAIL.POPUP.DELETE_TITLE", "PROJECT.DETAIL.POPUP.DELETE_TEXT", "COMMON.DELETE", "COMMON.CANCEL"]).subscribe(translations => {
      let alert = this.alertCtrl.create({
        title: translations["PROJECT.DETAIL.POPUP.DELETE_TITLE"],
        message: translations["PROJECT.DETAIL.POPUP.DELETE_TEXT"],
        buttons: [
          {
            text: translations["COMMON.CANCEL"],
            handler: () => {
              this.list.closeSlidingItems();
            }
          },
          {
            text: translations["COMMON.DELETE"],
            handler: () => {
              this.storage.deleteSource(source._id);
              this.sources.splice(this.sources.indexOf(source), 1);
            }
          }
        ]
      });

      alert.present();
    });
  }

  share() {
    this.translate.get("PROJECT.DETAIL.SHARE_TEXT", { project_title: this.project.name }).subscribe(text => {
      let textToShare = text;
      let errNum = 0;
      let arr_sources = JSON.parse(JSON.stringify(this.sources)).sort((a, b) => {
        return a.parsedSource.localeCompare(b.parsedSource);
      });
      arr_sources.forEach(value => {
        textToShare += value.parsedSource + "<br><br>";
        errNum += value.errors.length;
      });

      if (errNum > 0 && !this.settings.get('ignoreErrors')) {
        this.translate.get(["PROJECT.DETAIL.POPUP.ERRORS_SOURCES", "PROJECT.DETAIL.POPUP.SHARE_TEXT", "PROJECT.DETAIL.POPUP.SHARE", "COMMON.CANCEL"], { errNum:errNum }).subscribe((translations) => {
          let alert = this.alertCtrl.create({
            title: translations["PROJECT.DETAIL.POPUP.SHARE_TEXT"],
            message: translations["PROJECT.DETAIL.POPUP.ERRORS_SOURCES"],
            buttons: [
              {
                text: translations["COMMON.CANCEL"]
              },
              {
                text: translations["PROJECT.DETAIL.POPUP.SHARE"],
                handler: () => {
                  SocialSharing.shareViaEmail(
                    textToShare,
                    this.project.name,
                    [],
                    [],
                    [],
                    []
                  ).then(() => {
                    this.promptForAdvanced();
                  }).catch(() => {});
                }
              }
            ]
          });

          alert.present();
        });
      } else {
        SocialSharing.shareViaEmail(
          textToShare,
          this.project.name,
          [],
          [],
          [],
          []
        ).then(() => {
          this.promptForAdvanced();
        }).catch(() => {});
      }
    });
  }

  promptForAdvanced() {
    if (!this.settings.get('advanced')) {
      this.translate.get(["PROJECT.DETAIL.POPUP.ADVANCED_MODE", "PROJECT.DETAIL.POPUP.ADVANCED_MODE_MESSAGE", "PROJECT.DETAIL.POPUP.DETAILS", "PROJECT.DETAIL.POPUP.NO_THANKS"]).subscribe((translations) => {
        let alert = this.alertCtrl.create({
          title: translations["PROJECT.DETAIL.POPUP.ADVANCED_MODE"],
          message: translations["PROJECT.DETAIL.POPUP.ADVANCED_MODE_MESSAGE"],
          buttons: [
            {
              text: translations["PROJECT.DETAIL.POPUP.NO_THANKS"]
            },
            {
              text: translations["PROJECT.DETAIL.POPUP.DETAILS"],
              handler: () => {
                alert.dismiss().then(() => {
                  this.nav.push(AdvancedModePage);
                });
                return false;
              }
            }
          ]
        });

        alert.present();
      });
    }
  }

  updateSearch() {
    this.filteredSources = this.sources;

    let q = this.searchQuery;

    if (q.trim() == '') {
      return;
    }

    let qa = q.trim().split(' ');

    this.filteredSources = this.filteredSources.filter((v) => {
      if (qa.length > 1) {
        for (var i = 0; i < qa.length; i++) {
          if (v.parsedSource.toLowerCase().indexOf(qa[i].toLowerCase()) > -1 || v.parsedType.toLowerCase().indexOf(qa[i].toLowerCase()) > -1) {
          }else {
            return false;
          }
        }
        return true;
      }else {
        if (v.parsedSource.toLowerCase().indexOf(qa[0].toLowerCase()) > -1 || v.parsedType.toLowerCase().indexOf(qa[0].toLowerCase()) > -1) {
          return true;
        }
      }
      return false;
    });
  }

  openSourcePage(source: Source) {
    this.nav.push(SourcePage, {
      pId: this.projectId,
      id: source._id
    });
  }

  openPendingPage() {
    this.nav.push(PendingsPage, {
      pId: this.projectId
    });
  }
}
