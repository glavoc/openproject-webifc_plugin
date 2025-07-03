import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { registerCustomElement } from 'core-app/shared/helpers/angular/custom-elements.helper';
import { WebIfcViewerComponent } from './webifc-viewer/webifc-viewer.component';

export function initializeWebIfcPlugin(injector: Injector) {
  return () => {
    // Optional: initialize plugin-specific hooks here if needed
    // e.g. register services, global listeners, etc.
  };
}

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeWebIfcPlugin,
      deps: [Injector],
      multi: true,
    },
  ],
  declarations: [
    WebIfcViewerComponent,
  ],
})
export class PluginModule {
  constructor(injector: Injector) {
    registerCustomElement('op-web-ifc-viewer', WebIfcViewerComponent, { injector });
  }
}
