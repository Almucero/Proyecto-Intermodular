import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-genres',
  imports: [],
  templateUrl: './genres.component.html',
  styleUrl: './genres.component.scss'
})
export class GenresComponent {
genresName = '';

  constructor(private route: ActivatedRoute) {
    this.genresName = this.route.snapshot.paramMap.get('nombre')!;
  }
}
