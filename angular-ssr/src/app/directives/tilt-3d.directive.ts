import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';

/** Directiva para aplicar efecto 3D suave con reflejo en hover. */
@Directive({
  selector: '[appTilt3D]',
  standalone: true,
})
export class Tilt3DDirective implements OnInit, OnDestroy {
  /** Propiedad no documentada. */
    @Input() tiltEnabled = true;
  /** Propiedad no documentada. */
    @Input() tiltMaxRotateDeg = 5;
  /** Propiedad no documentada. */
    @Input() tiltMaxTranslatePx = 3.5;
  /** Propiedad no documentada. */
    @Input() tiltHoverScale = 1.022;
  /** Propiedad no documentada. */
    @Input() tiltImageScale = 1.03;
  /** Propiedad no documentada. */
    @Input() tiltGlareMaxOpacity = 0.42;

  /** Propiedad no documentada. */
    private rafId: number | null = null;
  /** Propiedad no documentada. */
    private currentX = 0;
  /** Propiedad no documentada. */
    private currentY = 0;
  /** Propiedad no documentada. */
    private targetX = 0;
  /** Propiedad no documentada. */
    private targetY = 0;
  /** Propiedad no documentada. */
    private hoverCurrent = 0;
  /** Propiedad no documentada. */
    private hoverTarget = 0;
  /** Propiedad no documentada. */
    private readonly smoothFactor = 0.18;
  /** Propiedad no documentada. */
    private readonly hoverSmoothFactor = 0.22;
  /** Propiedad no documentada. */
    private readonly stopThreshold = 0.001;
  /** Propiedad no documentada. */
    private hostEl: HTMLElement;

  /**
     * Constructor no documentado.
     * @param elRef Parámetro no documentado.
     * @param renderer Parámetro no documentado.
     * @param ngZone Parámetro no documentado.
     */
    constructor(
    elRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private ngZone: NgZone,
  ) {
    this.hostEl = elRef.nativeElement;
  }

  /** Método no documentado. */
    ngOnInit(): void {
    this.renderer.addClass(this.hostEl, 'tilt-glare-surface');
    this.renderer.setStyle(this.hostEl, 'transformOrigin', 'center');
    this.renderer.setStyle(this.hostEl, 'willChange', 'transform, box-shadow');
    this.renderer.setStyle(this.hostEl, 'boxShadow', '0 4px 12px rgba(0,0,0,0.45)');
    this.hostEl.style.setProperty('--gloss-x', '50%');
    this.hostEl.style.setProperty('--gloss-y', '50%');
    this.hostEl.style.setProperty('--gloss-alpha', '0');
    this.hostEl.style.setProperty('--cover-scale', '1');
  }

  /** Método no documentado. */
    ngOnDestroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /** Método no documentado. */
    @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.tiltEnabled) return;
    this.hoverTarget = 1;
    this.startAnimation();
  }

  /**
     * Método no documentado.
     * @param event Parámetro no documentado.
     */
    @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.tiltEnabled) return;
    if (event.buttons === 1) return;

    const rect = this.hostEl.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const normalizedX = (x - 0.5) * 2;
    const normalizedY = (y - 0.5) * 2;

    this.targetX = Math.max(-1, Math.min(1, normalizedX));
    this.targetY = Math.max(-1, Math.min(1, normalizedY));
    this.startAnimation();
  }

  /** Método no documentado. */
    @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hoverTarget = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.startAnimation();
  }

  /** Método no documentado. */
    private startAnimation(): void {
    if (this.rafId !== null) return;

    this.ngZone.runOutsideAngular(() => {
      const step = () => {
        const dx = this.targetX - this.currentX;
        const dy = this.targetY - this.currentY;
        const dh = this.hoverTarget - this.hoverCurrent;

        this.currentX += dx * this.smoothFactor;
        this.currentY += dy * this.smoothFactor;
        this.hoverCurrent += dh * this.hoverSmoothFactor;

        const depth = Math.max(Math.abs(this.currentX), Math.abs(this.currentY));
        const rotateY = this.currentX * this.tiltMaxRotateDeg;
        const rotateX = -this.currentY * this.tiltMaxRotateDeg;
        const translateX = this.currentX * this.tiltMaxTranslatePx;
        const translateY = this.currentY * this.tiltMaxTranslatePx;

        const scale = 1 + this.hoverCurrent * (this.tiltHoverScale - 1);
        const shadowX = translateX;
        const shadowY = 3 + Math.max(translateY, 0) * 0.7;

        this.hostEl.style.transition = 'transform 0ms linear, box-shadow 0ms linear';
        this.hostEl.style.transform = `perspective(800px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(${translateX}px, ${translateY}px)`;
        this.hostEl.style.boxShadow = `${shadowX}px ${shadowY + 1}px 12px rgba(0,0,0,0.45)`;

        const glossX = 50 + this.currentX * 24;
        const glossY = 48 + this.currentY * 18;
        const glossAlpha = 0.06 + this.hoverCurrent * 0.28 + depth * 0.1;
        this.hostEl.style.setProperty('--gloss-x', `${glossX}%`);
        this.hostEl.style.setProperty('--gloss-y', `${glossY}%`);
        this.hostEl.style.setProperty(
          '--gloss-alpha',
          `${Math.min(this.tiltGlareMaxOpacity, glossAlpha)}`,
        );

        const coverScale =
          1 + this.hoverCurrent * (Math.max(this.tiltImageScale, 1) - 1);
        this.hostEl.style.setProperty('--cover-scale', `${coverScale}`);

        if (
          Math.abs(dx) < this.stopThreshold &&
          Math.abs(dy) < this.stopThreshold &&
          Math.abs(dh) < this.stopThreshold
        ) {
          this.rafId = null;
          this.currentX = this.targetX;
          this.currentY = this.targetY;
          this.hoverCurrent = this.hoverTarget;

          if (
            this.hoverTarget === 0 &&
            this.targetX === 0 &&
            this.targetY === 0
          ) {
            this.hostEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.45)';
            this.hostEl.style.transform =
              'perspective(800px) rotateX(0deg) rotateY(0deg) translate(0px, 0px)';
            this.hostEl.style.setProperty('--gloss-x', '50%');
            this.hostEl.style.setProperty('--gloss-y', '50%');
            this.hostEl.style.setProperty('--gloss-alpha', '0');
            this.hostEl.style.setProperty('--cover-scale', '1');
          }
          return;
        }

        this.rafId = requestAnimationFrame(step);
      };

      this.rafId = requestAnimationFrame(step);
    });
  }
}
