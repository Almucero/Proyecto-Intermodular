import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-aichat',
  imports: [RouterModule, HeaderComponent, TranslatePipe],
  templateUrl: './aichat.component.html',
  styleUrl: './aichat.component.scss',
})
export class AIChatComponent {
  ngOnInit(): void {}
}
