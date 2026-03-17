# 3D Playground Entries - Quick Setup Guide

## Overview

The playground now supports interactive 3D model entries. Each entry can display a 3D model (.obj, .fbx, .gltf) that responds to mouse/touch interaction.

## How It Works

1. **Entry Definition**: You define a playground entry with `media_type: three_d`
2. **Model Loading**: The system detects the file format and loads the appropriate Three.js loader
3. **Rendering**: The model is rendered in the entry with interactive controls
4. **Interaction**: Users can hover/touch to rotate the model with their mouse/finger

## Creating a 3D Entry

### Step 1: Add Your Model File

Place your 3D model in `assets/models/`:
- `assets/models/my-model.obj`
- `assets/models/my-model.gltf`
- `assets/models/my-model.fbx`

### Step 2: Create the Entry

Create a new file in `_playground/` (e.g., `_playground/my-3d-project.md`):

```yaml
---
layout: playground
title: My 3D Project
discipline: technology
media_type: three_d
media: /assets/models/my-model.obj
caption: "Interactive 3D model - hover to rotate"
size: 2x2
expand_size: 3x3
---

Description of your 3D project goes here.
You can use markdown formatting.
```

### Step 3: Done!

The entry will automatically:
- Load your 3D model
- Render it with proper lighting
- Enable mouse/touch interaction
- Auto-rotate when not interacting

## Supported Formats

| Format | Extension | Best For |
|--------|-----------|----------|
| GLTF | .gltf, .glb | Complex models with textures (recommended) |
| OBJ | .obj | Simple geometry, easy to create |
| FBX | .fbx | Models with animations |

## Frontmatter Options

```yaml
---
layout: playground          # Always "playground"
title: String              # Entry title
discipline: String         # Category (e.g., "technology", "character-design")
media_type: three_d        # Must be "three_d" for 3D entries
media: String              # Path to 3D model file
caption: String            # Description shown below model
size: String               # Collapsed size (e.g., "1x1", "2x1", default: "1x1")
expand_size: String        # Expanded size (e.g., "2x2", "3x3", default: "2x2")
---
```

## Interaction

### Mouse
- **Hover**: Move mouse over the model to rotate it
- **Leave**: Model smoothly returns to default rotation
- **Auto-rotate**: When not hovering, model auto-rotates slowly

### Touch
- **Touch & Move**: Touch and drag to rotate the model
- **Release**: Model smoothly returns to default rotation
- **Auto-rotate**: When not touching, model auto-rotates slowly

## Example Entry

See `_playground/3d-example.md` for a working example using `assets/models/cube.obj`.

## Troubleshooting

### Model doesn't load
- Check file path is correct
- Verify file format is supported
- Check browser console for errors
- Model will show blue cube fallback

### Model looks wrong
- Check model is centered at origin
- Verify model scale is reasonable
- Try different lighting by adjusting model materials

### Performance issues
- Reduce polygon count in model
- Use GLTF/GLB format (more optimized)
- Simplify textures and materials

## File Structure

```
assets/
├── models/
│   ├── README.md           # Model documentation
│   ├── cube.obj            # Example model
│   └── your-model.obj      # Your models here
└── js/
    └── playground-3d.js    # 3D rendering system

_playground/
├── 3d-example.md           # Example 3D entry
└── your-3d-entry.md        # Your entries here
```

## Technical Details

- **Three.js Version**: r128
- **Loaders**: Dynamically loaded from CDN
- **Rendering**: WebGL with shadow mapping
- **Performance**: 60fps target on modern devices
- **Responsive**: Works at any container size

## Tips

1. **Keep models small**: < 5MB for fast loading
2. **Use GLTF for complex models**: Better performance and quality
3. **Test on mobile**: Touch interaction works great on tablets
4. **Optimize geometry**: Reduce polygon count for better performance
5. **Use meaningful sizes**: `size: 2x2` for featured models, `1x1` for small ones

## Questions?

Check `assets/models/README.md` for more details on model optimization and best practices.
