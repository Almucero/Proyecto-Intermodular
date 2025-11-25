import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-genres',
  imports: [RouterModule, HeaderComponent, TranslatePipe],
  templateUrl: './genres.component.html',
  styleUrl: './genres.component.scss',
})
export class GenresComponent {
  genresName = '';

  constructor(private route: ActivatedRoute) {
    this.genresName = this.route.snapshot.paramMap.get('nombre')!;
  }
}
