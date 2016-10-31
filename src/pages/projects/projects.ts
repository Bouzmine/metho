import { ViewChild, Component } from "@angular/core";

import { NavController, ModalController, List } from "ionic-angular";

import { ProjectModalPage } from "../project-modal/project-modal";
import { SourcesPage } from "../sources/sources";

import { AppStorage } from "../../providers/app-storage";
import { TranslatedAlertController } from "../../providers/translated-alert-controller";


@Component({
  selector: "projects",
  templateUrl: "projects.html"
})
export class ProjectsPage {
  public projects: any[] = [];
  public loading: Boolean = true;
  @ViewChild(List) list: List;

  constructor(
    public nav: NavController,
    public alertCtrl: TranslatedAlertController,
    public modalCtrl: ModalController,
    public storage: AppStorage,
  ) {
    this.loadProjects();
  }

  loadProjects() {
    this.storage.getProjects().then(projects => {
      this.projects = projects;
      this.projects.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      this.loading = false;
    });
  }

  createProject() {
    let modal = this.modalCtrl.create(ProjectModalPage, {
      previous: null
    }, {
      enableBackdropDismiss: false
    });

    modal.onWillDismiss(data => {
      this.loadProjects();
    });

    modal.present();
  }

  editProject(project: Project) {
    let modal = this.modalCtrl.create(ProjectModalPage, {
      previous: project
    }, {
      enableBackdropDismiss: false
    });

    modal.onWillDismiss(data => {
      this.list.closeSlidingItems();
      this.loadProjects();
    });

    modal.present();
  }

  deleteProject(project: Project) {
    this.alertCtrl.present({
      title: "PROJECT.TAB.POPUP.DELETE_PROJECT_TITLE",
      message: "PROJECT.TAB.POPUP.DELETE_PROJECT",
      buttons: [
        {
          text: "COMMON.CANCEL",
          handler: () => {
            this.list.closeSlidingItems();
          }
        },
        {
          text: "COMMON.DELETE",
          handler: () => {
            this.storage.deleteProject(project._id);
            let index = this.projects.indexOf(project);
            if(index > -1) {
              this.projects.splice(index, 1);
            }
          }
        }
      ]
    });
  }

  openProjectDetail(project: Project) {
    this.nav.push(SourcesPage, {
      id: project._id
    });
  }
}
