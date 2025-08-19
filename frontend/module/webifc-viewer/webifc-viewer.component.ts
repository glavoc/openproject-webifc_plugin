import { AfterViewInit, OnDestroy, OnInit, ViewChild, Component, ElementRef } from '@angular/core';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { WebIfcViewerService } from './webifc-viewer.service';
import { I18nService } from 'core-app/core/i18n/i18n.service';
import { CurrentUserService } from 'core-app/core/current-user/current-user.service';
import { CurrentProjectService } from 'core-app/core/current-project/current-project.service';
import { IfcModelsDataService } from 'core-app/features/bim/ifc_models/pages/viewer/ifc-models-data.service';


@Component({
  selector: 'op-web-ifc-viewer',
  templateUrl: './webifc-viewer.component.html',
})
export class WebIfcViewerComponent implements OnInit, OnDestroy, AfterViewInit {
  private viewInitialized$ = new Subject<void>();

  modelCount:number = this.ifcData.models.length;

  canManage = this.ifcData.allowed('manage_ifc_models');

  @ViewChild('modelCanvas') modelCanvas:ElementRef;
  

  constructor (
        public ifcData:IfcModelsDataService,
        private I18n:I18nService,
        private webIfcViewerService:WebIfcViewerService,
        private currentUserService:CurrentUserService,
        private currentProjectService:CurrentProjectService,
  ){}


  ngOnInit():void {
    if (this.modelCount === 0) {
      return;
    }
      
    combineLatest([
      this
        .currentUserService
        .hasCapabilities$(
          [
            'ifc_models/create',
            'ifc_models/update',
            'ifc_models/destroy',
          ],
          this.currentProjectService.id as string,
        ),
      this.viewInitialized$,
    ])
      .pipe(take(1))
      .subscribe(([manageIfcModelsAllowed]) => {
        this.webIfcViewerService.initViewer(
          this.modelCanvas.nativeElement as HTMLDivElement,
          this.ifcData.projects
        );
      });
    }
  
  ngAfterViewInit():void {
    this.viewInitialized$.next();
  }

  ngOnDestroy():void {
   // this.webIfcViewerService.destroy();
  }

}
