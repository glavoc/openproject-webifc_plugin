import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Components } from '@thatopen/components';

@Component({
  selector: 'webifc-viewer',
  templateUrl: './webifc-viewer.component.html',
  styleUrls: ['./webifc-viewer.component.scss']
})
export class WebifcViewerComponent implements OnInit {
  @ViewChild('viewerContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  async ngOnInit() {
    const container = this.containerRef.nativeElement;

    const components = new Components();

    // @ts-ignore: not typed in v2
    container.appendChild(components.renderer.domElement);

    await components.init();

    // @ts-ignore: not typed in v2
    await components.ifc.loader.setup();

    // @ts-ignore: not typed in v2
    await components.ifc.loader.loadIfcUrl('/ifc/test.ifc');
  }
}
