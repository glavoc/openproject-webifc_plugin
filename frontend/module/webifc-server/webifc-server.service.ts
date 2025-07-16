// webifc-server.service.ts
import { Injectable } from '@angular/core';
import { PathHelperService } from 'core-app/core/path-helper/path-helper.service';
import { IFCGonDefinition } from '../../../../bim/ifc_models/pages/viewer/ifc-models-data.service';

@Injectable({ providedIn: 'root' })
export class WebIfcServerService {
  private ifcModels!: IFCGonDefinition;

  constructor(private pathHelper: PathHelperService) {
    const gon = (window as any).gon?.ifc_models;

    if (!gon || !Array.isArray(gon.models)) {
      throw new Error("gon.ifc_models.models is not available or not an array");
    }

    this.ifcModels = gon;
  }

  initFromGon(): void {
    const gon = (window as any).gon?.ifc_models;

    if (!gon || !Array.isArray(gon.models)) {
      throw new Error("gon.ifc_models.models is missing or invalid.");
    }

    this.ifcModels = gon;
  }

  /**
   * Gets a list of projects from gon.
   */
  getProjects(done: Function, _error: Function) {
    done({ projects: this.ifcModels.projects });
  }

  /**
   * Gets a project and its models.
   */
  getProject(projectId: string, done: (json: unknown) => void, _error: () => void) {
    const projectDefinition = this.ifcModels.projects.find((p: any) => p.id === projectId);
    if (!projectDefinition) {
      throw new Error(`Unknown project ID: '${projectId}'`);
    }

    const shownIds = this.ifcModels.shown_models;

    const manifestData = {
      id: projectDefinition.id,
      name: projectDefinition.name,
      models: this.ifcModels.models.map((model: any) => ({
        id: model.id,
        title: model.title,
        url: model.ifc_attachment_url,
        visible: shownIds.includes(model.id),
      })),
    };

    done(manifestData);
  }

  /**
   * (Optional) Get raw URL to load a model file directly.
   */
  getIfcFileUrl(model: { id: number; ifc_attachment_url: string }): string {
    return model.ifc_attachment_url;
  }

  // No `getGeometry()` needed – WebIFC loads .ifc directly
}