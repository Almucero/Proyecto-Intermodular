import { Directive, HostListener, Input, ElementRef } from '@angular/core';

@Directive({
  selector: '[appCopyOnClick]',
  standalone: true,
})
export class CopyOnClickDirective {
  @Input() appCopyOnClick: string = '';

  constructor(private el: ElementRef) {}

  @HostListener('click') onClick() {
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
