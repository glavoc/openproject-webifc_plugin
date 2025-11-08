import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";

export interface WebifcViewerInstance {
  components: OBC.Components;
  world: OBC.World;
  fragments: OBC.FragmentsManager;
  ifcLoader: OBC.IfcLoader;
}

export async function initWebifcViewer(container: HTMLElement): Promise<WebifcViewerInstance> {
  // Initialize components
  const components = new OBC.Components();
  const worlds = components.get(OBC.Worlds);

  const world = worlds.create<
    OBC.SimpleScene,
    OBC.OrthoPerspectiveCamera,
    OBF.PostproductionRenderer
  >();
  world.name = "Main";

  // Setup scene
  world.scene = new OBC.SimpleScene(components);
  world.scene.setup();
  world.scene.three.background = new THREE.Color(0xf5f5f5);

  // Setup renderer
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  world.renderer = new OBF.PostproductionRenderer(components, canvas);
  const { postproduction } = world.renderer;

  // Setup camera
  world.camera = new OBC.OrthoPerspectiveCamera(components);

  // Setup grid
  const worldGrid = components.get(OBC.Grids).create(world);
  worldGrid.material.uniforms.uColor.value = new THREE.Color(0x424242);
  worldGrid.material.uniforms.uSize1.value = 2;
  worldGrid.material.uniforms.uSize2.value = 8;

  // Handle resize
  const resizeWorld = () => {
    world.renderer?.resize();
    world.camera.updateAspect();
  };

  window.addEventListener('resize', resizeWorld);
  resizeWorld();

  // Initialize components
  await components.init();

  // Setup postproduction
  postproduction.enabled = true;
  postproduction.customEffects.excludedMeshes.push(worldGrid.three);
  postproduction.setPasses({ custom: true, ao: true, gamma: true });
  postproduction.customEffects.lineColor = 0x17191c;

  // Setup fragments manager
  const fragments = components.get(OBC.FragmentsManager);
  const indexer = components.get(OBC.IfcRelationsIndexer);
  const classifier = components.get(OBC.Classifier);

  // Setup IFC loader
  const ifcLoader = components.get(OBC.IfcLoader);
  await ifcLoader.setup();

  // Setup highlighter
  const highlighter = components.get(OBF.Highlighter);
  highlighter.setup({ world });
  highlighter.zoomToSelection = true;

  // Handle camera rest
  world.camera.controls.restThreshold = 0.25;

  // Handle fragments loaded
  fragments.onFragmentsLoaded.add(async (model) => {
    if (model.hasProperties) {
      await indexer.process(model);
      classifier.byEntity(model);
    }

    for (const fragment of model.items) {
      world.meshes.add(fragment.mesh);
    }

    world.scene.three.add(model);
    setTimeout(() => {
      world.camera.fit(world.meshes, 0.8);
    }, 50);
  });

  return {
    components,
    world,
    fragments,
    ifcLoader
  };
}

export async function loadIfcFile(viewer: WebifcViewerInstance, url: string): Promise<void> {
  try {
    // Fetch the IFC file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch IFC file: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    // Load the IFC file
    await viewer.ifcLoader.load(data);
    
    console.log('IFC file loaded successfully');
  } catch (error) {
    console.error('Error loading IFC file:', error);
    throw error;
  }
}

export async function loadIfcFileFromInput(viewer: WebifcViewerInstance, file: File): Promise<void> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    
    await viewer.ifcLoader.load(data);
    
    console.log('IFC file loaded successfully from input');
  } catch (error) {
    console.error('Error loading IFC file from input:', error);
    throw error;
  }
}
