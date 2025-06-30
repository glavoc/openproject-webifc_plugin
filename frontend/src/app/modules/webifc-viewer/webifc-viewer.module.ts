import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebifcViewerComponent } from './webifc-viewer.component';

@NgModule({
  declarations: [WebifcViewerComponent],
  imports: [CommonModule],
  exports: [WebifcViewerComponent]
})
export class WebifcViewerModule {}
