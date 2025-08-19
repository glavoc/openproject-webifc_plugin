// webifc-viewer.service.ts
import { Injectable } from "@angular/core";
import * as OBC from "@thatopen/components";
import * as WEBIFC from "web-ifc";
import { Manager } from "@thatopen/ui";
import { PathHelperService } from "core-app/core/path-helper/path-helper.service";
import { CurrentProjectService } from "core-app/core/current-project/current-project.service";
import { IfcProjectDefinition } from 'core-app/features/bim/ifc_models/pages/viewer/ifc-models-data.service';
import { WebIfcServerService } from "../webifc-server/webifc-server.service";


@Injectable({ providedIn: "root" })
export class WebIfcViewerService {
  private components!: OBC.Components;
  private world!: OBC.SimpleWorld;
  private fragmentIfcLoader!: OBC.IfcLoader;

  constructor(
    private pathHelper: PathHelperService,
    private currentProjectService: CurrentProjectService,
  ) {}
  /**
   * Initializes the WebIFC viewer and loads the first model of the given project.
   */
  async initViewer(container: HTMLDivElement, projects:IfcProjectDefinition[]): Promise<void> {
   
    Manager.init();
    this.components = new OBC.Components();

    const worlds = this.components.get(OBC.Worlds);
    this.world = worlds.create<OBC.SimpleScene, OBC.SimpleCamera, OBC.SimpleRenderer>();
    this.world.scene = new OBC.SimpleScene(this.components);
    this.world.renderer = new OBC.SimpleRenderer(this.components, container);
    this.world.camera = new OBC.SimpleCamera(this.components);

    this.fragmentIfcLoader = this.components.get(OBC.IfcLoader);
    const fragments = this.components.get(OBC.FragmentsManager);

    this.fragmentIfcLoader.settings.autoSetWasm = false;

    // TODO: web assembly not supported in OP, implement a fallback
    this.fragmentIfcLoader.settings.wasm = {
      path: "/wasm/",
      absolute: true,
    };

    await this.components.init();

    this.world.camera.controls!.setLookAt(12, 6, 8, 0, 0, -10);
    (this.world.scene as OBC.SimpleScene).setup();

    const grids = this.components.get(OBC.Grids);
    grids.create(this.world);
    (this.world.scene as OBC.SimpleScene).three.background = null;

    await this.fragmentIfcLoader.setup();

    const excludedCats = [WEBIFC.IFCTENDONANCHOR, WEBIFC.IFCREINFORCINGBAR, WEBIFC.IFCREINFORCINGELEMENT];
    for (const cat of excludedCats) {
      this.fragmentIfcLoader.settings.excludedCategories.add(cat);
    }
    this.fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

  }

  async loadModel(fileUrl: string, modelName?: string): Promise<void> {
    try {
      const response = await fetch(fileUrl, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`Failed to fetch IFC file from ${fileUrl}`);
      }

      const buffer = new Uint8Array(await response.arrayBuffer());

      const model = await this.fragmentIfcLoader.load(buffer);
      model.name = modelName || `Model-${Date.now()}`;

      this.world.scene.three.add(model);
      console.log(`IFC model loaded: ${model.name}`);
    } catch (error) {
      console.error(`Error loading IFC model:`, error);
    }
  }
}
