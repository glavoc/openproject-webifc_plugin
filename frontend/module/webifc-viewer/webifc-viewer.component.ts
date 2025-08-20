import { AfterViewInit, OnDestroy, OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import { WebIfcViewerService } from './webifc-viewer.service';
import { IfcModelsDataService } from 'core-app/features/bim/ifc_models/pages/viewer/ifc-models-data.service';


@Component({
  selector: 'op-web-ifc-viewer',
  templateUrl: './webifc-viewer.component.html',
})
export class WebIfcViewerComponent implements OnInit {

  @ViewChild('viewerContainer', { static: true })
  viewerContainer!: ElementRef<HTMLDivElement>;

  constructor (
        // public ifcData:IfcModelsDataService,
        private webIfcViewerService:WebIfcViewerService,
  ){
  }


  ngOnInit():void {
    this.viewerContainer.nativeElement.style.width = '100%';
    this.viewerContainer.nativeElement.style.height = '100%';
    this.webIfcViewerService.initViewer(this.viewerContainer.nativeElement);
    // this.webIfcViewerService.initViewer(
    //   this.modelCanvas.nativeElement as HTMLDivElement,
    //   this.ifcData.projects
    // );
  }


}
