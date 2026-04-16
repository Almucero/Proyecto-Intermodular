import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  PLATFORM_ID,
  Inject,
  NgZone,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import type { Game } from '../../../core/models/game.model';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Componente de tarjeta para mostrar un juego individual.
 * Incluye lógica de animación para títulos largos (scroll horizontal)
 * y manejo de eventos de clic.
 */
@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss',
})
export class GameCardComponent implements AfterViewInit, OnDestroy {
  /** Objeto del juego a mostrar. */
  @Input() game!: Game;
  /** URL de la imagen de portada. */
  @Input() coverUrl!: string;
  /** Si es true, la tarjeta ocupará todo el ancho disponible. */
  @Input() fullWidth: boolean = false;
  /** Evento emitido al hacer clic en la tarjeta. */
  @Output() cardClick = new EventEmitter<number>();

  /** Referencia al elemento que contiene el título del juego. */
  @ViewChild('gameTitle') gameTitleElement!: ElementRef;

  /** Velocidad del scroll en píxeles por segundo. */
  readonly SPEED_PX_PER_SEC = 30;
  /** Duración total de un ciclo de animación en milisegundos. */
  readonly CYCLE_DURATION_MS = 8000;
  /** Retardo inicial antes de empezar a mover el texto. */
  readonly START_DELAY_MS = 1000;

  /** Indica si el texto está en movimiento actualmente. */
  isMoving = false;
  /** Indica si el título es más largo que el contenedor (requiere scroll). */
  hasOverflow = false;
  private loopInterval: any;
  private startTimeout: any;

  /** Referencia al wrapper de la imagen para aplicar el tilt. */
  @ViewChild('tiltInner') tiltInnerElement?: ElementRef<HTMLElement>;
  private tiltSupported = false;
  private tiltRafId: number | null = null;
  private tiltCurrentX = 0;
  private tiltCurrentY = 0;
  private tiltTargetX = 0;
  private tiltTargetY = 0;
  private tiltMaxRotateDeg = 8;
  private tiltMaxTranslatePx = 6;

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  /**
   * Inicializa la lógica de animación si se ejecuta en el navegador.
   */
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.requestAnimationFrame(() => this.initAnimationLogic());
      this.tiltSupported = true;
    }
  }

  /** Limpia los temporizadores para evitar fugas de memoria. */
  ngOnDestroy(): void {
    if (this.loopInterval) clearInterval(this.loopInterval);
    if (this.startTimeout) clearTimeout(this.startTimeout);
    if (this.tiltRafId !== null) cancelAnimationFrame(this.tiltRafId);
  }

  /**
   * Calcula si el título necesita animación y configura las propiedades CSS dinámicas.
   */
  initAnimationLogic(): void {
    if (!this.gameTitleElement) return;

    const spanElement = this.gameTitleElement.nativeElement as HTMLSpanElement;
    const containerElement = spanElement.parentElement as HTMLElement;

    spanElement.style.removeProperty('--scroll-distance');
    spanElement.style.removeProperty('--scroll-duration');

    const overflow = spanElement.scrollWidth - containerElement.clientWidth;

    if (overflow > 0) {
      this.hasOverflow = true;
      const moveDuration = overflow / this.SPEED_PX_PER_SEC;
      spanElement.style.setProperty('--scroll-distance', `-${overflow + 10}px`);
      spanElement.style.setProperty('--scroll-duration', `${moveDuration}s`);

      this.startLoop();
    }
  }

  /**
   * Inicia el ciclo infinito de animación del título.
   */
  startLoop(): void {
    const runCycle = () => {
      this.ngZone.run(() => {
        this.isMoving = false;
        this.cdr.detectChanges();
      });
      this.startTimeout = setTimeout(() => {
        this.ngZone.run(() => {
          this.isMoving = true;
          this.cdr.detectChanges();
        });
      }, this.START_DELAY_MS);
    };

    this.ngZone.runOutsideAngular(() => {
      runCycle();
      this.loopInterval = setInterval(runCycle, this.CYCLE_DURATION_MS);
    });
  }

  /** Maneja el clic en la tarjeta y emite el ID del juego. */
  onClick(): void {
    this.cardClick.emit(this.game.id);
  }

  onTiltMove(e: MouseEvent): void {
    if (!this.tiltSupported || this.game.id === -1) return;
    if (e.buttons === 1) return;

    const tiltInnerEl = this.tiltInnerElement?.nativeElement;
    if (!tiltInnerEl) return;

    const rootEl = tiltInnerEl.parentElement;
    if (!rootEl) return;

    const rect = rootEl.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const normalizedX = (x - 0.5) * 2; // [-1, 1]
    const normalizedY = (y - 0.5) * 2; // [-1, 1]

    this.tiltTargetX = Math.max(-1, Math.min(1, normalizedX));
    this.tiltTargetY = Math.max(-1, Math.min(1, normalizedY));
    this.startTiltAnimation(rootEl as HTMLElement);
  }

  onTiltLeave(): void {
    const el = this.tiltInnerElement?.nativeElement;
    if (!el) return;

    const targetEl = el.parentElement as HTMLElement | null;
    if (!targetEl) return;

    this.tiltTargetX = 0;
    this.tiltTargetY = 0;
    this.startTiltAnimation(targetEl);
  }

  private startTiltAnimation(targetEl: HTMLElement): void {
    if (this.tiltRafId !== null) return;

    const smoothFactor = 0.14; // Progresivo (lerp) para evitar saltos
    const stopThreshold = 0.0015;

    const step = () => {
      const dx = this.tiltTargetX - this.tiltCurrentX;
      const dy = this.tiltTargetY - this.tiltCurrentY;

      this.tiltCurrentX += dx * smoothFactor;
      this.tiltCurrentY += dy * smoothFactor;

      const depth = Math.max(
        Math.abs(this.tiltCurrentX),
        Math.abs(this.tiltCurrentY),
      );

      const rotateY = this.tiltCurrentX * this.tiltMaxRotateDeg;
      const rotateX = -this.tiltCurrentY * this.tiltMaxRotateDeg;
      const translateX = this.tiltCurrentX * this.tiltMaxTranslatePx;
      const translateY = this.tiltCurrentY * this.tiltMaxTranslatePx;

      const scale = 1 + depth * 0.06;
      const shadowX = this.tiltCurrentX * 10;
      const shadowY = this.tiltCurrentY * 12;
      const blur = 18 + depth * 22;
      const alpha = 0.18 + depth * 0.18;

      targetEl.style.transition = 'transform 0ms linear, box-shadow 0ms linear';
      targetEl.style.transform = `perspective(800px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(${translateX}px, ${translateY}px)`;
      targetEl.style.boxShadow = `${shadowX}px ${shadowY + 10}px ${blur}px rgba(0,0,0,${alpha})`;

      if (Math.abs(dx) < stopThreshold && Math.abs(dy) < stopThreshold) {
        this.tiltRafId = null;
        this.tiltCurrentX = this.tiltTargetX;
        this.tiltCurrentY = this.tiltTargetY;
        if (this.tiltTargetX === 0 && this.tiltTargetY === 0) {
          targetEl.style.boxShadow = '';
          targetEl.style.transform =
            'perspective(800px) rotateX(0deg) rotateY(0deg) translate(0px, 0px)';
        }
        return;
      }

      this.tiltRafId = window.requestAnimationFrame(step);
    };

    this.tiltRafId = window.requestAnimationFrame(step);
  }
}
