import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'webifc-viewer',
  templateUrl: './webifc-viewer.component.html',
  styleUrls: ['./webifc-viewer.component.scss']
})
export class WebifcViewerComponent implements OnInit {

  @ViewChild('viewerContainer', { static: true }) viewerContainer!: ElementRef<HTMLDivElement>;

  constructor() {}

  ngOnInit(): void {
    // For now, just add a placeholder or basic viewer init here.
    this.viewerContainer.nativeElement.innerHTML = '<p>ThatOpen IFC Viewer will load here.</p>';

    // TODO: Integrate engine_web-ifc viewer here.
  }
}
