import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import { Fetch } from "../../providers/fetch";
import { Settings } from "../../providers/settings";
import { TranslatedAlertController } from "../../providers/translated-alert-controller";


@Component({
  selector: 'instant-search',
  templateUrl: 'instant-search.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InstantSearchComponent),
      multi: true,
    }
  ]
})
export class InstantSearchComponent implements ControlValueAccessor {
  @Input('firstname') author1firstname: string = "";
  @Input('lastname') author1lastname: string = "";
  @Input('placeholder') _placeholderText: string = "";

  @Output() onFill: EventEmitter<Source> = <EventEmitter<Source>>new EventEmitter();

  public _value: string = "";
  public _timeout: any;
  public isLoading: boolean = false;
  public noResult: boolean = false;
  public serverError: boolean = false;
  public notOnline: boolean = false;
  public isDone: boolean = false;
  public isShown: boolean = false;
  public timeoutError: boolean = false;
  public showStatus: boolean = false;
  public instantList: any[] = [];

  public isAdvanced: boolean = false;
  // ControlValueAccessor
  public onValueChange: (_?: any) => void = () => {};
  public onInputTouched: (_?: any) => void = () => {};

  constructor(
    public alertCtrl: TranslatedAlertController,
    public fetch: Fetch,
    public settings: Settings,
  ) {
    this.isAdvanced = this.settings.get('advanced');
  }

  input() {
    this.onValueChange(this._value);
    this.onInputTouched();

    if (!this.isAdvanced) return;
    if (!navigator.onLine) return;

    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeout = setTimeout(() => {
      const title = this._value;
      const firstname = this.author1firstname;
      const lastname = this.author1lastname;

      if (title) {
        this.instantSearchIsLoading();
        const hasAuthor = (firstname || lastname) ? true : false;
        let query = `${title} ${firstname} ${lastname}`.trim();
        this.fetch.fromName(query, hasAuthor).then(suggestions => {
          if (suggestions.length) {
            this.instantList = suggestions;
            this.instantSearchIsDone();
          }else {
            this.instantSearchHasNone();
          }
        }).catch(err => {
          if (err.status >= 500 && err.status < 599) {
            this.instantSearchErr500();
          }else if (err.status == 408) {
            this.instantSearchTimeout();
          }
        });
      }else {
        this.instantList = [];
        this.resetInstantSearchVars();
      }
      this._timeout = null;
    }, 500);
  }

  fillRequest(suggestion: Source) {
    this.isShown = false;
    this.onFill.emit(suggestion);
  }

  resetInstantSearchVars() {
    this.isDone = false;
    this.isLoading = false;
    this.noResult = false;
    this.serverError = false;
    this.isShown = false;
    this.timeoutError = false;
    this.showStatus = false;
  }

  instantSearchIsLoading() {
    this.resetInstantSearchVars();
    this.showStatus = true;
    this.isLoading = true;
  }

  instantSearchIsDone() {
    this.resetInstantSearchVars();
    this.showStatus = true;
    this.isDone = true;
  }

  instantSearchHasNone() {
    this.resetInstantSearchVars();
    this.showStatus = true;
    this.noResult = true;
  }

  instantSearchErr500() {
    this.resetInstantSearchVars();
    this.showStatus = true;
    this.serverError = true;
  }

  instantSearchTimeout() {
    this.resetInstantSearchVars();
    this.showStatus = true;
    this.serverError = true;
    this.timeoutError = true;
  }

  toggleInstantSearch() {
    this.isShown = !this.isShown;
  }

  openExplaining() {
    if (this.noResult) {
      this.alertCtrl.present({
        title: "PROJECT.DETAIL.POPUP.NO_SUGGESTIONS",
        message: "PROJECT.DETAIL.POPUP.NO_SUGGESTIONS_DESC",
        buttons: [
          {
            text: "COMMON.OK"
          }
        ]
      });
    }else if (this.timeoutError) {
      this.alertCtrl.present({
        title: "PROJECT.DETAIL.POPUP.TIMEOUT_TITLE",
        message: "PROJECT.DETAIL.POPUP.TIMEOUT_SEARCH",
        buttons: [
          {
            text: "COMMON.OK"
          }
        ]
      });
    }else if (this.serverError) {
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

  // ControlValueAccessor
  writeValue(val) {
    this._value = val;
    this.onValueChange();
    this.onInputTouched();
  }

  registerOnChange(fn) {
    this.onValueChange = fn;
  }

  registerOnTouched(fn) {
    this.onInputTouched = fn;
  }
}
