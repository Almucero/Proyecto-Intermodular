import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-genres',
  imports: [RouterModule, HeaderComponent, TranslatePipe, CommonModule],
  templateUrl: './genres.component.html',
  styleUrl: './genres.component.scss',
})
export class GenresComponent {
  genresName = '';
  
  featuredImages = [
    { id: 1, url: 'https://picsum.photos/400/300?random=1', title: 'Game 1' },
    { id: 2, url: 'https://picsum.photos/400/300?random=2', title: 'Game 2' },
    { id: 3, url: 'https://picsum.photos/400/300?random=3', title: 'Game 3' },
    { id: 4, url: 'https://picsum.photos/400/300?random=4', title: 'Game 4' },
    { id: 5, url: 'https://picsum.photos/400/300?random=5', title: 'Game 5' },
    { id: 6, url: 'https://picsum.photos/400/300?random=6', title: 'Game 6' },
    { id: 7, url: 'https://picsum.photos/400/300?random=7', title: 'Game 7' },
    { id: 8, url: 'https://picsum.photos/400/300?random=8', title: 'Game 8' },
    { id: 9, url: 'https://picsum.photos/400/300?random=9', title: 'Game 9' },
    { id: 10, url: 'https://picsum.photos/400/300?random=10', title: 'Game 10' },
    { id: 11, url: 'https://picsum.photos/400/300?random=11', title: 'Game 11' },
    { id: 12, url: 'https://picsum.photos/400/300?random=12', title: 'Game 12' },
    { id: 13, url: 'https://picsum.photos/400/300?random=13', title: 'Game 13' },
    { id: 14, url: 'https://picsum.photos/400/300?random=14', title: 'Game 14' },
    { id: 15, url: 'https://picsum.photos/400/300?random=15', title: 'Game 15' },
    { id: 16, url: 'https://picsum.photos/400/300?random=16', title: 'Game 16' },
    { id: 17, url: 'https://picsum.photos/400/300?random=17', title: 'Game 17' },
    { id: 18, url: 'https://picsum.photos/400/300?random=18', title: 'Game 18' },
    { id: 19, url: 'https://picsum.photos/400/300?random=19', title: 'Game 19' },
    { id: 20, url: 'https://picsum.photos/400/300?random=20', title: 'Game 20' },
    { id: 21, url: 'https://picsum.photos/400/300?random=21', title: 'Game 21' },
    { id: 22, url: 'https://picsum.photos/400/300?random=22', title: 'Game 22' },
    { id: 23, url: 'https://picsum.photos/400/300?random=23', title: 'Game 23' },
    { id: 24, url: 'https://picsum.photos/400/300?random=24', title: 'Game 24' },
    { id: 25, url: 'https://picsum.photos/400/300?random=25', title: 'Game 25' },
  ];

  constructor(private route: ActivatedRoute, private router: Router) {
    this.genresName = this.route.snapshot.paramMap.get('nombre')!;
  }

  goToProduct(id: number) {
    this.router.navigate(['/product', id]);
  }
}
