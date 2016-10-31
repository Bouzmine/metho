import { Injectable, EventEmitter } from "@angular/core";

import { Fetch } from "./fetch";
import { Parse } from "./parse";
import { Report } from "./report";

interface CordovaWindow extends Window {
  cordova: any;
}
declare var window: CordovaWindow;

import PouchDB from "pouchdb";
import PouchDB_Adapter_Cordova_SQLite from "pouchdb-adapter-cordova-sqlite";

@Injectable()
export class AppStorage {
  public projectDB: any = null;
  public sourceDB: any = null;
  public pendingDB: any = null;
  public settingsDB: any = null;
  public projects: Map<string, Project> = <Map<string, Project>>new Map();
  public sources: Map<string, Source> = <Map<string, Source>>new Map();
  public sourcesByProject: Map<string, Map<string, Source>> = <Map<string, Map<string, Source>>>new Map();
  public pendings: Map<string, Pending> = <Map<string, Pending>>new Map();
  public pendingsByProject: Map<string, Map<string, Pending>> = <Map<string, Map<string, Pending>>>new Map();
  public settings: any = {};

  public loadingProjects: boolean = true;
  public loadingSources: boolean = true;
  public loadingPendings: boolean = true;
  public loadingSettings: boolean = true;

  public projectEvents = new EventEmitter();
  public sourcesEvents = new EventEmitter();
  public pendingsEvents = new EventEmitter();
  public settingsEvents = new EventEmitter();

  constructor(
    public fetch: Fetch,
    public parse: Parse,
    public report: Report
  ) {}

  init() {
    PouchDB.plugin(PouchDB_Adapter_Cordova_SQLite);
    let adapter = !!window.cordova ? "cordova-sqlite" : "websql";
    this.projectDB = new PouchDB("projects", { adapter: adapter });
    this.sourceDB = new PouchDB("sources", { adapter: adapter });
    this.pendingDB = new PouchDB("pendings", { adapter: adapter });
    this.settingsDB = new PouchDB("settings", { adapter: adapter });

    this.projectDB.allDocs({include_docs: true}).then(docs => {
      docs.rows.forEach((value) => {
        this.projects.set(value.doc._id, value.doc);
        if (!this.sourcesByProject.has(value.doc._id)) {
          this.sourcesByProject.set(value.doc._id, <Map<string, Source>>new Map());
        }

        if (!this.pendingsByProject.has(value.doc._id)) {
          this.pendingsByProject.set(value.doc._id, <Map<string, Pending>>new Map());
        }
      });
      this.lockProjects()();
    }).catch(err => {
      this.lockProjects()();
      this.report.report(err);
    });

    this.sourceDB.allDocs({include_docs: true}).then(docs => {
      docs.rows.forEach(value => {
        this.sources.set(value.doc._id, value.doc);
        if (!this.sourcesByProject.has(value.doc.project_id)) {
          this.sourcesByProject.set(value.doc.project_id, <Map<string, Source>>new Map());
        }
        this.sourcesByProject.set(value.doc.project_id, this.sourcesByProject.get(value.doc.project_id).set(value.doc._id, value.doc));
      });
      this.lockSources()();
    }).catch(err => {
      this.lockSources()();
      this.report.report(err);
    });

    this.pendingDB.allDocs({include_docs: true}).then(docs => {
      docs.rows.forEach(value => {
        this.pendings.set(value.doc._id, value.doc);
        if (!this.pendingsByProject.has(value.doc.project_id)) {
          this.pendingsByProject.set(value.doc.project_id, <Map<string, Pending>>new Map());
        }
        this.pendingsByProject.set(value.doc.project_id, this.pendingsByProject.get(value.doc.project_id).set(value.doc._id, value.doc));
      });
      this.lockPendings()();
    }).catch(err => {
      this.lockPendings()();
      this.report.report(err);
    });

    this.settingsDB.allDocs({include_docs: true}).then(docs => {
      docs.rows.forEach(value => {
        this.settings[value.doc._id] = value.doc.value;
      });
      this.lockSettings()();
    }).catch(err => {
      this.lockSettings()();
      this.report.report(err);
    });
  }

  getProjects(): Promise<Project[]> {
    return this.waitForProject(() => {
      return Array.from(this.projects.values());
    });
  }

  deleteProject(id: string) {
    let releaseLock = this.lockProjects();
    var doc = this.projects.get(id);
    this.projects.delete(id);
    let deletePromises = [];
    // Remove the sources
    this.sourcesByProject.get(id).forEach(source => {
      deletePromises.push(this.deleteSource(source._id));
    });
    // Delete this.sourcesByProject object for the deleted project
    Promise.all(deletePromises).then(value => {
      this.sourcesByProject.delete(id);
      releaseLock();
    }).catch(() => {
      releaseLock();
    });

    return new Promise(resolve => {
      this.projectDB.remove(doc).then(result => {
        resolve(result);
      }).catch(err => {
        this.report.report(err);
        resolve(err);
      });
    });
  }

  setProjectFromId(id: string, set: Project) {
    let releaseLock = this.lockProjects();
    return new Promise(resolve => {
      let values = set;
      values._rev = this.projects.get(id)._rev;
      values._id = id;
      this.projectDB.put(values).then(response => {
        set._rev = response.rev;
        this.projects.set(id, set);
        releaseLock();
        resolve(response);
      }).catch(err =>{
        releaseLock();
        this.report.report(err);
        resolve(err);
      });
    });
  }

  getProjectFromId(id: string): Promise<Project> {
    return this.waitForProject(() => {
      return this.projects.get(id);
    });
  }

  createProject(project: Project) {
    let releaseProjectLock = this.lockProjects();
    let releaseSourceLock = this.lockSources();
    return new Promise(resolve => {
      this.projectDB.post(project).then(response => {
        this.sourcesByProject.set(response.id, <Map<string, Source>>new Map());
        this.pendingsByProject.set(response.id, <Map<string, Pending>>new Map());
        project._id = response.id;
        project._rev = response.rev;
        this.projects.set(response.id, project);
        releaseSourceLock();
        releaseProjectLock();
        resolve(response);
      }).catch((err) => {
        releaseSourceLock();
        releaseProjectLock();
        this.report.report(err);
        resolve(err);
      });
    });
  }

  getSourcesFromProjectId(id: string): Promise<Source[]> {
    return this.waitForSource(() => {
      return Array.from(this.sourcesByProject.get(id).values());
    });
  }

  getSourceFromId(id: string): Promise<Source> {
    return this.waitForSource(() => {
      return this.sources.get(id);
    });
  }

  setSourceFromId(id: string, set: Source) {
    let releaseLock = this.lockSources();
    return new Promise(resolve => {
      set._rev = this.sources.get(id)._rev;
      set._id = id;
      this.sourceDB.put(set).then(response => {
        set._rev = response.rev;
        set._id = response.id;
        this.sources.set(id, set);
        this.sourcesByProject.get(set.project_id).set(id, set);
        releaseLock();
        resolve(response);
      }).catch(err => {
        this.report.report(err);
        releaseLock();
        resolve(err);
      });
    });
  }

  bulkSetSources(sources: Map<string, Source>) {
    let releaseLock = this.lockSources();
    return new Promise(resolve => {
      this.sourceDB.bulkDocs(Array.from(sources.values())).then(result => {
        result.forEach(source => {
          if (source.ok) {
            let old = sources.get(source.id);
            old._rev = source.rev;
            this.sources.set(source.id, old);
            this.sourcesByProject.get(old.project_id).set(source.id, old);
          }else {
            this.report.report(source);
          }
        });
        releaseLock();
        resolve(true);
      }).catch(err => {
        this.report.report(err);
        releaseLock();
        resolve(true);
      });
    });
  }

  createSource(source: Source) {
    let releaseLock = this.lockSources();
    return new Promise(resolve => {
      this.sourceDB.post(source).then(response => {
        source._id = response.id;
        source._rev = response.rev;
        this.sources.set(response.id, source); this.sourcesByProject.get(source.project_id).set(response.id, source);
        releaseLock();
        resolve(response);
      }).catch(err => {
        releaseLock();
        this.report.report(err);
        resolve(err);
      });
    });
  }

  deleteSource(id: string) {
    let releaseLock = this.lockSources();
    let doc = this.sources.get(id);
    this.sources.delete(id);
    this.sourcesByProject.get(doc.project_id).delete(id);

    return new Promise(resolve => {
      this.sourceDB.remove(doc).then(result => {
        releaseLock();
        resolve(result);
      }).catch(err => {
        this.report.report(err);
        releaseLock();
        resolve(err);
      });
    });
  }

  parseSources() {
    this.waitForSource(() => {
      let sources: Map<string, any> = <Map<string, any>>new Map();
      this.sources.forEach((source) => {
        sources.set(source._id, this.parse.parse(source));
      });
      this.bulkSetSources(sources);
    });
  }

  getPendingsFromProjectId(id: string): Promise<Pending[]> {
    return this.waitForPending(() => {
      return Array.from(this.pendingsByProject.get(id).values());
    });
  }

  createPending(pending: Pending) {
    let releaseLock = this.lockPendings();
    return new Promise(resolve => {
      this.pendingDB.post(pending).then(response => {
        pending._id = response.id;
        pending._rev = response.rev;
        pending.isLoaded = false;
        pending.notAvailable = false;
        pending.data = {};
        this.pendings.set(response.id, pending);
        this.pendingsByProject.get(pending.project_id).set(pending._id, pending);
        releaseLock();
        resolve(response);
      }).catch((err) => {
        releaseLock();
        this.report.report(err);
        resolve(err);
      });
    });
  }

  deletePending(id: string) {
    let releaseLock = this.lockPendings();
    let doc = this.pendings.get(id);
    this.pendings.delete(id);
    this.pendingsByProject.get(doc.project_id).delete(doc._id);

    return new Promise(resolve => {
      this.pendingDB.remove(doc).then(result => {
        releaseLock();
        resolve(result);
      }).catch(err => {
        releaseLock();
        this.report.report(err);
        resolve(err);
      });
    });
  }

  setPendingFromId(id: string, set: Pending) {
    let releaseLock = this.lockPendings();
    return new Promise(resolve => {
      let values = set;
      values._rev = this.pendings.get(id)._rev;
      values._id = id;
      this.pendingDB.put(values).then(response => {
        set._rev = response.rev;
        this.pendings.set(id, set);
        this.pendingsByProject.get(set.project_id).set(set._id, set);
        releaseLock();
        resolve(response);
      }).catch(err => {
        this.report.report(err);
        releaseLock();
        resolve(err);
      });
    });
  }

  loadPendingsFromProjectId(id: string): void {
    this.waitForPending(() => {
      this.pendings.forEach(pending => {
        if (!pending.isLoaded) {
          this.fetch.fromISBN(pending.isbn).then(data => {
            pending.data = data;
            pending.isLoaded = true;
            this.setPendingFromId(pending._id, pending);
          }).catch(err => {
            if (err == 404) {
              pending.notAvailable = true;
              pending.isLoaded = true;
              this.setPendingFromId(pending._id, pending);
            }
          });
        }
      });
    });
  }

  getPendingNumber(id: string): Promise<number> {
    return this.waitForPending(() => {
      return this.pendingsByProject.get(id).size;
    });
  }

  getSettings(): Promise<any> {
    return this.waitForSetting(() => {
      return this.settings;
    });
  }

  setSetting(key: string, value: any): void {
    let releaseLock = this.lockSettings();
    this.settingsDB.get(key).then(doc => {
      doc.value = value;
      this.settingsDB.put(doc);
      releaseLock();
    }).catch(err => {
      if (err.status == 404) {
        this.settingsDB.put({ value: value, _id: key });
      }else {
        this.report.report(err);
      }
      releaseLock();
    });
  }

  // threadlocks
  lockProjects() {
    this.loadingProjects = true;
    return () => {
      this.loadingProjects = false;
      this.projectEvents.emit("projectLoadingEnded");
    };
  }

  waitForProject<T>(fn: () => T): Promise<T> {
    if(this.loadingProjects){
      return new Promise(resolve => {
        let subscription = this.projectEvents.subscribe(event => {
          subscription.unsubscribe();
          resolve(fn());
        });
      });
    }else {
      return Promise.resolve(fn());
    }
  }

  lockSources() {
    this.loadingSources = true;
    return () => {
      this.loadingSources = false;
      this.sourcesEvents.emit("sourcesLoadingEnded");
    };
  }

  waitForSource<T>(fn: () => T): Promise<T> {
    if(this.loadingSources){
      return new Promise(resolve => {
        let subscription = this.sourcesEvents.subscribe(event => {
          subscription.unsubscribe();
          resolve(fn());
        });
      });
    }else {
      return Promise.resolve(fn());
    }
  }

  lockPendings() {
    this.loadingPendings = true;
    return () => {
      this.loadingPendings = false;
      this.pendingsEvents.emit("pendingLoadingEnded");
    };
  }

  waitForPending<T>(fn: () => T): Promise<T> {
    if(this.loadingPendings){
      return new Promise(resolve => {
        let subscription = this.pendingsEvents.subscribe(event => {
          subscription.unsubscribe();
          resolve(fn());
        });
      });
    }else {
      return Promise.resolve(fn());
    }
  }

  lockSettings() {
    this.loadingSettings = true;
    return () => {
      this.loadingSettings = false;
      this.settingsEvents.emit("settingsLoadingEnded");
    };
  }

  waitForSetting<T>(fn: () => T): Promise<T> {
    if(this.loadingSettings){
      return new Promise(resolve => {
        let subscription = this.settingsEvents.subscribe(event => {
          subscription.unsubscribe();
          resolve(fn());
        });
      });
    }else {
      return Promise.resolve(fn());
    }
  }
}
