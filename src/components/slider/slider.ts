import { Component, ElementRef, Input, OnChanges, AfterContentInit, AfterContentChecked } from "@angular/core";

@Component({
  selector: "slider",
  templateUrl: "slider.html"
})
export class SliderComponent implements OnChanges, AfterContentInit, AfterContentChecked {
  @Input() isOpen: boolean = false;
  public height: string;

  constructor(public elt: ElementRef) {}

  ngAfterContentInit() {
    this.updateHeight();
  }

  ngAfterContentChecked() {
    this.updateHeight();
  }

  ngOnChanges() {
    this.updateHeight();
  }

  updateHeight() {
    if (this.isOpen) {
      let element = this.elt.nativeElement.children[0].children[0];
      let domHeight = element.offsetHeight;
      domHeight += parseInt(window.getComputedStyle(element).getPropertyValue("margin-top"));
      domHeight += parseInt(window.getComputedStyle(element).getPropertyValue("margin-bottom"));
      this.height = domHeight + "px";
    }else {
      this.height = "0";
    }
  }
}
