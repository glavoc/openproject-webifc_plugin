import { AfterViewInit, OnDestroy, OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import { WebIfcViewerService } from './webifc-viewer.service';


@Component({
  selector: 'op-web-ifc-viewer',
  templateUrl: './webifc-viewer.component.html',
  styleUrls: ['./webifc-viewer.component.css'],
})
export class WebIfcViewerComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('appContainer', { static: true })
  appContainer!: ElementRef<HTMLElement>;

  constructor (
    private webIfcViewerService: WebIfcViewerService,
  ) {}

  ngOnInit(): void {
    // Initialize the container styling
    this.appContainer.nativeElement.style.width = '100%';
    this.appContainer.nativeElement.style.height = '100%';
  }

  ngAfterViewInit(): void {
    // Initialize the viewer after the view is ready
    this.webIfcViewerService.initViewer(this.appContainer.nativeElement);
  }

  ngOnDestroy(): void {
    // Cleanup when component is destroyed
    this.webIfcViewerService.dispose();
  }
}
