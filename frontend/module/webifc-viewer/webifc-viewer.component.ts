import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Manager } from '@thatopen/ui';
import * as WEBIFC from 'web-ifc';
import * as BUI from '@thatopen/ui';
import Stats from 'stats.js';
import * as OBC from '@thatopen/components';

@Component({
  selector: 'app-webifc-viewer',
  template: `<div #container style="width: 100%; height: 100vh;"></div>`,
  styles: []
})
export class WebIfcViewerComponent implements OnInit {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;

  private components!: OBC.Components;
  private world!: OBC.SimpleWorld;
  private fragmentIfcLoader!: OBC.IfcLoader;
  private fragments!: OBC.FragmentsManager;

  async ngOnInit() {
    // Initialize components and scene
    Manager.init(); // Required!
    this.components = new OBC.Components();

    const worlds = this.components.get(OBC.Worlds);
    this.world = worlds.create<OBC.SimpleScene, OBC.SimpleCamera, OBC.SimpleRenderer>();

    this.world.scene = new OBC.SimpleScene(this.components);
    this.world.renderer = new OBC.SimpleRenderer(this.components, this.container.nativeElement);
    this.world.camera = new OBC.SimpleCamera(this.components);

    // Setup IFC loader and fragments
    this.fragments = this.components.get(OBC.FragmentsManager);

    this.fragmentIfcLoader = this.components.get(OBC.IfcLoader);

    this.fragmentIfcLoader.settings.autoSetWasm = false;

    console.log(this.components);
    console.log(this.components.get(OBC.IfcLoader)); // should log an instance, not undefined

    this.fragmentIfcLoader.settings.wasm = {
       path: "/wasm/",
       absolute: true,
     };

    this.components.init();

    this.world.camera.controls!.setLookAt(12, 6, 8, 0, 0, -10);
    (this.world.scene as OBC.SimpleScene).setup();

    const grids = this.components.get(OBC.Grids);
    grids.create(this.world);

    (this.world.scene as OBC.SimpleScene).three.background = null;

    await this.fragmentIfcLoader.setup(); 


    // Exclude some IFC categories (optional)
    const excludedCats = [
      WEBIFC.IFCTENDONANCHOR,
      WEBIFC.IFCREINFORCINGBAR,
      WEBIFC.IFCREINFORCINGELEMENT,
    ];
    for (const cat of excludedCats) {
      this.fragmentIfcLoader.settings.excludedCategories.add(cat);
    }
    this.fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

    // Load your IFC model
    // await this.loadIfc();

    // Optionally add performance stats
    const stats = new Stats();
    stats.showPanel(2);
    document.body.appendChild(stats.dom);
    stats.dom.style.left = '0px';
    stats.dom.style.zIndex = 'unset';

    this.world.renderer.onBeforeUpdate.add(() => stats.begin());
    this.world.renderer.onAfterUpdate.add(() => stats.end());

    // Initialize UI library
    BUI.Manager.init();

  }

  private async loadIfc() {
    try {
      const fileUrl = "/ifc/STRUC.ifc"; // Update if needed
      const response = await fetch(fileUrl);
      const data = await response.arrayBuffer();
      const buffer = new Uint8Array(data);
      const model = await this.fragmentIfcLoader.load(buffer);
      model.name = 'STRUC';
      this.world.scene.three.add(model);
      console.log('IFC model loaded:', model);
    } catch (error) {
      console.error('Failed to load IFC model:', error);
    }
  }
}
