/**
 * @file: src/app/pages/aichat/aichat.component.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Componente de chat con IA.
 */

import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  NgZone,
  Renderer2,
  PLATFORM_ID,
  signal,
  inject,
  HostListener,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ChatService } from '../../core/services/impl/chat.service';
import { LocalizedCurrencyPipe } from '../../pipes/localized-currency.pipe';
import { UiStateService } from '../../core/services/ui-state.service';
import {
  ChatSession,
  ChatMessage,
  GameResult,
} from '../../core/models/chat.model';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { Tilt3DDirective } from '../../directives/tilt-3d.directive';

/**
 * Componente de Chat con Inteligencia Artificial.
 * Permite a los usuarios interactuar con un asistente IA para obtener recomendaciones
 * de juegos, consultar dudas y gestionar sesiones de chat históricas.
 */
@Component({
  selector: 'app-aichat',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    TranslatePipe,
    MarkdownPipe,
    LocalizedCurrencyPipe,
    Tilt3DDirective,
  ],
  templateUrl: './aichat.component.html',
  styleUrl: './aichat.component.scss',
})
export class AIChatComponent implements OnInit, OnDestroy, AfterViewInit {
  /** Servicio para interactuar con la lógica y las llamadas de la API de chat con IA. */
  private chatService = inject(ChatService);
  /** Enrutador de Angular para navegación. */
  private router = inject(Router);
  /** Servicio para validar la autenticación y la información del usuario actual. */
  private authService = inject(BaseAuthenticationService);
  /** Servicio de traducción internacional multiidioma de Angular. */
  private translateService = inject(TranslateService);
  /** Zona de ejecución de Angular para optimizar la detección de cambios. */
  private ngZone = inject(NgZone);
  /** Renderizador nativo de Angular para interactuar con el DOM de manera segura. */
  private renderer = inject(Renderer2);

  /** Referencia al contenedor de mensajes para el scroll automático. */
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  /** Referencia al contenedor de la barra lateral para efectos de scroll. */
  @ViewChild('sidebarScrollContainer')
  private sidebarScrollContainer!: ElementRef;
  /** Referencia al elemento de título para medir su ancho. */
  @ViewChild('chatTitleEl') private chatTitleEl!: ElementRef;
  /** Referencia al span interno del título para medir el ancho exacto del texto. */
  @ViewChild('chatTitleSpanEl') private chatTitleSpanEl!: ElementRef;
  /** Referencia al encabezado de bienvenida para medir su altura dinámica. */
  @ViewChild('welcomeHeader') private welcomeHeader!: ElementRef;

  /** Lista de sesiones de chat del usuario. */
  sessions: ChatSession[] = [];
  /** Sesión de chat seleccionada actualmente. */
  currentSession: ChatSession | null = null;
  /** Historial de mensajes de la sesión activa. */
  messages: ChatMessage[] = [];
  /** Texto introducido por el usuario en el campo de entrada. */
  userInput: string = '';
  /** Controla si el input del chat tiene foco para aplicar estilos de forma 100% fiable. */
  isInputFocused: boolean = false;
  /** Indica si la IA está procesando una respuesta. */
  isLoading: boolean = false;
  /** Nombre del usuario para personalización en la interfaz. */
  userName: string = '';
  /** Controla la visibilidad del modal de autenticación requerida. */
  showAuthModal: boolean = false;
  /** Indica si la transición de entrada del modal de autenticación está completa. */
  authModalOpen = false;
  /** Indica si la transición de salida del modal de autenticación está activa. */
  authModalClosing = false;
  /** Duración en milisegundos de la animación del modal de autenticación. */
  private readonly authModalAnimMs = 160;
  /** Estado de autenticación del usuario. */
  isUserAuthenticated: boolean = false;
  /** URL del avatar del usuario. */
  userAvatar: string | null = null;
  /** Indica si las sesiones se están cargando inicialmente. */
  loadingSessions: boolean = true;
  /** Recuento en caché de sesiones de chat. */
  cachedSessionsCount = 0;
  /** Indica si el componente se está ejecutando en el navegador. */
  isBrowser = false;

  /** Identificador de la plataforma de Angular. */
  private platformId = inject(PLATFORM_ID);
  /** Servicio que gestiona el estado dinámico global de la interfaz de usuario. */
  private uiState = inject(UiStateService);
  /** Indica si la aplicación está lista (tras auto-login). */
  isAppReady = toSignal(this.authService.ready$, { initialValue: false });
  /** Indica si el retraso mínimo de skeletons ha terminado. */
  private minSkeletonDelayDone = signal(false);
  /** Timeout para el retraso mínimo de skeletons. */
  private skeletonTimeoutId: any;
  /** Sesiones de chat cargadas de la API. */
  private sessionsData: ChatSession[] = [];
  /** Indica si la petición de red a la API ha concluido. */
  private isApiLoadComplete = false;
  /** Controla si se está mostrando el spinner circular durante la restauración de una sesión. */
  isRestoringSession = false;

  /** Clave de almacenamiento local para guardar el recuento de sesiones del chat. */
  private readonly chatSessionsCountStorageKey = 'chatSessionsCount';
  /** Clave de almacenamiento local para almacenar el ID de la sesión activa. */
  private readonly activeSessionStorageKey = 'game_sage_active_chat_session_id';
  /** Clave de almacenamiento local para registrar la marca de tiempo de la salida del chat. */
  private readonly chatExitTimestampKey = 'game_sage_chat_exit_timestamp';
  /** Límite de tiempo en milisegundos tras el cual la sesión expira (2 minutos). */
  private readonly SESSION_EXPIRATION_MS = 2 * 60 * 1000;

  /** Controla el estado de la barra lateral en dispositivos móviles. */
  isMobileSidebarOpen = false;
  /** Flag interno para forzar el scroll al final tras cambios en la vista. */
  private shouldScrollToBottomFlag = false;
  /** Indica si se debe usar scroll suave o instantáneo. */
  private useSmoothScroll = true;
  /** Controla la transición de opacidad del contenido del chat para cambios suaves. */
  isContentVisible = true;
  /** Controla la transición de opacidad únicamente de la barra de título superior. */
  isHeaderTitleVisible = true;
  /** Controla si el usuario está editando el título en la cabecera. */
  isEditingTitle = false;
  /** Valor temporal para la edición del título de la sesión. */
  editingTitleValue = '';
  /** Ancho dinámico del input en píxeles. */
  titleInputWidth = '200px';
  /** IDs de las sesiones que están en proceso de eliminación (para animar su salida). */
  deletingSessionIds = new Set<number>();
  /** Almacena los IDs de las sesiones que existían durante la carga inicial para silenciar su animación. */
  initialSessionIds = new Set<number>();
  /** Registra si ya se ha completado la carga inicial de sesiones de este componente. */
  hasPerformedInitialLoad = false;

  /** Control visual de degradados para scroll en el chat principal. */
  showMainTopFade = false;
  /** Control visual de degradado inferior para scroll en el chat principal. */
  showMainBottomFade = false;
  /** Control visual de degradados para scroll en la barra lateral. */
  showSidebarTopFade = false;
  /** Control visual de degradado inferior para scroll en la barra lateral. */
  showSidebarBottomFade = false;

  /** Visibilidad de barras de scroll personalizadas. */
  showSidebarScrollbar = false;
  /** Visibilidad de barra de scroll principal personalizada. */
  showMainScrollbar = false;
  /** Temporizadores para ocultar las barras de scroll tras inactividad. */
  private sidebarActivityTimer: any;
  /** Temporizador de inactividad para ocultar la barra de scroll del chat principal. */
  private mainActivityTimer: any;
  /** Indica si hay un proceso de sincronización de vista programado en cola. */
  private viewSyncQueued = false;

  /** Lista completa de sugerencias para el chat con IA. */
  private readonly allSuggestions: string[] = [
    'suggestion_terror',
    'suggestion_rpg',
    'suggestion_coop',
    'suggestion_ps5',
    'suggestion_retro',
    'suggestion_indie',
    'suggestion_action',
    'suggestion_strategy',
    'suggestion_graphics',
    'suggestion_free',
    'suggestion_family',
    'suggestion_switch',
    'suggestion_openworld',
    'suggestion_cyberpunk',
    'suggestion_relaxing',
  ];

  /** Sugerencias activas que se muestran en la pantalla de bienvenida. */
  activeSuggestions: string[] = [
    'suggestion_terror',
    'suggestion_rpg',
    'suggestion_coop',
    'suggestion_ps5',
  ];

  /** Número de sugerencias visibles en pantalla. Se ajusta dinámicamente en móvil para evitar scroll. */
  visibleSuggestionsCount: number = 4;

  /** Índice de la sugerencia que se encuentra en transición de desvanecimiento (fade). */
  fadingIndex: number | null = null;
  /** Identificador del intervalo para la rotación automática de sugerencias. */
  private rotationIntervalId: any = null;

  /** Rota de manera aleatoria las sugerencias de chat activas a mostrar. */
  rotateSuggestions(): void {
    const shuffled = [...this.allSuggestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    this.activeSuggestions = shuffled.slice(0, 4);
    this.adjustMobileSuggestionsCount();
  }

  /** Inicia el temporizador de rotación de sugerencias cuando no se muestran todas las tarjetas en móviles. */
  startRotationTimer(): void {
    if (!this.isBrowser) return;
    this.stopRotationTimer();
    this.rotationIntervalId = setInterval(() => {
      this.rotateSingleSuggestion();
    }, 4000);
  }

  /** Detiene el temporizador de rotación de sugerencias. */
  stopRotationTimer(): void {
    if (this.rotationIntervalId) {
      clearInterval(this.rotationIntervalId);
      this.rotationIntervalId = null;
    }
  }

  /** Rota gradualmente una única sugerencia visible en móviles. */
  rotateSingleSuggestion(): void {
    if (this.messages.length > 0 || this.visibleSuggestionsCount >= 4) {
      return;
    }

    // Seleccionar un índice aleatorio de las tarjetas visibles actualmente
    const targetIdx = Math.floor(Math.random() * this.visibleSuggestionsCount);

    // Obtener las sugerencias que no están visibles actualmente
    const activeSet = new Set(this.activeSuggestions.slice(0, this.visibleSuggestionsCount));
    const available = this.allSuggestions.filter((s) => !activeSet.has(s));
    if (available.length === 0) return;

    // Seleccionar una sugerencia aleatoria del pool disponible
    const nextSuggestion = available[Math.floor(Math.random() * available.length)];

    // Iniciar desvanecimiento (fade-out)
    this.fadingIndex = targetIdx;

    // Esperar 300ms a que termine el fade-out para cambiar el texto y hacer fade-in
    setTimeout(() => {
      if (this.messages.length === 0 && targetIdx < this.visibleSuggestionsCount) {
        this.activeSuggestions[targetIdx] = nextSuggestion;
      }
      this.fadingIndex = null;
    }, 300);
  }

  /** Ajusta dinámicamente el número de sugerencias visibles en móvil según el espacio vertical disponible. */
  @HostListener('window:resize')
  adjustMobileSuggestionsCount(): void {
    if (!this.isBrowser) return;

    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      this.visibleSuggestionsCount = 4;
      return;
    }

    const container = this.scrollContainer?.nativeElement;
    const header = this.welcomeHeader?.nativeElement;
    if (!container || !header) {
      return;
    }

    const totalHeight = container.clientHeight;
    const headerHeight = header.offsetHeight;

    // Alturas fijas y márgenes de seguridad en móvil:
    // - Padding superior del contenedor: pt-6 (24px)
    // - Espaciado vertical (gap) entre elementos: space-y-2 (8px)
    // - Margen superior de la rejilla de sugerencias: mt-4 (16px)
    // - Spacer inferior móvil: h-10 (40px)
    // - Margen de seguridad para asegurar que no se produzca scroll: (24px)
    const fixedHeights = 24 + 8 + 16 + 40 + 24;
    const availableHeight = totalHeight - headerHeight - fixedHeights;

    // Altura aproximada de una tarjeta de sugerencia en móvil (p-4 es padding de 32px vertical + texto/borde)
    let cardHeight = 56;
    const firstButton = container.querySelector('.grid button');
    if (firstButton) {
      const height = firstButton.offsetHeight;
      if (height > 0) {
        cardHeight = height;
      }
    }

    const gap = 12; // gap-3 es 12px
    
    // N * cardHeight + (N - 1) * gap <= availableHeight
    // N * (cardHeight + gap) - gap <= availableHeight
    // N <= (availableHeight + gap) / (cardHeight + gap)
    const maxCards = Math.floor((availableHeight + gap) / (cardHeight + gap));

    this.visibleSuggestionsCount = Math.max(1, Math.min(4, maxCards));
  }

  /** Alterna la visibilidad de la barra lateral móvil. */
  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
    this.uiState.isChatSidebarOpen.set(this.isMobileSidebarOpen);
  }

  /** Cierra la barra lateral móvil. */
  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
    this.uiState.isChatSidebarOpen.set(false);
  }

  /**
   * Inicializa una nueva instancia de AIChatComponent.
   * Determina si se ejecuta en navegador y registra los escuchas correspondientes.
   */
  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      if (this.uiState.loaderAnimationDone()) {
        this.startMinimumSkeletonDelay();
      } else {
        window.addEventListener(
          'gamingsage-home-trigger',
          this.onLoaderFinished,
        );
      }
    }
  }

  /**
   * Configura el estado inicial, suscripciones de usuario y carga de sesiones.
   */
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }

    if (this.isBrowser) {
      setTimeout(() => {
        this.rotateSuggestions();
        this.startRotationTimer();
      }, 0);
      const exitTimeStr = localStorage.getItem(this.chatExitTimestampKey);
      if (exitTimeStr) {
        const exitTime = parseInt(exitTimeStr, 10);
        if (Date.now() - exitTime > this.SESSION_EXPIRATION_MS) {
          localStorage.removeItem(this.activeSessionStorageKey);
        }
        localStorage.removeItem(this.chatExitTimestampKey);
      }

      const storedSessionId = localStorage.getItem(
        this.activeSessionStorageKey,
      );
      if (storedSessionId) {
        this.isContentVisible = false;
        this.isRestoringSession = true;
      }
    }

    this.cachedSessionsCount = 3;
    if (this.isBrowser) {
      const hasToken = !!this.authService.getToken();
      if (hasToken) {
        this.cachedSessionsCount = this.getInitialSessionsCount() || 3;
      } else {
        this.cachedSessionsCount = 0;
        this.loadingSessions = false;
        this.updateCachedSessionsCount(0);
      }
    }

    this.authService.user$.subscribe((user) => {
      this.userName = user?.nickname || user?.name || '';
      if (user && user.media && user.media.length > 0) {
        this.userAvatar = user.media[0].url;
      } else {
        this.userAvatar = null;
      }
    });
    this.authService.ready$.subscribe((ready) => {
      if (ready) {
        this.authService.authenticated$.subscribe((isAuth) => {
          this.isUserAuthenticated = isAuth;
          if (isAuth) {
            this.loadSessions();
          } else {
            this.sessions = [];
            this.sessionsData = [];
            if (this.isBrowser) {
              this.loadingSessions = false;
            }
            this.updateCachedSessionsCount(0);
          }
        });
      }
    });
  }

  /** Limpia clases específicas del body al salir del chat. */
  ngOnDestroy(): void {
    if (this.isBrowser) {
      localStorage.setItem(this.chatExitTimestampKey, Date.now().toString());
      this.stopRotationTimer();
    }

    this.uiState.isChatSidebarOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener(
        'gamingsage-home-trigger',
        this.onLoaderFinished,
      );
    }
    if (this.sidebarActivityTimer) {
      clearTimeout(this.sidebarActivityTimer);
    }
    if (this.mainActivityTimer) {
      clearTimeout(this.mainActivityTimer);
    }
    if (this.skeletonTimeoutId) {
      clearTimeout(this.skeletonTimeoutId);
    }
  }

  /**
   * Ciclo de vida que se ejecuta tras inicializar la vista del componente.
   */
  ngAfterViewInit(): void {
    this.scheduleViewSync();
  }

  /**
   * Programa la sincronización de la vista y el scroll en el próximo frame de animación.
   */
  private scheduleViewSync() {
    if (this.viewSyncQueued) return;
    this.viewSyncQueued = true;
    if (this.isBrowser) {
      this.ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => {
          this.ngZone.run(() => {
            this.viewSyncQueued = false;
            if (this.shouldScrollToBottomFlag) {
              this.scrollToBottom();
              this.shouldScrollToBottomFlag = false;
              this.useSmoothScroll = true;
            }
            this.checkMainScroll();
            this.checkSidebarScroll();
            this.adjustMobileSuggestionsCount();
          });
        });
      });
    } else {
      this.viewSyncQueued = false;
    }
  }

  /** Muestra la barra de scroll de la lateral al entrar el ratón. */
  onSidebarMouseEnter() {
    this.showSidebarScrollbar = true;
    this.resetSidebarActivityTimer();
  }

  /** Oculta la barra de scroll de la lateral al salir el ratón. */
  onSidebarMouseLeave() {
    this.showSidebarScrollbar = false;
    if (this.sidebarActivityTimer) {
      clearTimeout(this.sidebarActivityTimer);
    }
  }

  /** Reinicia el contador de visibilidad de scroll de la lateral al mover el ratón. */
  onSidebarMouseMove() {
    if (!this.showSidebarScrollbar) {
      this.showSidebarScrollbar = true;
    }
    this.resetSidebarActivityTimer();
  }

  /** Muestra la barra de scroll principal al entrar el ratón. */
  onMainMouseEnter() {
    this.showMainScrollbar = true;
    this.resetMainActivityTimer();
  }

  /** Oculta la barra de scroll principal al salir el ratón. */
  onMainMouseLeave() {
    this.showMainScrollbar = false;
    if (this.mainActivityTimer) {
      clearTimeout(this.mainActivityTimer);
    }
  }

  /** Reinicia el contador de visibilidad de scroll principal al mover el ratón. */
  onMainMouseMove() {
    if (!this.showMainScrollbar) {
      this.showMainScrollbar = true;
    }
    this.resetMainActivityTimer();
  }

  /** Temporizador de inactividad para ocultar scroll lateral. */
  private resetSidebarActivityTimer() {
    if (this.sidebarActivityTimer) {
      clearTimeout(this.sidebarActivityTimer);
    }
    this.sidebarActivityTimer = setTimeout(() => {
      this.showSidebarScrollbar = false;
    }, 2000);
  }

  /** Temporizador de inactividad para ocultar scroll principal. */
  private resetMainActivityTimer() {
    if (this.mainActivityTimer) {
      clearTimeout(this.mainActivityTimer);
    }
    this.mainActivityTimer = setTimeout(() => {
      this.showMainScrollbar = false;
    }, 2000);
  }

  /** Calcula si deben mostrarse los degradados de scroll en el chat. */
  checkMainScroll() {
    const el = this.scrollContainer?.nativeElement;
    if (!el) return;
    this.showMainTopFade = el.scrollTop > 10;
    this.showMainBottomFade =
      el.scrollHeight - el.scrollTop - el.clientHeight > 10;
  }

  /** Calcula si deben mostrarse los degradados de scroll en la lateral. */
  checkSidebarScroll() {
    const el = this.sidebarScrollContainer?.nativeElement;
    if (!el) return;
    this.showSidebarTopFade = el.scrollTop > 10;
    this.showSidebarBottomFade =
      el.scrollHeight - el.scrollTop - el.clientHeight > 10;
  }

  /**
   * Envía un mensaje basado en una sugerencia predefinida.
   * @param key Clave de traducción del texto sugerido.
   */
  sendSuggestion(key: string) {
    const text = this.translateService.instant(key);
    this.userInput = text;
    this.sendMessage();
  }

  /** Desplaza el contenedor de mensajes hacia el final. */
  scrollToBottom(): void {
    try {
      const el = this.scrollContainer.nativeElement;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: this.useSmoothScroll ? 'smooth' : 'auto',
      });
    } catch (err) { }
  }

  /** Carga el listado de sesiones de chat del usuario autenticado. */
  loadSessions() {
    this.loadingSessions = true;
    this.chatService.getSessions().subscribe({
      next: (sessions) => {
        this.sessionsData = sessions;
        this.isApiLoadComplete = true;
        this.checkAndApplySessions();
      },
      error: () => {
        this.isApiLoadComplete = true;
        this.checkAndApplySessions();
        this.scheduleViewSync();
      },
    });
  }

  /**
   * Callback ejecutado cuando el cargador principal de la app ha finalizado.
   * Inicia el retraso mínimo de visualización de los skeletons de carga.
   */
  private onLoaderFinished = () => {
    this.startMinimumSkeletonDelay();
  };

  /**
   * Inicia el contador de retraso mínimo para los skeletons (1100ms).
   */
  private startMinimumSkeletonDelay() {
    if (!isPlatformBrowser(this.platformId) || this.skeletonTimeoutId) return;

    this.ngZone.run(() => {
      this.minSkeletonDelayDone.set(false);
    });

    this.ngZone.runOutsideAngular(() => {
      this.skeletonTimeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.minSkeletonDelayDone.set(true);
          this.skeletonTimeoutId = null;
          this.checkAndApplySessions();
        });
      }, 1100);
    });
  }

  /**
   * Aplica las sesiones cargadas a la vista si se cumplen todas las condiciones.
   */
  private checkAndApplySessions() {
    if (
      !this.isAppReady() ||
      !this.minSkeletonDelayDone() ||
      !this.isApiLoadComplete
    ) {
      return;
    }

    const isFirstTime = !this.hasPerformedInitialLoad;

    if (!this.hasPerformedInitialLoad) {
      this.hasPerformedInitialLoad = true;
      this.sessionsData.forEach((s) => {
        if (s.id) {
          this.initialSessionIds.add(s.id);
        }
      });
    }

    this.sessions = this.sessionsData;
    this.loadingSessions = false;
    this.updateCachedSessionsCount(this.sessions.length);
    this.scheduleViewSync();

    if (isFirstTime && isPlatformBrowser(this.platformId)) {
      const storedSessionId = localStorage.getItem(
        this.activeSessionStorageKey,
      );
      let sessionRestored = false;

      if (storedSessionId) {
        const parsedId = parseInt(storedSessionId, 10);
        const foundSession = this.sessions.find((s) => s.id === parsedId);
        if (foundSession) {
          this.selectSession(foundSession);
          sessionRestored = true;
        } else {
          localStorage.removeItem(this.activeSessionStorageKey);
        }
      }

      if (!sessionRestored && !this.isContentVisible) {
        this.isRestoringSession = false;
        setTimeout(() => {
          this.isContentVisible = true;
        }, 30);
      }
    }
  }

  /** Prepara la interfaz para iniciar una nueva conversación. */
  startNewChat() {
    if (this.currentSession === null && this.messages.length === 0) {
      return;
    }

    if (!this.checkAuth()) return;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.activeSessionStorageKey);
    }

    this.isContentVisible = false;
    this.isHeaderTitleVisible = true;
    this.isEditingTitle = false;
    setTimeout(() => {
      this.rotateSuggestions();
      this.currentSession = null;
      this.messages = [];
      this.useSmoothScroll = false;
      this.scheduleViewSync();
      setTimeout(() => {
        this.isContentVisible = true;
      }, 30);
    }, 150);
  }

  /**
   * Selecciona una sesión de historial y carga sus mensajes.
   * @param session Sesión de chat seleccionada.
   */
  selectSession(session: ChatSession) {
    if (this.currentSession?.id === session.id) return;

    if (isPlatformBrowser(this.platformId) && session.id) {
      localStorage.setItem(this.activeSessionStorageKey, session.id.toString());
    }

    this.useSmoothScroll = false;
    this.isContentVisible = false;
    this.isHeaderTitleVisible = true;
    this.isEditingTitle = false;
    const startTime = Date.now();

    this.closeMobileSidebar();
    this.chatService.getSession(session.id!).subscribe({
      next: (fullSession) => {
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, 150 - elapsed);

        setTimeout(() => {
          this.currentSession = session;
          this.messages = fullSession.messages || [];
          this.messages.forEach((msg) => this.processMessageLinks(msg));
          this.shouldScrollToBottomFlag = true;
          this.scheduleViewSync();
          this.isRestoringSession = false;
          setTimeout(() => {
            this.isContentVisible = true;
          }, 30);
        }, remainingDelay);
      },
      error: () => {
        this.isRestoringSession = false;
        this.isContentVisible = true;
      },
    });
  }

  /**
   * Elimina una sesión de chat permanentemente.
   * @param session Sesión a eliminar.
   * @param event Evento del ratón.
   */
  deleteSession(session: ChatSession, event: Event) {
    event.stopPropagation();
    if (!session.id) return;

    this.chatService.deleteSession(session.id).subscribe({
      next: () => {
        this.deletingSessionIds.add(session.id!);
        setTimeout(() => {
          this.sessions = this.sessions.filter((s) => s.id !== session.id);
          this.deletingSessionIds.delete(session.id!);
          this.updateCachedSessionsCount(this.sessions.length);
          if (this.currentSession?.id === session.id) {
            this.startNewChat();
          }
        }, 200);
      },
      error: () => { },
    });
  }

  /** Envía el mensaje del usuario a la API de IA y procesa la respuesta. */
  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    if (!this.checkAuth()) {
      this.userInput = '';
      return;
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: this.userInput,
    };
    this.messages.push(userMsg);
    this.shouldScrollToBottomFlag = true;
    this.scheduleViewSync();
    const payload = {
      message: this.userInput,
      sessionId: this.currentSession?.id,
    };

    this.userInput = '';
    this.isLoading = true;

    this.chatService.sendMessage(payload).subscribe({
      next: (response) => {
        if (!this.currentSession) {
          if (isPlatformBrowser(this.platformId) && response.sessionId) {
            localStorage.setItem(
              this.activeSessionStorageKey,
              response.sessionId.toString(),
            );
          }
          this.loadSessions();
          this.currentSession = { id: response.sessionId };

          setTimeout(() => {
            const foundSession = this.sessions.find(
              (s) => s.id === response.sessionId,
            );
            if (
              foundSession &&
              foundSession.title &&
              this.currentSession?.id === response.sessionId
            ) {
              this.isHeaderTitleVisible = false;
              setTimeout(() => {
                if (this.currentSession) {
                  this.currentSession.title = foundSession.title;
                }
                setTimeout(() => {
                  this.isHeaderTitleVisible = true;
                }, 30);
              }, 300);
            }
          }, 5000);
        }

        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: response.text,
          games: response.games,
        };
        this.processMessageLinks(aiMsg);
        this.messages.push(aiMsg);
        this.shouldScrollToBottomFlag = true;
        this.isLoading = false;
        this.scheduleViewSync();
      },
      error: () => {
        this.isLoading = false;
        this.messages.push({
          role: 'assistant',
          content: 'Lo siento, ha ocurrido un error al procesar tu mensaje.',
        });
        this.shouldScrollToBottomFlag = true;
        this.scheduleViewSync();
      },
    });
  }

  /**
   * Redirige a la página de detalle de un producto sugerido.
   * @param gameId ID del juego a navegar.
   */
  navigateToGame(gameId: number) {
    this.router.navigate(['/product', gameId]);
  }

  /**
   * Verifica si el usuario está autenticado, de lo contrario muestra aviso.
   * @returns Verdadero si está autenticado; falso de lo contrario.
   */
  checkAuth(): boolean {
    if (!this.isUserAuthenticated) {
      this.showAuthModal = true;
      this.authModalClosing = false;
      this.authModalOpen = false;
      if (typeof document !== 'undefined')
        document.body.style.overflow = 'hidden';
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => {
          if (!this.authModalClosing) this.authModalOpen = true;
        });
      } else {
        this.authModalOpen = true;
      }
      return false;
    }
    return true;
  }

  /** Redirige al login tras aceptar el aviso de autenticación. */
  confirmLogin() {
    if (this.authModalClosing) return;
    this.authModalClosing = true;
    this.authModalOpen = false;
    const navigateTo = this.router.url;

    setTimeout(() => {
      this.showAuthModal = false;
      this.authModalClosing = false;
      this.authModalOpen = false;
      if (typeof document !== 'undefined') document.body.style.overflow = '';
      this.router.navigate(['/login'], { state: { navigateTo } });
    }, this.authModalAnimMs);
  }

  /** Cierra el aviso de login. */
  cancelLogin() {
    if (this.authModalClosing) return;
    this.authModalClosing = true;
    this.authModalOpen = false;
    setTimeout(() => {
      this.showAuthModal = false;
      this.authModalClosing = false;
      this.authModalOpen = false;
      if (typeof document !== 'undefined') document.body.style.overflow = '';
    }, this.authModalAnimMs);
  }

  /**
   * Maneja clicks en enlaces internos dentro del contenido generado por la IA (Markdown).
   * @param event Evento de ratón originado.
   */
  handleContentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor && anchor.getAttribute('href')?.startsWith('/product/')) {
      event.preventDefault();
      const href = anchor.getAttribute('href');
      if (href) {
        const id = href.split('/').pop();
        if (id) {
          this.router.navigate(['/product', id]);
        }
      }
    }
  }

  /**
   * Convierte menciones de títulos de juegos en enlaces navegables dentro del texto de la respuesta.
   * @param message Mensaje que contiene la respuesta de la IA.
   */
  private processMessageLinks(message: ChatMessage) {
    if (!message.games || message.games.length === 0) return;

    const sortedGames = [...message.games].sort(
      (a, b) => b.title.length - a.title.length,
    );

    sortedGames.forEach((game) => {
      const safeTitle = game.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // eslint-disable-next-line security/detect-non-literal-regexp
      const boldRegex = new RegExp(`\\*\\*${safeTitle}\\*\\*`, 'gi');
      message.content = message.content.replace(
        boldRegex,
        `[${game.title}](/product/${game.id})`,
      );
    });
  }

  /** Obtiene un array con los índices correspondientes a la cantidad de sesiones recientes. */
  get recentSessionsCount(): number[] {
    const count = this.cachedSessionsCount || 3;
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  /**
   * Obtiene la cantidad de sesiones almacenadas en el caché local al iniciar el componente.
   * @returns El número de sesiones almacenadas, o 0 si no se encuentra.
   */
  private getInitialSessionsCount(): number {
    if (isPlatformBrowser(this.platformId)) {
      const cached = localStorage.getItem(this.chatSessionsCountStorageKey);
      if (cached) {
        return parseInt(cached, 10);
      }
    }
    return 0;
  }

  /**
   * Actualiza el recuento de sesiones en caché en el estado y almacenamiento local.
   * @param count El nuevo número de sesiones.
   */
  private updateCachedSessionsCount(count: number): void {
    this.cachedSessionsCount = count;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.chatSessionsCountStorageKey, count.toString());
    }
  }

  /**
   * Inicia el modo de edición para el título de la sesión de chat actual.
   * Mide el texto actual para ajustar dinámicamente el ancho del input.
   */
  startEditingTitle() {
    if (!this.currentSession) return;
    this.editingTitleValue = this.currentSession.title || '';

    if (this.chatTitleSpanEl && this.chatTitleSpanEl.nativeElement) {
      const spanWidth =
        this.chatTitleSpanEl.nativeElement.getBoundingClientRect().width;
      const maxAllowed = Math.floor(window.innerWidth * 0.45);
      const width = Math.min(Math.max(spanWidth + 0, 140), maxAllowed);
      this.titleInputWidth = `${width}px`;
    } else {
      this.titleInputWidth = '200px';
    }

    this.isEditingTitle = true;
    setTimeout(() => {
      const input = document.getElementById(
        'title-edit-input',
      ) as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 50);
  }

  /**
   * Cancela la edición activa del título de la sesión de chat actual y restaura el estado.
   */
  cancelEditingTitle() {
    this.isEditingTitle = false;
  }

  /** Capitaliza la primera letra de un texto de manera segura en JavaScript. */
  capitalizeFirstLetter(text: string | null | undefined): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /** Guarda los cambios de título en el backend y los aplica localmente. */
  saveTitle() {
    if (!this.currentSession || !this.currentSession.id) return;
    const cleanTitle = this.editingTitleValue.trim();
    if (!cleanTitle) {
      this.cancelEditingTitle();
      return;
    }

    const updatedSession = { ...this.currentSession, title: cleanTitle };
    this.chatService
      .update(this.currentSession.id.toString(), updatedSession)
      .subscribe({
        next: () => {
          if (this.currentSession) {
            this.currentSession.title = cleanTitle;
          }
          const found = this.sessions.find(
            (s) => s.id === this.currentSession?.id,
          );
          if (found) {
            found.title = cleanTitle;
          }
          this.isEditingTitle = false;
          this.scheduleViewSync();
        },
        error: () => {
          this.cancelEditingTitle();
        },
      });
  }

  /**
   * Escucha global para el evento mousedown en el documento.
   * Cancela el modo de edición de título de chat si se hace clic fuera del input de edición o del botón de editar.
   * @param event El evento de ratón mousedown.
   */
  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent) {
    if (this.isEditingTitle) {
      const target = event.target as HTMLElement;
      const clickedEditContainer = target.closest('.title-edit-container');
      const clickedPencilBtn = target.closest('.edit-title-btn');
      if (!clickedEditContainer && !clickedPencilBtn) {
        this.cancelEditingTitle();
      }
    }
  }

  /**
   * Escucha global del ciclo de vida de la ventana antes de descargarse.
   * Almacena una marca de tiempo en el almacenamiento local para controlar la expiración de la sesión.
   */
  @HostListener('window:beforeunload')
  onBeforeUnload() {
    if (this.isBrowser) {
      localStorage.setItem(this.chatExitTimestampKey, Date.now().toString());
    }
  }
}
