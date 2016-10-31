import { Component } from "@angular/core";

import { NavController } from "ionic-angular";
import { SocialSharing } from "ionic-native";
import { TranslateService } from "ng2-translate/ng2-translate";

import { Report } from "../../providers/report";


@Component({
  selector: "feedback",
  templateUrl: "feedback.html"
})
export class FeedbackPage {
  constructor(
    public nav: NavController,
    public translate: TranslateService,
    public report: Report,
  ) {}

  open(type: string) {
    switch (type) {
      case "projects":
        this.translate.get([
          "SETTINGS.FEEDBACK.EMAIL.PROJECT",
          "SETTINGS.FEEDBACK.EMAIL.PROJECT_TITLE"
        ]).subscribe(translations => {
          this.report.diagnostics().then(diags => {
            SocialSharing.shareViaEmail(
              `${translations["SETTINGS.FEEDBACK.EMAIL.PROJECT"]}
              ${diags}
              </p>
              `,
              translations["SETTINGS.FEEDBACK.EMAIL.PROJECT_TITLE"],
              ["methoappeei@gmail.com"],
              [],
              [],
              null
            );
          });
        });
        break;
      case "reference":
        this.translate.get([
          "SETTINGS.FEEDBACK.EMAIL.REFERENCE",
          "SETTINGS.FEEDBACK.EMAIL.REFERENCE_TITLE"
        ]).subscribe(translations => {
          this.report.diagnostics().then(diags => {
            SocialSharing.shareViaEmail(
              `${translations["SETTINGS.FEEDBACK.EMAIL.REFERENCE"]}
              ${diags}
              </p>
              `,
              translations["SETTINGS.FEEDBACK.EMAIL.REFERENCE_TITLE"],
              ["methoappeei@gmail.com"],
              [],
              [],
              null
            );
          });
        });
        break;
      case "settings":
        this.translate.get([
          "SETTINGS.FEEDBACK.EMAIL.SETTINGS",
          "SETTINGS.FEEDBACK.EMAIL.SETTINGS_TITLE"
        ]).subscribe(translations => {
          this.report.diagnostics().then(diags => {
            SocialSharing.shareViaEmail(
              `${translations["SETTINGS.FEEDBACK.EMAIL.SETTINGS"]}
              ${diags}
              </p>
              `,
              translations["SETTINGS.FEEDBACK.EMAIL.SETTINGS_TITLE"],
              ["methoappeei@gmail.com"],
              [],
              [],
              null
            );
          });
        });
        break;
      case "comment":
        this.translate.get([
          "SETTINGS.FEEDBACK.EMAIL.COMMENT",
          "SETTINGS.FEEDBACK.EMAIL.COMMENT_TITLE"
        ]).subscribe(translations => {
          SocialSharing.shareViaEmail(
            translations["SETTINGS.FEEDBACK.EMAIL.COMMENT"],
            translations["SETTINGS.FEEDBACK.EMAIL.COMMENT_TITLE"],
            ["methoappeei@gmail.com"],
            [],
            [],
            null
          );
        });
        break;
      case "feature":
        this.translate.get([
          "SETTINGS.FEEDBACK.EMAIL.FEATURE",
          "SETTINGS.FEEDBACK.EMAIL.FEATURE_TITLE"
        ]).subscribe(translations => {
          SocialSharing.shareViaEmail(
            translations["SETTINGS.FEEDBACK.EMAIL.FEATURE"],
            translations["SETTINGS.FEEDBACK.EMAIL.FEATURE_TITLE"],
            ["methoappeei@gmail.com"],
            [],
            [],
            null
          );
        });
        break;
    }
  }
}
