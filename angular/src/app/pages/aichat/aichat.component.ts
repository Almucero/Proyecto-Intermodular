import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-aichat',
  imports: [RouterModule,HeaderComponent,CommonModule],
  templateUrl: './aichat.component.html',
  styleUrl: './aichat.component.scss'
})
export class AIChatComponent {
  
}
