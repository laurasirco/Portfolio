# 3D Models for Playground

This directory contains 3D models for playground entries.

## Supported Formats

- **GLTF** (.gltf, .glb) - Recommended for complex models with textures
- **OBJ** (.obj) - Good for simple geometry
- **FBX** (.fbx) - For models with animations

## How to Use

1. Add your 3D model file to this directory
2. Create a playground entry with:
   ```yaml
   media_type: three_d
   media: /assets/models/your-model.obj
   ```

## Example Entry

```yaml
---
layout: playground
title: My 3D Model
discipline: technology
media_type: three_d
media: /assets/models/cube.obj
caption: "Interactive 3D model"
size: 2x2
expand_size: 3x3
---

Description of your 3D model...
```

## Features

- **Mouse Interaction**: Hover over the model to rotate it with your mouse
- **Touch Support**: Works on mobile devices with touch gestures
- **Auto-rotation**: Model auto-rotates when not being interacted with
- **Responsive**: Adapts to different screen sizes
- **Fallback**: If model fails to load, displays a blue cube

## Model Optimization Tips

- Keep file sizes small (< 5MB)
- Use GLTF/GLB for best performance
- Optimize geometry for web (reduce polygon count)
- Use textures efficiently
