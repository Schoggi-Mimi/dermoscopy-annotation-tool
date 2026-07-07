import JSZip from 'jszip'
import { findLast } from 'lodash'
import { AnnotationFormatType } from '../../data/enums/AnnotationFormatType'
import { IPoint } from '../../interfaces/IPoint'
import { ImageData, LabelBrush, LabelBrushStroke, LabelName } from '../../store/labels/types'
import { LabelsSelector } from '../../store/selectors/LabelsSelector'
import { ExporterUtil } from '../../utils/ExporterUtil'

export class BrushLabelsExporter {
    private static readonly BINARY_THRESHOLD = 0

    public static async export(
        exportFormatType: AnnotationFormatType,
        downloadWindow?: Window | null
    ): Promise<void> {
        if (exportFormatType !== AnnotationFormatType.PNG_MASK) {
            throw new Error(`Unsupported brush export format: ${exportFormatType}`)
        }

        await BrushLabelsExporter.exportPngMasks(downloadWindow)
    }

    private static async exportPngMasks(downloadWindow?: Window | null): Promise<void> {
        const imagesData: ImageData[] = LabelsSelector.getImagesData()
        const labelNames: LabelName[] = LabelsSelector.getLabelNames()
        const zip = new JSZip()

        const rows: string[] = [
            'Image_ID,Annotation_ID,Label_ID,Label_Name,Mask_Filename,Stroke_Count'
        ]

        let exportedMaskCount = 0

        for (const imageData of imagesData) {
            const validBrushLabels = BrushLabelsExporter.mergeBrushLabelsByLabelId(
                BrushLabelsExporter.getValidBrushLabels(imageData)
            )

            if (validBrushLabels.length === 0) {
                continue
            }

            const imageSize = await BrushLabelsExporter.getImageSize(imageData)

            for (let index = 0; index < validBrushLabels.length; index++) {
                const labelBrush = validBrushLabels[index]
                const labelName = findLast(labelNames, { id: labelBrush.labelId })

                if (!labelName) {
                    continue
                }

                const annotationId = BrushLabelsExporter.getAnnotationId(index)
                const maskFilename = BrushLabelsExporter.getMaskFilename(imageData, index, labelName.name)

                const maskBlob = await BrushLabelsExporter.createMaskBlob(
                    labelBrush,
                    imageSize.width,
                    imageSize.height
                )

                zip.file(maskFilename, maskBlob)

                rows.push([
                    BrushLabelsExporter.escapeCsvValue(BrushLabelsExporter.getCoreImageId(imageData)),
                    BrushLabelsExporter.escapeCsvValue(annotationId),
                    BrushLabelsExporter.escapeCsvValue(labelBrush.labelId || ''),
                    BrushLabelsExporter.escapeCsvValue(labelName.name),
                    BrushLabelsExporter.escapeCsvValue(maskFilename),
                    BrushLabelsExporter.escapeCsvValue(String(labelBrush.strokes.length))
                ].join(','))

                exportedMaskCount += 1
            }
        }

        zip.file('brush_annotation_summary.csv', rows.join('\n'))

        if (exportedMaskCount === 0) {
            zip.file(
                'NO_BRUSH_MASKS_EXPORTED.txt',
                'No valid brush masks were found. Check imageData.labelBrushes in Redux.'
            )
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' })

        ExporterUtil.saveBlob(
            zipBlob,
            'brush_annotation_masks.zip',
            downloadWindow
        )
    }

    private static getValidBrushLabels(imageData: ImageData): LabelBrush[] {
        return (imageData.labelBrushes || []).filter((labelBrush: LabelBrush) => {
            return labelBrush.labelId !== null &&
                !!labelBrush.strokes &&
                labelBrush.strokes.length > 0 &&
                labelBrush.strokes.some((stroke: LabelBrushStroke) => {
                    return stroke.points && stroke.points.length > 0
                })
        })
    }

    private static async getImageSize(imageData: ImageData): Promise<{ width: number, height: number }> {
        return new Promise((resolve, reject) => {
            if (!imageData.fileData) {
                reject(new Error(`Missing fileData for image ${imageData.id}`))
                return
            }

            const image = new Image()
            const objectUrl = URL.createObjectURL(imageData.fileData)

            image.onload = () => {
                const width = image.naturalWidth || image.width
                const height = image.naturalHeight || image.height

                URL.revokeObjectURL(objectUrl)

                if (!width || !height) {
                    reject(new Error(`Invalid image size for image ${imageData.id}`))
                    return
                }

                resolve({ width, height })
            }

            image.onerror = () => {
                URL.revokeObjectURL(objectUrl)
                reject(new Error(`Could not load image for image ${imageData.id}`))
            }

            image.src = objectUrl
        })
    }

    private static async createMaskBlob(
        labelBrush: LabelBrush,
        width: number,
        height: number
    ): Promise<Blob> {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d')

        if (!context) {
            throw new Error('Could not create canvas context')
        }

        context.fillStyle = 'black'
        context.fillRect(0, 0, width, height)

        context.fillStyle = 'white'
        context.strokeStyle = 'white'
        context.lineCap = 'round'
        context.lineJoin = 'round'

        labelBrush.strokes.forEach((stroke: LabelBrushStroke) => {
            BrushLabelsExporter.drawStroke(context, stroke)
        })

        BrushLabelsExporter.forceBinaryCanvas(context, width, height)

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob: Blob | null) => {
                if (!blob) {
                    reject(new Error('Could not convert mask canvas to blob'))
                    return
                }

                resolve(blob)
            }, 'image/png')
        })
    }

    private static drawStroke(context: CanvasRenderingContext2D, stroke: LabelBrushStroke): void {
        if (!stroke.points || stroke.points.length === 0) {
            return
        }

        context.lineWidth = stroke.radius * 2

        if (stroke.points.length === 1) {
            const point = stroke.points[0]

            context.beginPath()
            context.arc(point.x, point.y, stroke.radius, 0, Math.PI * 2)
            context.fill()
            return
        }

        context.beginPath()
        context.moveTo(stroke.points[0].x, stroke.points[0].y)

        for (let index = 1; index < stroke.points.length; index++) {
            const point: IPoint = stroke.points[index]
            context.lineTo(point.x, point.y)
        }

        context.stroke()
    }

    private static forceBinaryCanvas(
        context: CanvasRenderingContext2D,
        width: number,
        height: number
    ): void {
        const imageData = context.getImageData(0, 0, width, height)
        const data = imageData.data

        for (let index = 0; index < data.length; index += 4) {
            const isForeground =
                data[index] > BrushLabelsExporter.BINARY_THRESHOLD ||
                data[index + 1] > BrushLabelsExporter.BINARY_THRESHOLD ||
                data[index + 2] > BrushLabelsExporter.BINARY_THRESHOLD

            const value = isForeground ? 255 : 0

            data[index] = value
            data[index + 1] = value
            data[index + 2] = value
            data[index + 3] = 255
        }

        context.putImageData(imageData, 0, 0)
    }

    private static getAnnotationId(index: number): string {
        return `brush_annotation_${String(index + 1).padStart(3, '0')}`
    }

    private static getCoreImageId(imageData: ImageData): string {
        return imageData.fileData.name.replace(/\.[^/.]+$/, '')
    }

    private static getMaskFilename(imageData: ImageData, index: number, labelName: string): string {
        const cleanLabelName = labelName
            .replace(/[^a-zA-Z0-9_]/g, '_')
            .toLowerCase()

        return `${BrushLabelsExporter.getCoreImageId(imageData)}_${cleanLabelName}_brush_${String(index + 1).padStart(3, '0')}.png`
    }

    private static escapeCsvValue(value: string): string {
        const escapedValue = value.replace(/"/g, '""')
        return `"${escapedValue}"`
    }

    private static mergeBrushLabelsByLabelId(labelBrushes: LabelBrush[]): LabelBrush[] {
        const grouped: { [labelId: string]: LabelBrush } = {}

        labelBrushes.forEach((labelBrush: LabelBrush) => {
            if (!labelBrush.labelId) {
                return
            }

            if (!grouped[labelBrush.labelId]) {
                grouped[labelBrush.labelId] = {
                    ...labelBrush,
                    strokes: [...labelBrush.strokes]
                }
                return
            }

            grouped[labelBrush.labelId] = {
                ...grouped[labelBrush.labelId],
                strokes: [
                    ...grouped[labelBrush.labelId].strokes,
                    ...labelBrush.strokes
                ],
                isVisible: grouped[labelBrush.labelId].isVisible || labelBrush.isVisible
            }
        })

        return Object.values(grouped)
    }
}