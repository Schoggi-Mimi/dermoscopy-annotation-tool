# Dermoscopy Annotation Tool

A simplified web based annotation tool for dermoscopy images. This fork is based on the open source [make-sense](https://github.com/SkalskiP/make-sense) project and was adapted for a master's thesis workflow.

The tool is intended for region based annotation of dermoscopy images by a clinical expert. It runs entirely in the browser. Images are not uploaded to an external server.

## Live Application

The production version of the tool is publicly hosted here:

[https://Schoggi-Mimi.github.io/dermoscopy-annotation-tool](https://Schoggi-Mimi.github.io/dermoscopy-annotation-tool)

## Main features

- Browser based dermoscopy image annotation
- Local image handling in the browser
- No server upload of imported images
- Freehand brush annotation workflow
- Adjustable brush size
- Optional polygon annotation mode
- Predefined dermoscopy labels
- Editable label names and colors
- Binary PNG mask export
- CSV summary export

## Annotation workflow

The main annotation mode is the **Brush** tool.

The clinician can:

1. Import dermoscopy images
2. Select a clinical label
3. Adjust brush size
4. Paint annotation regions directly on the image
5. Export binary masks and a CSV summary

The brush tool is intended for fast region annotation of irregular dermoscopic structures.

The polygon tool is still available as a secondary annotation mode.

## Default labels

The tool initializes with the following labels:

- `diagnostic_region`
- `suspicious_pigment`
- `irregular_border`
- `asymmetry_region`
- `structure_pattern_region`
- `artifact_ignore`

Labels can be edited inside the application:

```text
Actions -> Edit Labels
```

## Brush export format

The brush export generates a ZIP file:

```text
brush_annotation_masks.zip
```

The ZIP contains:

```text
brush_annotation_summary.csv
one binary PNG mask per image and label
```

Each brush mask keeps the exact dimensions of the original image.

Pixel values:

```text
background = 0
annotation = 255
```

Each exported mask is binary.

Expected mask values:

```text
[0, 255]
```

## CSV structure

Example:

```csv
Image_ID,Annotation_ID,Label_ID,Label_Name,Mask_Filename,Stroke_Count
ISIC_0024306,brush_annotation_001,diagnostic_region,diagnostic_region,ISIC_0024306_diagnostic_region_brush_001.png,1
ISIC_0024306,brush_annotation_002,suspicious_pigment,suspicious_pigment,ISIC_0024306_suspicious_pigment_brush_002.png,3
```

Column meaning:

- `Image_ID`: image identifier without file extension
- `Annotation_ID`: generated annotation identifier
- `Label_ID`: internal label id
- `Label_Name`: label shown in the user interface
- `Mask_Filename`: exported binary PNG mask
- `Stroke_Count`: number of brush strokes merged into this label mask

## Mask grouping

Brush annotations are exported as:

```text
one mask per image and label
```

If a clinician paints multiple strokes with the same label on the same image, those strokes are merged into a single binary mask.

Example:

```text
Image: ISIC_0024306
Label: suspicious_pigment
Stroke_Count: 3
Mask: ISIC_0024306_suspicious_pigment_brush_002.png
```

## Polygon export format

The polygon export remains available as a secondary workflow.

The polygon export generates a ZIP file containing:

```text
annotation_summary.csv
one binary PNG mask per polygon annotation
```

Each polygon mask keeps the exact dimensions of the original image.

Pixel values:

```text
background = 0
annotation = 255
```

## Local development

Install dependencies:

```bash
npm ci
```

Start development server:

```bash
npm run dev
```

Build production files:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

## GitHub Pages deployment

The application is built with Vite.

For GitHub Pages under:

```text
https://Schoggi-Mimi.github.io/dermoscopy-annotation-tool
```

the Vite base path should be:

```typescript
base: '/dermoscopy-annotation-tool/'
```

Clean build:

```bash
rm -rf dist
npm run build
```

Preview the build:

```bash
npm run preview
```

## Privacy note

The tool runs in the browser. Imported images are processed locally during annotation. No image upload is performed by the annotation workflow.

## Thesis context

This tool was adapted for a master's thesis workflow focused on dermoscopy annotation and evaluation of clinically meaningful regions in skin lesion images.