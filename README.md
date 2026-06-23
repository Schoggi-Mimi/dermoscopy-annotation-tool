# Dermoscopy Annotation Tool

A simplified local annotation tool for dermoscopy images. This fork is based on the open-source [make-sense](https://github.com/SkalskiP/make-sense) project and was adapted for a master's thesis workflow.

The tool is intended for region-based annotation of melanoma images by a clinical expert. It runs locally in the browser and does not upload images to a server.

## Main features

- Local browser-based image annotation
- Polygon annotation selected automatically after image loading
- Predefined dermoscopy annotation labels
- Editable label names and colors
- Export of one binary mask per polygon annotation
- Export of a CSV summary linking image IDs, annotation IDs, labels, and mask filenames

## Default labels

The tool starts with the following labels:

- `diagnostic_region`
- `suspicious_pigment`
- `irregular_border`
- `asymmetry_region`
- `structure_pattern_region`
- `artifact_ignore`

These labels can be edited in the app under **Actions → Edit Labels**.

## Export format

The export creates a ZIP file containing:

- `annotation_summary.csv`
- one binary PNG mask per polygon annotation

Each mask has the original image size:

- background = black, value `0`
- annotated region = white, value `255`

Example CSV structure:

```csv
Image_ID,Annotation_ID,Label_Name,Mask_Filename
ISIC_0024306,annotation_001,diagnostic_region,ISIC_0024306_annotation_001.png
ISIC_0024306,annotation_002,irregular_border,ISIC_0024306_annotation_002.png
```

## Local setup

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm start
```

Open the app at:

```text
http://localhost:3000
```

Build the app:

```bash
npm run build
```

## Basic workflow

1. Start the app locally.
2. Upload dermoscopy images.
3. Click **Start Region Annotation**.
4. Draw polygon annotations on the lesion/image regions.
5. Select or edit labels if needed.
6. Export annotations as binary masks and CSV summary.

## Privacy

Images are processed locally in the browser. They are not uploaded to a server by this tool.

## Acknowledgement

This project is a thesis-specific adaptation of [make-sense](https://github.com/SkalskiP/make-sense), originally created by Piotr Skalski.

## License

This project follows the license of the original make-sense project. See the `LICENSE` file for details.
