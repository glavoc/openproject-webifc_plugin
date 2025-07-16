// webifc-viewer.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { WebIfcViewerService } from './webifc-viewer.service';
import { WebIfcServerService } from '../webifc-server/webifc-server.service';
import { CurrentProjectService } from 'core-app/core/current-project/current-project.service';


@Component({
  selector: 'app-webifc-viewer',
  template: `<div #container style="width: 100%; height: 100vh;"></div>`,
  styles: []
})
export class WebIfcViewerComponent implements OnInit {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;

  constructor(
    private webIfcViewerService: WebIfcViewerService,
    private webIfcServerService: WebIfcServerService,
    private currentProjectService: CurrentProjectService
  ) {}

  async ngOnInit() {
    const currentProjectId = this.currentProjectService.identifier as string;

    // Step 1: Init viewer
    await this.webIfcViewerService.initViewer(this.container.nativeElement, currentProjectId);

    // Step 2: Init models from gon
    this.webIfcServerService.initFromGon();

    // Step 3: Get model list for this project
    let models: Array<{ id: number; title: string; url: string; visible?: boolean }> = [];

    await new Promise<void>((resolve, reject) => {
      this.webIfcServerService.getProject(
        currentProjectId,
        (project: any) => {
          models = project.models || [];
          resolve();
        },
        () => reject('Failed to load project')
      );
    });

    // Step 4: Load each visible model
    for (const model of models) {
      if (model.visible && model.url) {
        await this.webIfcViewerService.loadModel(model.url, model.title);
      }
    }
  }


}
