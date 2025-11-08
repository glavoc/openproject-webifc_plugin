// webifc-viewer.service.ts
import { Injectable } from "@angular/core";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as WEBIFC from "web-ifc";
import { PathHelperService } from "core-app/core/path-helper/path-helper.service";
import { CurrentProjectService } from "core-app/core/current-project/current-project.service";
import { WebIfcServerService } from "../webifc-server/webifc-server.service";

@Injectable({ providedIn: "root" })
export class WebIfcViewerService {
  private components!: OBC.Components;
  private world!: OBC.World<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer>;
  private fragmentIfcLoader!: OBC.IfcLoader;
  private viewport!: BUI.Viewport;
  private appGrid!: BUI.Grid;

  constructor(
    private pathHelper: PathHelperService,
    private currentProjectService: CurrentProjectService,
    private webIfcServer: WebIfcServerService
  ) {}

  /**
   * Initializes the WebIFC viewer with UI components and loads IFC models.
   */
  async initViewer(container: HTMLElement): Promise<void> {
    // Initialize BUI Manager
    BUI.Manager.init();

    // Initialize components
    this.components = new OBC.Components();
    const worlds = this.components.get(OBC.Worlds);

    // Create world with advanced renderer
    this.world = worlds.create<
      OBC.SimpleScene,
      OBC.OrthoPerspectiveCamera,
      OBF.PostproductionRenderer
    >();
    this.world.name = "Main";

    // Setup scene
    this.world.scene = new OBC.SimpleScene(this.components);
    this.world.scene.setup();
    this.world.scene.three.background = null;

    // Create viewport
    this.viewport = BUI.Component.create<BUI.Viewport>(() => {
      return BUI.html`
        <bim-viewport>
          <bim-grid floating></bim-grid>
        </bim-viewport>
      `;
    });

    // Setup renderer with postproduction
    this.world.renderer = new OBF.PostproductionRenderer(this.components, this.viewport);
    const { postproduction } = this.world.renderer;

    // Setup camera
    this.world.camera = new OBC.OrthoPerspectiveCamera(this.components);

    // Create and configure grid
    const worldGrid = this.components.get(OBC.Grids).create(this.world);
    worldGrid.material.uniforms.uColor.value = new THREE.Color(0x424242);
    worldGrid.material.uniforms.uSize1.value = 2;
    worldGrid.material.uniforms.uSize2.value = 8;

    // Handle viewport resize
    const resizeWorld = () => {
      this.world.renderer?.resize();
      this.world.camera.updateAspect();
    };
    this.viewport.addEventListener("resize", resizeWorld);

    // Initialize components
    await this.components.init();

    // Configure postproduction effects
    postproduction.enabled = true;
    postproduction.customEffects.excludedMeshes.push(worldGrid.three);
    postproduction.setPasses({ custom: true, ao: true, gamma: true });
    postproduction.customEffects.lineColor = 0x17191c;

    // Setup fragments and indexer
    const fragments = this.components.get(OBC.FragmentsManager);
    const indexer = this.components.get(OBC.IfcRelationsIndexer);
    const classifier = this.components.get(OBC.Classifier);
    classifier.list.CustomSelections = {};

    // Setup IFC loader
    this.fragmentIfcLoader = this.components.get(OBC.IfcLoader);
    await this.fragmentIfcLoader.setup();

    this.fragmentIfcLoader.settings.autoSetWasm = false;
    this.fragmentIfcLoader.settings.wasm = {
      path: "/wasm/",
      absolute: true,
    };

    const excludedCats = [
      WEBIFC.IFCTENDONANCHOR,
      WEBIFC.IFCREINFORCINGBAR,
      WEBIFC.IFCREINFORCINGELEMENT
    ];
    for (const cat of excludedCats) {
      this.fragmentIfcLoader.settings.excludedCategories.add(cat);
    }
    this.fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

    // Setup highlighter
    const highlighter = this.components.get(OBF.Highlighter);
    highlighter.setup({ world: this.world });
    highlighter.zoomToSelection = true;

    // Camera controls
    this.world.camera.controls.restThreshold = 0.25;

    // Handle fragment loading
    fragments.onFragmentsLoaded.add(async (model) => {
      if (model.hasProperties) {
        await indexer.process(model);
        classifier.byEntity(model);
      }

      for (const fragment of model.items) {
        this.world.meshes.add(fragment.mesh);
      }

      this.world.scene.three.add(model);
      setTimeout(async () => {
        this.world.camera.fit(this.world.meshes, 0.8);
      }, 50);
    });

    // Create UI layout
    this.createUI(container);

    // Load IFC models
    await this.loadProjectModels();
  }

  /**
   * Creates the UI layout with panels and toolbars
   */
  private createUI(container: HTMLElement): void {
    // Create toolbar for viewport
    const toolbar = BUI.Component.create(() => {
      return BUI.html`
        <bim-toolbar>
          <bim-toolbar-section label="Camera">
            <bim-button 
              label="Fit" 
              icon="material-symbols:fit-screen"
              @click=${() => this.world.camera.fit(this.world.meshes, 0.8)}>
            </bim-button>
          </bim-toolbar-section>
        </bim-toolbar>
      `;
    });

    // Get viewport grid
    const viewportGrid = this.viewport.querySelector<BUI.Grid>("bim-grid[floating]")!;
    
    // Setup viewport grid layout
    viewportGrid.layouts = {
      main: {
        template: `
          "empty" 1fr
          "toolbar" auto
          /1fr
        `,
        elements: { toolbar },
      },
    };
    viewportGrid.layout = "main";

    // Create main app grid
    this.appGrid = BUI.Component.create<BUI.Grid>(() => {
      return BUI.html`<bim-grid></bim-grid>`;
    });

    // Setup main layout
    this.appGrid.layouts = {
      main: {
        template: `
          "viewport" 1fr
          /1fr
        `,
        elements: {
          viewport: this.viewport,
        },
      },
    };

    this.appGrid.layout = "main";

    // Append to container
    container.appendChild(this.appGrid);
  }

  /**
   * Loads all IFC models for the current project
   */
  private async loadProjectModels(): Promise<void> {
    const projectId = this.currentProjectService.identifier ?? "";
    const attachmentIdsObj = this.webIfcServer.ifcModels.ifc_attachment_ids || {};

    // Get values and convert to numbers
    const attachmentIds = Object.values(attachmentIdsObj)
      .filter(id => id != null)
      .map(id => Number(id));

    for (const id of attachmentIds) {
      const fileUrl = this.webIfcServer.getIfcFileUrl(projectId, id);
      if (fileUrl) {
        await this.loadModel(fileUrl, `Model-${id}`);
      }
    }
  }

  /**
   * Loads an IFC model from a URL
   */
  async loadModel(fileUrl: string, modelName?: string): Promise<void> {
    try {
      const fullUrl = 'http://localhost:3000' + fileUrl;
      const response = await fetch(fullUrl, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`Failed to fetch IFC file from ${fileUrl}`);
      }

      const buffer = new Uint8Array(await response.arrayBuffer());
      const model = await this.fragmentIfcLoader.load(buffer);
      model.name = modelName || `Model-${Date.now()}`;

      console.log(`IFC model loaded: ${model.name}`);
    } catch (error) {
      console.error(`Error loading IFC model:`, error);
    }
  }

  /**
   * Cleanup resources when the viewer is destroyed
   */
  dispose(): void {
    if (this.components) {
      this.components.dispose();
    }
  }
}
