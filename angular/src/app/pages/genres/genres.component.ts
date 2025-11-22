import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-genres',
  imports: [RouterModule, HeaderComponent],
  templateUrl: './genres.component.html',
  styleUrl: './genres.component.scss',
})
export class GenresComponent {
  genresName = '';

  constructor(private route: ActivatedRoute) {
    this.genresName = this.route.snapshot.paramMap.get('nombre')!;
  }
}
