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
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  sessions: ChatSession[] = [];
  currentSession: ChatSession | null = null;
  messages: ChatMessage[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  userName: string = '';
  showAuthModal: boolean = false;
  isUserAuthenticated: boolean = false;
  userAvatar: string | null = null;
  loadingSessions: boolean = true;

  isMobileSidebarOpen = false;
  private shouldScrollToBottomFlag = false;

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

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

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'chat-mode');
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottomFlag) {
      this.scrollToBottom();
      this.shouldScrollToBottomFlag = false;
    }
  }

  sendSuggestion(key: string) {
    const text = this.translateService.instant(key);
    this.userInput = text;
    this.sendMessage();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

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

  startNewChat() {
    if (!this.checkAuth()) return;
    this.currentSession = null;
    this.messages = [];
  }

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

  navigateToGame(gameId: number) {
    this.router.navigate(['/product', gameId]);
  }

  checkAuth(): boolean {
    if (!this.isUserAuthenticated) {
      this.showAuthModal = true;
      return false;
    }
    return true;
  }

  confirmLogin() {
    this.showAuthModal = false;
    this.router.navigate(['/login'], {
      state: { navigateTo: this.router.url },
    });
  }

  cancelLogin() {
    this.showAuthModal = false;
  }

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
