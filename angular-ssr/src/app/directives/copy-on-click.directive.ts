import {
  Directive,
  HostListener,
  Input,
  ElementRef,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appCopyOnClick]',
  standalone: true,
})
export class CopyOnClickDirective {
  @Input() appCopyOnClick: string = '';

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  @HostListener('click') onClick() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const textToCopy = this.appCopyOnClick || this.el.nativeElement.innerText;

    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalBg = this.el.nativeElement.style.backgroundColor;
      this.el.nativeElement.style.backgroundColor = '#4caf50';

      setTimeout(() => {
        this.el.nativeElement.style.backgroundColor = originalBg;
      }, 300);
    });
  }
}
