import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
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
export class AIChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  sessions: ChatSession[] = [];
  currentSession: ChatSession | null = null;
  messages: ChatMessage[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  userName: string = '';
  showAuthModal: boolean = false;
  isUserAuthenticated: boolean = false;
  loadingSessions: boolean = true;

  constructor(
    private chatService: ChatService,
    private router: Router,
    private authService: BaseAuthenticationService
  ) {}

  ngOnInit(): void {
    this.loadSessions();
    this.authService.user$.subscribe((user) => {
      this.userName = user?.nickname || user?.name || '';
    });
    this.authService.authenticated$.subscribe((isAuth) => {
      this.isUserAuthenticated = isAuth;
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
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
      error: (err) => {
        console.error('Error loading sessions', err);
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
    this.chatService.getSession(session.id!).subscribe({
      next: (fullSession) => {
        this.messages = fullSession.messages || [];
      },
      error: (err) => console.error('Error loading session', err),
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
      error: (err) => console.error('Error deleting session', err),
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
        this.messages.push(aiMsg);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error sending message', err);
        this.isLoading = false;
        this.messages.push({
          role: 'assistant',
          content: 'Lo siento, ha ocurrido un error al procesar tu mensaje.',
        });
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
}
