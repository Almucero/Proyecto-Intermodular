import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GameService } from '../../../../core/services/impl/game.service';
import { DeveloperService } from '../../../../core/services/impl/developer.service';
import { PublisherService } from '../../../../core/services/impl/publisher.service';
import { GenreService } from '../../../../core/services/impl/genre.service';
import { PlatformService } from '../../../../core/services/impl/platform.service';
import { Game } from '../../../../core/models/game.model';
import { Developer } from '../../../../core/models/developer.model';
import { Publisher } from '../../../../core/models/publisher.model';
import { Genre } from '../../../../core/models/genre.model';
import { Platform } from '../../../../core/models/platform.model';
import { switchMap, of, forkJoin, Observable } from 'rxjs';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';
import { IMediaRepository } from '../../../../core/repositories/interfaces/media-repository.interface';
import { MEDIA_REPOSITORY_TOKEN } from '../../../../core/repositories/repository.tokens';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-game-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    FileUploadComponent,
  ],
  templateUrl: './game-form.component.html',
  styleUrl: './game-form.component.scss',
})
export class GameFormComponent implements OnInit, OnChanges, AfterViewInit {
  private fb = inject(FormBuilder);
  private gameService = inject(GameService);
  private developerService = inject(DeveloperService);
  private publisherService = inject(PublisherService);
  private genreService = inject(GenreService);
  private platformService = inject(PlatformService);
  private cdRef = inject(ChangeDetectorRef);

  @ViewChild('genreContainer') genreContainer!: ElementRef;

  constructor(
    @Inject(MEDIA_REPOSITORY_TOKEN) private mediaRepository: IMediaRepository,
  ) {}

  @Input() id: number | null = null;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    isOnSale: [false],
    salePrice: [0],
    isRefundable: [true],
    numberOfSales: [0],
    stockPc: [0],
    stockPs5: [0],
    stockXboxX: [0],
    stockSwitch: [0],
    stockPs4: [0],
    stockXboxOne: [0],
    videoUrl: [''],
    rating: [0],
    releaseDate: [''],
    developerId: [null, [Validators.required]],
    publisherId: [null, [Validators.required]],
    genreIds: [[], [Validators.required]],
    platformIds: [[], [Validators.required]],
    image: [null],
  });

  isEditMode = false;
  errorMessage: string | null = null;

  developers: Developer[] = [];
  publishers: Publisher[] = [];
  genres: Genre[] = [];
  platforms: Platform[] = [];
  currentImageUrl: string | null = null;

  showDevModal = false;
  newDevName = '';
  showPubModal = false;
  newPubName = '';
  showGenreModal = false;
  newGenreName = '';
  showPlatformModal = false;
  newPlatformName = '';

  showGenreTopShadow = false;
  showGenreBottomShadow = false;

  ngOnInit(): void {
    this.loadDependencies();
    if (this.id) {
      this.isEditMode = true;
      this.loadGame(this.id);
    } else {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      if (this.id) {
        this.isEditMode = true;
        this.loadGame(this.id);
      } else {
        this.isEditMode = false;
        this.resetForm();
      }
    }
  }

  ngAfterViewInit() {
    this.checkScrolls();
  }

  resetForm() {
    this.form.reset({
      isRefundable: true,
      numberOfSales: 0,
      stockPc: 0,
      stockPs5: 0,
      stockXboxX: 0,
      stockSwitch: 0,
      stockPs4: 0,
      stockXboxOne: 0,
      price: 0,
    });
    this.currentImageUrl = null;
  }

  loadGame(id: number) {
    this.gameService.getById(id.toString()).subscribe((game) => {
      if (game) {
        const formattedDate = game.releaseDate
          ? game.releaseDate.split('T')[0]
          : '';
        this.form.patchValue({
          ...game,
          releaseDate: formattedDate,
          developerId:
            game.developerId ||
            game.Developer?.id ||
            (game as any).developer?.id,
          publisherId:
            game.publisherId ||
            game.Publisher?.id ||
            (game as any).publisher?.id,
          genreIds: game.genres?.map((g) => g.id) || [],
          platformIds: game.platforms?.map((p) => p.id) || [],
        });
        if (game.media && game.media.length > 0) {
          this.currentImageUrl = game.media[0].url;
        } else {
          this.currentImageUrl = null;
        }
      }
    });
  }

  loadDependencies() {
    forkJoin({
      devs: this.developerService.getAll(),
      pubs: this.publisherService.getAll(),
      genres: this.genreService.getAll(),
      platforms: this.platformService.getAll(),
    }).subscribe((data) => {
      this.developers = data.devs;
      this.publishers = data.pubs;
      this.genres = data.genres;
      this.platforms = data.platforms;

      this.checkScrolls();
    });
  }

  quickCreateDeveloper() {
    if (!this.newDevName.trim()) return;
    const newDev: Developer = { id: 0, name: this.newDevName };
    this.developerService.add(newDev).subscribe((dev) => {
      this.developers = [...this.developers, dev];
      this.form.patchValue({ developerId: dev.id });
      this.showDevModal = false;
      this.newDevName = '';
    });
  }

  quickCreatePublisher() {
    if (!this.newPubName.trim()) return;
    const newPub: Publisher = { id: 0, name: this.newPubName };
    this.publisherService.add(newPub).subscribe((pub) => {
      this.publishers = [...this.publishers, pub];
      this.form.patchValue({ publisherId: pub.id });
      this.showPubModal = false;
      this.newPubName = '';
    });
  }

  quickCreateGenre() {
    if (!this.newGenreName.trim()) return;
    const newGenre: Genre = { id: 0, name: this.newGenreName };
    this.genreService.add(newGenre).subscribe((g) => {
      this.genres = [...this.genres, g];
      const currentIds = this.form.get('genreIds')?.value || [];
      this.form.patchValue({ genreIds: [...currentIds, g.id] });
      this.showGenreModal = false;
      this.newGenreName = '';
      this.checkScrolls();
    });
  }

  quickCreatePlatform() {
    if (!this.newPlatformName.trim()) return;
    const newPlatform: Platform = { id: 0, name: this.newPlatformName };
    this.platformService.add(newPlatform).subscribe((p) => {
      this.platforms = [...this.platforms, p];
      const currentIds = this.form.get('platformIds')?.value || [];
      this.form.patchValue({ platformIds: [...currentIds, p.id] });
      this.showPlatformModal = false;
      this.newPlatformName = '';
    });
  }

  onGenreChange(e: any, genreId: number) {
    const currentIds: number[] = this.form.get('genreIds')?.value || [];
    if (e.target.checked) {
      if (!currentIds.includes(genreId)) {
        this.form.patchValue({ genreIds: [...currentIds, genreId] });
      }
    } else {
      this.form.patchValue({
        genreIds: currentIds.filter((id) => id !== genreId),
      });
    }
  }

  onPlatformChange(e: any, platformId: number) {
    const currentIds: number[] = this.form.get('platformIds')?.value || [];
    if (e.target.checked) {
      if (!currentIds.includes(platformId)) {
        this.form.patchValue({ platformIds: [...currentIds, platformId] });
      }
    } else {
      this.form.patchValue({
        platformIds: currentIds.filter((id) => id !== platformId),
      });
    }
  }

  isGenreSelected(id: number): boolean {
    return (this.form.get('genreIds')?.value || []).includes(id);
  }

  isPlatformSelected(id: number): boolean {
    return (this.form.get('platformIds')?.value || []).includes(id);
  }

  onSubmit() {
    if (this.form.invalid) return;

    const file = this.form.get('image')?.value;

    let uploadRequest$: Observable<any> = of(null);
    if (file instanceof File) {
      uploadRequest$ = this.mediaRepository.upload(file);
    }

    uploadRequest$
      .pipe(
        switchMap((uploadedMedia: any) => {
          const formVal = this.form.value;
          const gameData: Game = {
            id: this.id ? this.id : 0,
            ...formVal,
            genres: formVal.genreIds.map((id: number) => ({ id })),
            platforms: formVal.platformIds.map((id: number) => ({ id })),
          };

          if (uploadedMedia) {
            gameData.media = [uploadedMedia];
          }

          return this.isEditMode
            ? this.gameService.update(this.id!.toString(), gameData)
            : this.gameService.add(gameData);
        }),
      )
      .subscribe({
        next: () => this.save.emit(),
        error: (err: any) => (this.errorMessage = 'Error saving game'),
      });
  }

  onCancel() {
    this.cancel.emit();
  }

  checkScrolls() {
    setTimeout(() => {
      this.onGenreScroll();
      this.cdRef.detectChanges();
    }, 50);
  }

  onGenreScroll() {
    if (!this.genreContainer) return;
    const element = this.genreContainer.nativeElement;

    this.showGenreTopShadow = element.scrollTop > 0;

    const atBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 1;
    this.showGenreBottomShadow =
      !atBottom && element.scrollHeight > element.clientHeight;
  }

  getGenreMaskStyle(): string {
    const top = this.showGenreTopShadow ? 'transparent' : 'black';
    const bottom = this.showGenreBottomShadow ? 'transparent' : 'black';
    const gradient = `linear-gradient(to bottom, ${top} 0%, black 40%, black 60%, ${bottom} 100%)`;
    return `${gradient}, linear-gradient(black, black)`;
  }
}
