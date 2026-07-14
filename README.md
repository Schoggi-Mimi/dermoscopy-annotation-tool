# Dermoscopy Annotation Tool

A simplified web based annotation tool for dermoscopy images. This fork is based on the open source [make-sense](https://github.com/SkalskiP/make-sense) project and was adapted for a master's thesis workflow.

The tool is intended for region based annotation of dermoscopy images by a clinical expert. It runs entirely in the browser. Imported images are processed locally and are not uploaded to an external server.

## Live Application

The production version of the tool is publicly hosted here:

[https://Schoggi-Mimi.github.io/dermoscopy-annotation-tool](https://Schoggi-Mimi.github.io/dermoscopy-annotation-tool)

## Main features

- Browser based dermoscopy image annotation
- Local image handling in the browser
- No server upload of imported images
- Freehand brush annotation workflow
- Visible clinical label list for fast label selection
- Adjustable brush radius
- Annotation visibility toggle
- Annotation deletion
- Optional polygon annotation mode
- Predefined dermoscopy label set
- Editable label names and colors
- Binary PNG mask export
- CSV summary export

## Annotation workflow

The main annotation mode is the **Brush** tool.

The clinician can:

1. Import dermoscopy images
2. Select a clinical label from the visible label list
3. Adjust the brush radius
4. Paint annotation regions directly on the image
5. Hide or delete created annotations if needed
6. Export binary masks and a CSV summary

The brush tool is intended for fast region annotation of irregular dermoscopic structures.

The polygon tool is still available as a secondary annotation mode.

## Default labels

The tool initializes with the following clinical labels.

### General label

- `diagnostic_region`

### Melanoma associated dermoscopic structures

- `atypical_network`
- `atypical_dots`
- `structureless_area`
- `regression`
- `atypical_vascular_pattern`
- `atypical_streaks`

### Nevus associated dermoscopic structures

- `regular_network`
- `homogeneous`
- `globular_network`

### Other

- `artifact_to_ignore`

The user interface shows readable label names such as:

```text
Diagnostic region
Atypical network
Atypical dots
Structureless area
Regression
Atypical vascular pattern
Atypical streaks
Regular network
Homogeneous
Globular network
Artifact to ignore
```

The internal label IDs use snake case for stable downstream processing.

Labels can be edited inside the application:

```text
Actions -> Edit Labels
```

## Blinded annotation recommendation

For the clinical annotation workflow, the diagnostic class should not be shown in the tool.

Recommended setup:

```text
Do not show MEL or NV during annotation
Do not filter labels by ground truth class
Show all labels for every image
Use blinded image names such as case_001.jpg
Keep the private class mapping separately
```

This reduces diagnosis leakage and helps avoid annotation bias.

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
ISIC_0024306,brush_annotation_001,diagnostic_region,Diagnostic region,ISIC_0024306_diagnostic_region_brush_001.png,1
ISIC_0024306,brush_annotation_002,atypical_network,Atypical network,ISIC_0024306_atypical_network_brush_002.png,3
ISIC_0024306,brush_annotation_003,artifact_to_ignore,Artifact to ignore,ISIC_0024306_artifact_to_ignore_brush_003.png,1
```

Column meaning:

- `Image_ID`: image identifier without file extension
- `Annotation_ID`: generated annotation identifier
- `Label_ID`: internal label ID
- `Label_Name`: readable label name shown in the user interface
- `Mask_Filename`: exported binary PNG mask filename
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
Label: atypical_network
Stroke_Count: 3
Mask: ISIC_0024306_atypical_network_brush_002.png
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

Start the development server:

```bash
npm run dev
```

Build production files:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The preview links are temporary. They only work while the local preview server is running.

Do not send preview links to clinical users.

## GitHub Pages deployment

The application is deployed to GitHub Pages:

```text
https://Schoggi-Mimi.github.io/dermoscopy-annotation-tool
```

The project already includes a deployment script using `gh-pages`.

The relevant `package.json` scripts are:

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview --host --port 3000",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

For GitHub Pages, the Vite base path should be:

```typescript
base: '/dermoscopy-annotation-tool/'
```

This is configured in:

```text
vite.config.ts
```

### Local production test

Clean and build:

```bash
rm -rf dist
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Open:

```text
http://localhost:3000/dermoscopy-annotation-tool/
```

The preview link is temporary and only works while the local preview server is running.

### Deploy

Deploy the current production build to GitHub Pages:

```bash
npm run deploy
```

The `predeploy` script automatically runs `npm run build` before publishing.

After deployment, wait a few minutes and open:

```text
https://Schoggi-Mimi.github.io/dermoscopy-annotation-tool
```

If the old version still appears, hard refresh the browser:

```text
Cmd + Shift + R
```

or test in a private browser window.

## Recommended deployment checklist

Before sharing the link with the dermatologist:

1. Open the deployed link in a private browser window
2. Confirm the new clinical labels are visible
3. Confirm no diagnostic class such as MEL or NV is shown
4. Import one test image
5. Create one brush annotation
6. Delete one brush annotation
7. Export annotations
8. Confirm the exported CSV and masks look correct
9. Confirm the uploaded image filenames are blinded if needed

## Privacy note

The tool runs in the browser. Imported images are processed locally during annotation. No image upload is performed by the annotation workflow.

Users should still avoid importing identifiable patient information unless the dataset has been properly anonymized and approved for the thesis workflow.

## Thesis context

This tool was adapted for a master's thesis workflow focused on dermoscopy annotation and evaluation of clinically meaningful regions in skin lesion images.

The current annotation setup supports expert marking of dermoscopic structures relevant to melanoma and nevus interpretation, with exported binary masks for downstream analysis.