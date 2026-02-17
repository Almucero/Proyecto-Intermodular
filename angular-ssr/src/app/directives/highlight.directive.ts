import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.originalBackground = this.highlightDefault || '';
      return;
    }
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
