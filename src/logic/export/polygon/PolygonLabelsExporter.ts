import {AnnotationFormatType} from '../../../data/enums/AnnotationFormatType';
import {ImageData, LabelName, LabelPolygon} from '../../../store/labels/types';
import {LabelsSelector} from '../../../store/selectors/LabelsSelector';
import {ImageRepository} from '../../imageRepository/ImageRepository';
import {ExporterUtil} from '../../../utils/ExporterUtil';
import {IPoint} from '../../../interfaces/IPoint';
import {VGGExporter} from './VGGExporter';
import {COCOExporter} from './COCOExporter';
import {findLast} from 'lodash';
import JSZip from 'jszip';

export class PolygonLabelsExporter {
    public static export(exportFormatType: AnnotationFormatType): void {
        switch (exportFormatType) {
            case AnnotationFormatType.VGG:
                VGGExporter.export();
                break;
            case AnnotationFormatType.COCO:
                COCOExporter.export();
                break;
            case AnnotationFormatType.PNG_MASK:
                PolygonLabelsExporter.exportPngMasks();
                break;
            case AnnotationFormatType.CSV_SUMMARY:
                PolygonLabelsExporter.exportCsvSummary();
                break;
            default:
                return;
        }
    }

    private static async exportPngMasks(): Promise<void> {
        const imagesData: ImageData[] = LabelsSelector.getImagesData();
        const labelNames: LabelName[] = LabelsSelector.getLabelNames();
        const zip: JSZip = new JSZip();
        const rows: string[] = ['Image_ID,Annotation_ID,Label_Name,Mask_Filename'];

        for (const imageData of imagesData.filter((imageData: ImageData) => imageData.loadStatus)) {
            const validPolygons: LabelPolygon[] = PolygonLabelsExporter.getValidPolygonLabels(imageData);
            const imageId: string = PolygonLabelsExporter.getCoreImageId(imageData);

            for (let index = 0; index < validPolygons.length; index++) {
                const labelPolygon: LabelPolygon = validPolygons[index];
                const labelName: LabelName = findLast(labelNames, {id: labelPolygon.labelId});

                if (!labelName) continue;

                const annotationId: string = PolygonLabelsExporter.getAnnotationId(index);
                const maskFilename: string = PolygonLabelsExporter.getMaskFilename(imageData, index);
                const maskBlob: Blob = await PolygonLabelsExporter.createSingleAnnotationMask(imageData, labelPolygon);

                zip.file(maskFilename, maskBlob);
                rows.push([
                    PolygonLabelsExporter.escapeCsvValue(imageId),
                    PolygonLabelsExporter.escapeCsvValue(annotationId),
                    PolygonLabelsExporter.escapeCsvValue(labelName.name),
                    PolygonLabelsExporter.escapeCsvValue(maskFilename)
                ].join(','));
            }
        }

        zip.file('annotation_summary.csv', rows.join('\n'));

        const zipBlob: Blob = await zip.generateAsync({type: 'blob'});
        ExporterUtil.saveBlob(zipBlob, 'polygon_annotation_masks.zip');
    }

    private static exportCsvSummary(): void {
        const imagesData: ImageData[] = LabelsSelector.getImagesData();
        const labelNames: LabelName[] = LabelsSelector.getLabelNames();
        const rows: string[] = ['Image_ID,Annotation_ID,Label_Name,Mask_Filename'];

        imagesData
            .filter((imageData: ImageData) => imageData.loadStatus)
            .filter((imageData: ImageData) => PolygonLabelsExporter.getValidPolygonLabels(imageData).length > 0)
            .forEach((imageData: ImageData) => {
                const imageId: string = PolygonLabelsExporter.getCoreImageId(imageData);

                PolygonLabelsExporter.getValidPolygonLabels(imageData).forEach((labelPolygon: LabelPolygon, index: number) => {
                    const labelName: LabelName = findLast(labelNames, {id: labelPolygon.labelId});

                    if (!labelName) return;

                    rows.push([
                        PolygonLabelsExporter.escapeCsvValue(imageId),
                        PolygonLabelsExporter.escapeCsvValue(PolygonLabelsExporter.getAnnotationId(index)),
                        PolygonLabelsExporter.escapeCsvValue(labelName.name),
                        PolygonLabelsExporter.escapeCsvValue(PolygonLabelsExporter.getMaskFilename(imageData, index))
                    ].join(','));
                });
            });

        ExporterUtil.saveAs(rows.join('\n'), 'annotation_summary.csv');
    }

    private static drawPolygon(context: CanvasRenderingContext2D, vertices: IPoint[]): void {
        if (!vertices || vertices.length < 3) return;

        context.beginPath();
        context.moveTo(vertices[0].x, vertices[0].y);

        vertices.slice(1).forEach((vertex: IPoint) => {
            context.lineTo(vertex.x, vertex.y);
        });

        context.closePath();
        context.fill();
    }

    private static createSingleAnnotationMask(imageData: ImageData, labelPolygon: LabelPolygon): Promise<Blob> {
        return new Promise((resolve: (blob: Blob) => void, reject: () => void) => {
            const image: HTMLImageElement = ImageRepository.getById(imageData.id);
            const canvas: HTMLCanvasElement = document.createElement('canvas');
            const width: number = image.naturalWidth || image.width;
            const height: number = image.naturalHeight || image.height;

            canvas.width = width;
            canvas.height = height;

            const context: CanvasRenderingContext2D = canvas.getContext('2d');

            context.fillStyle = 'black';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = 'white';

            PolygonLabelsExporter.drawPolygon(context, labelPolygon.vertices);

            canvas.toBlob((blob: Blob | null) => {
                if (!blob) {
                    reject();
                    return;
                }

                resolve(blob);
            }, 'image/png');
        });
    }

    private static getAnnotationId(index: number): string {
        return `annotation_${String(index + 1).padStart(3, '0')}`;
    }

    private static getValidPolygonLabels(imageData: ImageData): LabelPolygon[] {
        return imageData.labelPolygons.filter((label: LabelPolygon) =>
            label.labelId !== null && !!label.vertices && label.vertices.length >= 3);
    }

    private static getCoreImageId(imageData: ImageData): string {
        return imageData.fileData.name.replace(/\.[^/.]+$/, '');
    }

    private static getMaskFilename(imageData: ImageData, index: number): string {
        return `${PolygonLabelsExporter.getCoreImageId(imageData)}_annotation_${String(index + 1).padStart(3, '0')}.png`;
    }

    private static escapeCsvValue(value: string): string {
        const escapedValue: string = value.replace(/"/g, '""');
        return `"${escapedValue}"`;
    }
}