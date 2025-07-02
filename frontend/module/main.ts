import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebIfcViewerModule } from './webifc-viewer/webifc-viewer.module';

@NgModule({
  imports: [
    CommonModule,
    WebIfcViewerModule
  ]
})
export class OpenprojectWebifcPluginModule {}

export default {
  selector: 'op-web-ifc-viewer',
  module: OpenprojectWebifcPluginModule
};
