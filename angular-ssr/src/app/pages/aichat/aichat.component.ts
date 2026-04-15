import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  Renderer2,
  Inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ChatService } from '../../core/services/impl/chat.service';
import {
  ChatSession,
  ChatMessage,
  GameResult,
} from '../../core/models/chat.model';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';

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
  ],
  templateUrl: './aichat.component.html',
  styleUrl: './aichat.component.scss',
})
export class AIChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  /** Referencia al contenedor de mensajes para el scroll automático. */
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  /** Referencia al contenedor de la barra lateral para efectos de scroll. */
  @ViewChild('sidebarScrollContainer') private sidebarScrollContainer!: ElementRef;

  /** Lista de sesiones de chat del usuario. */
  sessions: ChatSession[] = [];
  /** Sesión de chat seleccionada actualmente. */
  currentSession: ChatSession | null = null;
  /** Historial de mensajes de la sesión activa. */
  messages: ChatMessage[] = [];
  /** Texto introducido por el usuario en el campo de entrada. */
  userInput: string = '';
  /** Indica si la IA está procesando una respuesta. */
  isLoading: boolean = false;
  /** Nombre del usuario para personalización en la interfaz. */
  userName: string = '';
  /** Controla la visibilidad del modal de autenticación requerida. */
  showAuthModal: boolean = false;
  /** Estado de autenticación del usuario. */
  isUserAuthenticated: boolean = false;
  /** URL del avatar del usuario. */
  userAvatar: string | null = null;
  /** Indica si las sesiones se están cargando inicialmente. */
  loadingSessions: boolean = true;

  /** Controla el estado de la barra lateral en dispositivos móviles. */
  isMobileSidebarOpen = false;
  /** Flag interno para forzar el scroll al final tras cambios en la vista. */
  private shouldScrollToBottomFlag = false;

  /** Control visual de degradados para scroll en el chat principal. */
  showMainTopFade = false;
  showMainBottomFade = false;
  /** Control visual de degradados para scroll en la barra lateral. */
  showSidebarTopFade = false;
  showSidebarBottomFade = false;

  /** Visibilidad de barras de scroll personalizadas. */
  showSidebarScrollbar = false;
  showMainScrollbar = false;
  /** Temporizadores para ocultar las barras de scroll tras inactividad. */
  private sidebarActivityTimer: any;
  private mainActivityTimer: any;
  private viewSyncQueued = false;

  /** Alterna la visibilidad de la barra lateral móvil. */
  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  /** Cierra la barra lateral móvil. */
  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }

  constructor(
    private chatService: ChatService,
    private router: Router,
    private authService: BaseAuthenticationService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private translateService: TranslateService,
  ) {}

  /**
   * Configura el estado inicial, suscripciones de usuario y carga de sesiones.
   */
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    if (this.document.body) {
      this.renderer.addClass(this.document.body, 'chat-mode');
    }

    this.authService.user$.subscribe((user) => {
      this.userName = user?.nickname || user?.name || '';
      if (user && user.media && user.media.length > 0) {
        this.userAvatar = user.media[0].url;
      } else {
        this.userAvatar = null;
      }
    });
    this.authService.authenticated$.subscribe((isAuth) => {
      this.isUserAuthenticated = isAuth;
      if (isAuth) {
        this.loadSessions();
      } else {
        this.sessions = [];
        this.loadingSessions = false;
      }
    });
  }

  /** Limpia clases específicas del body al salir del chat. */
  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'chat-mode');
    if (this.sidebarActivityTimer) {
      clearTimeout(this.sidebarActivityTimer);
    }
    if (this.mainActivityTimer) {
      clearTimeout(this.mainActivityTimer);
    }
  }

  /** Gestiona el scroll automático y la visibilidad de fades tras cada ciclo de detección de cambios. */
  ngAfterViewChecked(): void {
    this.scheduleViewSync();
  }

  private scheduleViewSync() {
    if (this.viewSyncQueued) return;
    this.viewSyncQueued = true;
    queueMicrotask(() => {
      this.viewSyncQueued = false;
      if (this.shouldScrollToBottomFlag) {
        this.scrollToBottom();
        this.shouldScrollToBottomFlag = false;
      }
      this.checkMainScroll();
      this.checkSidebarScroll();
    });
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

  /** Envía un mensaje basado en una sugerencia predefinida. */
  sendSuggestion(key: string) {
    const text = this.translateService.instant(key);
    this.userInput = text;
    this.sendMessage();
  }

  /** Desplaza el contenedor de mensajes hacia el final. */
  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  /** Carga el listado de sesiones de chat del usuario autenticado. */
  loadSessions() {
    this.loadingSessions = true;
    this.chatService.getSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.loadingSessions = false;
      },
      error: () => {
        this.loadingSessions = false;
      },
    });
  }

  /** Prepara la interfaz para iniciar una nueva conversación. */
  startNewChat() {
    if (!this.checkAuth()) return;
    this.currentSession = null;
    this.messages = [];
  }

  /** Selecciona una sesión de historial y carga sus mensajes. */
  selectSession(session: ChatSession) {
    if (this.currentSession?.id === session.id) return;

    this.currentSession = session;
    this.closeMobileSidebar();
    this.chatService.getSession(session.id!).subscribe({
      next: (fullSession) => {
        this.messages = fullSession.messages || [];
        this.messages.forEach((msg) => this.processMessageLinks(msg));
        this.shouldScrollToBottomFlag = true;
      },
      error: () => {},
    });
  }

  /** Elimina una sesión de chat permanentemente. */
  deleteSession(session: ChatSession, event: Event) {
    event.stopPropagation();
    if (!session.id) return;

    this.chatService.deleteSession(session.id).subscribe({
      next: () => {
        this.sessions = this.sessions.filter((s) => s.id !== session.id);
        if (this.currentSession?.id === session.id) {
          this.startNewChat();
        }
      },
      error: () => {},
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
    const payload = {
      message: this.userInput,
      sessionId: this.currentSession?.id,
    };

    this.userInput = '';
    this.isLoading = true;

    this.chatService.sendMessage(payload).subscribe({
      next: (response) => {
        if (!this.currentSession) {
          this.loadSessions();
          this.currentSession = { id: response.sessionId };
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
      },
      error: () => {
        this.isLoading = false;
        this.messages.push({
          role: 'assistant',
          content: 'Lo siento, ha ocurrido un error al procesar tu mensaje.',
        });
        this.shouldScrollToBottomFlag = true;
      },
    });
  }

  /** Redirige a la página de detalle de un producto sugerido. */
  navigateToGame(gameId: number) {
    this.router.navigate(['/product', gameId]);
  }

  /** Verifica si el usuario está autenticado, de lo contrario muestra aviso. */
  checkAuth(): boolean {
    if (!this.isUserAuthenticated) {
      this.showAuthModal = true;
      return false;
    }
    return true;
  }

  /** Redirige al login tras aceptar el aviso de autenticación. */
  confirmLogin() {
    this.showAuthModal = false;
    this.router.navigate(['/login'], {
      state: { navigateTo: this.router.url },
    });
  }

  /** Cierra el aviso de login. */
  cancelLogin() {
    this.showAuthModal = false;
  }

  /** Maneja clicks en enlaces internos dentro del contenido generado por la IA (Markdown). */
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
}
