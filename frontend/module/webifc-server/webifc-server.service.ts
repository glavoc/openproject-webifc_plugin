// webifc-server.service.ts
import { Injectable } from '@angular/core';
import { PathHelperService } from 'core-app/core/path-helper/path-helper.service';

@Injectable({ providedIn: 'root' })
export class WebIfcServerService {
  public ifcModels: any;

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

  }

  /**
   * Gets a list of projects from gon.
   */
  getProjects(done: Function, _error: Function) {
  }

  /**
   * Gets a project and its models.
   */
  getProject(projectId: string, done: (json: unknown) => void, _error: () => void) {
  }

  /**
   * (Optional) Get raw URL to load a model file directly.
   */
  getIfcFileUrl(projectId:string, modelId:number){
    const attachmentId = this.ifcModels.ifc_attachment_ids[modelId];
    if (!attachmentId) {
      console.error(`Unknown attachment ID for model ${modelId}`);
      return;
    }

    return this.pathHelper.attachmentContentPath(attachmentId);
  }


  // No `getGeometry()` needed – WebIFC loads .ifc directly
}