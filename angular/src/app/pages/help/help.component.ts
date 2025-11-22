import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-help',
  imports: [RouterModule, HeaderComponent],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss',
})
export class HelpComponent {
  ngOnInit(): void {}
}
