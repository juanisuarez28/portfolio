import { Component } from '@angular/core';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {

  openUrl(event: MouseEvent, url: string): void {
    // Don't double-navigate if the user clicked an <a> link inside the card
    const target = event.target as HTMLElement;
    if (target.closest('a')) return;
    window.open(url, '_blank');
  }
}
