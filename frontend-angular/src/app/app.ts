import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzIconService } from 'ng-zorro-antd/icon';
import { NAV_ICONS } from './core/icons-provider';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor() {
    inject(NzIconService).addIcon(...NAV_ICONS);
  }
}
