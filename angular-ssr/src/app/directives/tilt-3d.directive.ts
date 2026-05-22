/**
 * @file: src/app/directives/tilt-3d.directive.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Directiva para aplicar efecto 3D suave con reflejo en hover.
 */

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
  /** Determina si el efecto de inclinación 3D está activo. */
  @Input() tiltEnabled = true;
  /** Ángulo máximo de rotación en grados sobre los ejes X e Y. */
  @Input() tiltMaxRotateDeg = 5;
  /** Desplazamiento de traslación máximo en píxeles sobre los ejes X e Y. */
  @Input() tiltMaxTranslatePx = 3.5;
  /** Factor de escala aplicado al componente completo durante el estado hover. */
  @Input() tiltHoverScale = 1.022;
  /** Factor de escala aplicado a la imagen de portada interna en estado hover. */
  @Input() tiltImageScale = 1.03;
  /** Opacidad máxima para el efecto de brillo (glare) sobre la superficie. */
  @Input() tiltGlareMaxOpacity = 0.42;

  /** Identificador del frame de animación activo (RequestAnimationFrame). */
  private rafId: number | null = null;
  /** Posición actual en el eje X (interpolada suavemente de -1 a 1). */
  private currentX = 0;
  /** Posición actual en el eje Y (interpolada suavemente de -1 a 1). */
  private currentY = 0;
  /** Posición objetivo en el eje X basada en el puntero (-1 a 1). */
  private targetX = 0;
  /** Posición objetivo en el eje Y basada en el puntero (-1 a 1). */
  private targetY = 0;
  /** Nivel de escala/hover actual (interpolado de 0 a 1). */
  private hoverCurrent = 0;
  /** Nivel de escala/hover objetivo (0 o 1). */
  private hoverTarget = 0;
  /** Factor de suavizado para el efecto de rotación y traslación. */
  private readonly smoothFactor = 0.18;
  /** Factor de suavizado aplicado a la escala del elemento durante el hover. */
  private readonly hoverSmoothFactor = 0.22;
  /** Umbral mínimo de movimiento para dar por detenida la animación. */
  private readonly stopThreshold = 0.001;
  /** Elemento nativo del DOM asociado a la directiva. */
  private hostEl: HTMLElement;

   /**
    * Inicializa una nueva instancia de la directiva Tilt3D.
    * @param elRef Referencia al elemento del host en el DOM.
    * @param renderer Servicio de renderizado para manipular estilos de forma segura.
    * @param ngZone Servicio para ejecutar la animación fuera de Angular y evitar ciclos innecesarios de detección de cambios.
    */
  constructor(
    elRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private ngZone: NgZone,
  ) {
    this.hostEl = elRef.nativeElement;
  }

  /**
   * Inicializa la directiva aplicando las clases CSS y estilos de origen de transformación iniciales.
   */
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

  /**
   * Cancela cualquier ciclo de animación activo al destruir la directiva.
   */
  ngOnDestroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Manejador del evento mouseenter. Activa el escalado por hover e inicia la animación.
   */
  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.tiltEnabled) return;
    this.hoverTarget = 1;
    this.startAnimation();
  }

  /**
   * Manejador del evento mousemove. Calcula la posición normalizada del cursor dentro
   * del elemento y actualiza el objetivo de rotación.
   * @param event Objeto del evento de ratón.
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

  /**
   * Manejador del evento mouseleave. Restablece los objetivos de rotación y escala a cero
   * para volver a la posición original suavemente.
   */
  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hoverTarget = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.startAnimation();
  }

  /**
   * Inicia el bucle de animación para aplicar los estilos de inclinación tridimensionales
   * y el reflejo de iluminación (glare).
   */
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
