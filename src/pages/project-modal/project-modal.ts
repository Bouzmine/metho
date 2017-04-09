import { Component } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

import { NavController, ViewController, NavParams } from "ionic-angular";
import { Keyboard } from "@ionic-native/keyboard";

import { AppStorage } from "../../providers/app-storage";


@Component({
  selector: "project-modal",
  templateUrl: "project-modal.html"
})
export class ProjectModalPage {
  public isNew: Boolean;
  public previous: Project;
  public hasConfirmed: boolean = false;
  public projectForm: FormGroup;

  constructor(
    public viewCtrl: ViewController,
    public params: NavParams,
    public storage: AppStorage,
    public fb: FormBuilder,
    public keyboard: Keyboard,
  ) {
    if (this.params.get("previous")) {
      this.isNew = false;
      this.previous = this.params.get("previous");
    }else {
      this.isNew = true;
      this.previous = {
        name: "",
        matter: ""
      };
    }
    this.projectForm = fb.group({
      name: [this.previous.name, Validators.required],
      matter: [this.previous.matter, Validators.nullValidator]
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  submitIfEnter(event) {
    if (event.keyCode == 13 && !this.hasConfirmed) {
      this.hasConfirmed = true;
      this.confirm();
    }
  }

  async confirm() {
    if (this.projectForm.valid) {
      if (this.isNew) {
        await this.storage.createProject(this.projectForm.value);
        this.keyboard.close();
        this.viewCtrl.dismiss();
      }else {
        await this.storage.setProjectFromId(this.previous._id, this.projectForm.value);
        this.keyboard.close();
        this.viewCtrl.dismiss();
      }
    }else {
      this.hasConfirmed = false;
    }
  }
}
