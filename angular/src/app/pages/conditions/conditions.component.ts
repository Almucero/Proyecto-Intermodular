import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-conditions',
  imports: [RouterModule, HeaderComponent,TranslatePipe],
  templateUrl: './conditions.component.html',
  styleUrl: './conditions.component.scss',
})
export class ConditionsComponent {
  ngOnInit(): void {}
}
