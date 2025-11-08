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
    const highlighter = this.components.get(OBF.Highlighter);
    const hider = this.components.get(OBC.Hider);
    const fragments = this.components.get(OBC.FragmentsManager);

    // Camera controls toolbar section
    const cameraSection = this.createCameraSection();
    
    // Selection controls toolbar section
    const selectionSection = this.createSelectionSection(highlighter, hider, fragments);

    // Create toolbar for viewport
    const toolbar = BUI.Component.create(() => {
      return BUI.html`
        <bim-toolbar>
          ${cameraSection}
          ${selectionSection}
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
   * Creates camera control toolbar section
   */
  private createCameraSection(): BUI.PanelSection {
    const camera = this.world.camera;

    const onFitModel = () => {
      if (camera instanceof OBC.OrthoPerspectiveCamera && this.world.meshes.size > 0) {
        camera.fit(this.world.meshes, 0.8);
      }
    };

    const onLock = (e: Event) => {
      const button = e.target as BUI.Button;
      camera.enabled = !camera.enabled;
      button.active = !camera.enabled;
      button.label = camera.enabled ? "Disable" : "Enable";
      button.icon = camera.enabled
        ? "tabler:lock-filled"
        : "majesticons:unlock-open";
    };

    return BUI.Component.create<BUI.PanelSection>(() => {
      return BUI.html`
        <bim-toolbar-section label="Camera" icon="ph:camera-fill">
          <bim-button 
            label="Fit Model" 
            icon="material-symbols:fit-screen-rounded" 
            @click=${onFitModel}>
          </bim-button>
          <bim-button 
            label="Disable" 
            icon="tabler:lock-filled" 
            @click=${onLock} 
            .active=${!camera.enabled}>
          </bim-button>
        </bim-toolbar-section>
      `;
    });
  }

  /**
   * Creates selection control toolbar section
   */
  private createSelectionSection(
    highlighter: OBF.Highlighter,
    hider: OBC.Hider,
    fragments: OBC.FragmentsManager
  ): BUI.PanelSection {
    const onToggleVisibility = () => {
      const selection = highlighter.selection.select;
      if (Object.keys(selection).length === 0) return;
      
      for (const fragmentID in selection) {
        const fragment = fragments.list.get(fragmentID);
        if (!fragment) continue;
        const expressIDs = selection[fragmentID];
        for (const id of expressIDs) {
          const isHidden = fragment.hiddenItems.has(id);
          if (isHidden) {
            fragment.setVisibility(true, [id]);
          } else {
            fragment.setVisibility(false, [id]);
          }
        }
      }
    };

    const onIsolate = () => {
      const selection = highlighter.selection.select;
      if (Object.keys(selection).length === 0) return;
      
      for (const [, fragment] of fragments.list) {
        fragment.setVisibility(false);
      }
      hider.set(true, selection);
    };

    const onShowAll = () => {
      for (const [, fragment] of fragments.list) {
        fragment.setVisibility(true);
      }
    };

    const onFocusSelection = async () => {
      if (!this.world.camera.hasCameraControls()) return;

      const bbox = this.components.get(OBC.BoundingBoxer);
      bbox.reset();

      const selected = highlighter.selection.select;
      if (!Object.keys(selected).length) return;

      for (const fragID in selected) {
        const fragment = fragments.list.get(fragID);
        if (!fragment) continue;
        const ids = selected[fragID];
        bbox.addMesh(fragment.mesh, ids);
      }

      const sphere = bbox.getSphere();
      const { x, y, z } = sphere.center;
      const i = Infinity;
      const mi = -Infinity;
      const isInf = sphere.radius === i || x === i || y === i || z === i;
      const isMInf = sphere.radius === mi || x === mi || y === mi || z === mi;
      const isZero = sphere.radius === 0;
      
      if (isInf || isMInf || isZero) {
        return;
      }

      sphere.radius *= 1.2;
      await this.world.camera.controls.fitToSphere(sphere, true);
    };

    return BUI.Component.create<BUI.PanelSection>(() => {
      return BUI.html`
        <bim-toolbar-section label="Selection" icon="ph:cursor-fill">
          <bim-button 
            @click=${onShowAll} 
            label="Show All" 
            icon="tabler:eye-filled" 
            tooltip-title="Show All" 
            tooltip-text="Shows all elements in all models.">
          </bim-button>
          <bim-button 
            @click=${onToggleVisibility} 
            label="Toggle Visibility" 
            icon="tabler:square-toggle" 
            tooltip-title="Toggle Visibility" 
            tooltip-text="From the current selection, hides visible elements and shows hidden elements.">
          </bim-button>
          <bim-button 
            @click=${onIsolate} 
            label="Isolate" 
            icon="prime:filter-fill" 
            tooltip-title="Isolate" 
            tooltip-text="Isolates the current selection.">
          </bim-button>
          <bim-button 
            @click=${onFocusSelection} 
            label="Focus" 
            icon="ri:focus-mode" 
            tooltip-title="Focus" 
            tooltip-text="Focus the camera to the current selection.">
          </bim-button>
        </bim-toolbar-section>
      `;
    });
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
