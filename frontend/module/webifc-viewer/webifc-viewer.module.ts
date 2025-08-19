import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebIfcViewerComponent } from './webifc-viewer.component';
import { Components } from '@thatopen/components';
import { IfcModelsDataService } from 'core-app/features/bim/ifc_models/pages/viewer/ifc-models-data.service';

@NgModule({
  declarations: [WebIfcViewerComponent],
  imports: [
    CommonModule,
    Components 
  ],
  exports: [WebIfcViewerComponent],
  providers: [IfcModelsDataService]
})
export class WebIfcViewerModule {}
