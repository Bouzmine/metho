import { Component } from "@angular/core";

import { TranslateService } from "ng2-translate/ng2-translate";

import { ProjectsPage } from "../projects/projects";
import { ReferencesPage } from "../references/references";
import { SettingsPage } from "../settings/settings";


@Component({
  templateUrl: "tabs.html"
})
export class TabsPage {
  tab1Root: Component = ProjectsPage;
  tab2Root: Component = ReferencesPage;
  tab3Root: Component = SettingsPage;
}
