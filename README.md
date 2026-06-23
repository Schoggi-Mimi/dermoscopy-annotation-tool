# Dermoscopy Annotation Tool

A simplified web-based annotation tool for dermoscopy images. This fork is based on the open-source [make-sense](https://github.com/SkalskiP/make-sense) project and was adapted for a master's thesis workflow.

The tool is intended for region-based annotation of melanoma images by a clinical expert. It runs entirely in the browser and does not upload images to an external server.

## Live Application

The production version of the tool is publicly hosted and can be accessed at:
👉 **[https://Schoggi-Mimi.github.io/dermoscopy-annotation-tool](https://Schoggi-Mimi.github.io/dermoscopy-annotation-tool)**

---

## Main features

- **Zero Installation Hosting:** Accessible via a permanent public link.
- **Local Browser-Based Processing:** Images never leave the clinician's machine.
- **Auto-Polygon Tool:** Polygon annotation is selected automatically after image loading.
- **Predefined Dermoscopy Labels:** Built-in labels mapped out for clinical workflows.
- **Customizable:** Editable label names and colors.
- **Mask Export:** Export of one binary mask per polygon annotation.
- **Data Export:** Export of a CSV summary linking image IDs, annotation IDs, labels, and mask filenames.

---

## Default labels

The tool initializes with the following diagnostic labels:

- `diagnostic_region`
- `suspicious_pigment`
- `irregular_border`
- `asymmetry_region`
- `structure_pattern_region`
- `artifact_ignore`

These labels can be edited directly inside the application under **Actions → Edit Labels**.

---

## Export format

The export routine generates a `.zip` file containing:˚

- `annotation_summary.csv`
- One binary `.png` mask per individual polygon annotation.

Each generated mask maintains the exact dimensions of the original image:
- **Background:** Black pixels (value `0`)
- **Annotated Region:** White pixels (value `255`)

### Example CSV structure:

```csv
Image_ID,Annotation_ID,Label_Name,Mask_Filename
ISIC_0024306,annotation_001,diagnostic_region,ISIC_0024306_annotation_001.png
ISIC_0024306,annotation_002,irregular_border,ISIC_0024306_annotation_002.png