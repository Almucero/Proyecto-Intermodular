import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-conditions',
  imports: [RouterModule,HeaderComponent],
  templateUrl: './conditions.component.html',
  styleUrl: './conditions.component.scss'
})
export class ConditionsComponent {

}
