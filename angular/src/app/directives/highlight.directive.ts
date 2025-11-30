import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective implements OnInit {
  private _appHighlight: string = 'yellow';
  @Input() set appHighlight(color: string) {
    if (color) this._appHighlight = color;
  }

  get appHighlight(): string {
    return this._appHighlight;
  }

  @Input() highlightDefault: string = '';

  private originalBackground: string = '';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngOnInit() {
    const computedStyle = window.getComputedStyle(this.el.nativeElement);
    this.originalBackground =
      this.highlightDefault || computedStyle.backgroundColor;
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.renderer.setStyle(
      this.el.nativeElement,
      'background-color',
      this.appHighlight,
    );
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(
      this.el.nativeElement,
      'background-color',
      this.originalBackground,
    );
  }
}
