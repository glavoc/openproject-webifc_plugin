import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebIfcViewerComponent } from './webifc-viewer.component';

@NgModule({
  declarations: [WebIfcViewerComponent],
  imports: [CommonModule],
  exports: [WebIfcViewerComponent]
})
export class WebIfcViewerModule {}
