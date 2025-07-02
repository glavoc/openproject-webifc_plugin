import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as OBC from '@thatopen/components';

@Component({
  selector: 'app-webifc-viewer',
  template: `<div #container style="width: 100%; height: 600px;"></div>`,
  styles: [':host { display: block; }']
})
export class WebIfcViewerComponent implements OnInit {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;
  private components!: OBC.Components;

  ngOnInit() {
    this.components = new OBC.Components();

    const worlds = this.components.get(OBC.Worlds);

    // Create world with generics specifying scene, camera, renderer types
    const world = worlds.create<
      OBC.SimpleScene,
      OBC.SimpleCamera,
      OBC.SimpleRenderer
    >();

    // Assign scene, renderer, camera instances
    world.scene = new OBC.SimpleScene(this.components);
    world.renderer = new OBC.SimpleRenderer(this.components, this.container.nativeElement);
    world.camera = new OBC.SimpleCamera(this.components);

    // Initialize components
    this.components.init();

    // Set camera view
    world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

    // Setup scene
    world.scene.setup();

    // Add grids
    const grids = this.components.get(OBC.Grids);
    grids.create(world);

    // Later: load IFC models via world.scene or other means
  }
}
