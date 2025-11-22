import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-help',
  imports: [RouterModule,HeaderComponent],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent {

}
