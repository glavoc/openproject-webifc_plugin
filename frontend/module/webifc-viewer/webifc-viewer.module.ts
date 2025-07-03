import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebIfcViewerComponent } from './webifc-viewer.component';
import { Components } from '@thatopen/components';

@NgModule({
  declarations: [WebIfcViewerComponent],
  imports: [
    CommonModule,
    Components 
  ],
  exports: [WebIfcViewerComponent]
})
export class WebIfcViewerModule {}
