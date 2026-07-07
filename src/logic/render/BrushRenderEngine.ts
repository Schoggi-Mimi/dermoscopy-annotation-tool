import {store} from '../../index'
import {EditorData} from '../../data/EditorData'
import {BaseRenderEngine} from './BaseRenderEngine'
import {LabelType} from '../../data/enums/LabelType'
import {CustomCursorStyle} from '../../data/enums/CustomCursorStyle'
import {updateCustomCursorStyle} from '../../store/general/actionCreators'
import {RenderEngineUtil} from '../../utils/RenderEngineUtil'
import {GeneralSelector} from '../../store/selectors/GeneralSelector'
import {EventType} from '../../data/enums/EventType'
import {MouseEventUtil} from '../../utils/MouseEventUtil'
import {IPoint} from '../../interfaces/IPoint'
import {RectUtil} from '../../utils/RectUtil'
import {LabelsSelector} from '../../store/selectors/LabelsSelector'
import {ImageData, LabelBrush, LabelBrushStroke} from '../../store/labels/types'
import {LabelUtil} from '../../utils/LabelUtil'
import {
    updateActiveLabelId,
    updateFirstLabelCreatedFlag,
    updateImageDataById
} from '../../store/labels/actionCreators'
import {EditorActions} from '../actions/EditorActions'
import {DrawUtil} from '../../utils/DrawUtil'

export class BrushRenderEngine extends BaseRenderEngine {
    private activeStrokePointsOnImage: IPoint[] = []
    private isPainting = false

    private readonly minPointDistanceImagePx = 1
    private readonly pointDistanceToRadiusRatio = 0.25

    private getMinPointDistanceImagePx(): number {
        return Math.max(
            this.minPointDistanceImagePx,
            this.getBrushRadiusImagePx() * this.pointDistanceToRadiusRatio
        )
    }

    public constructor(canvas: HTMLCanvasElement) {
        super(canvas)
        this.labelType = LabelType.BRUSH
    }

    public update(data: EditorData): void {
        if (!!data.event) {
            switch (MouseEventUtil.getEventType(data.event)) {
                case EventType.MOUSE_MOVE:
                    this.mouseMoveHandler(data)
                    break
                case EventType.MOUSE_UP:
                    this.mouseUpHandler(data)
                    break
                case EventType.MOUSE_DOWN:
                    this.mouseDownHandler(data)
                    break
                default:
                    break
            }
        }
    }

    protected mouseDownHandler(data: EditorData): void {
        if (!RenderEngineUtil.isMouseOverImage(data)) {
            return
        }

        const pointOnImage = this.getClampedMousePointOnImage(data)

        this.isPainting = true
        this.activeStrokePointsOnImage = [pointOnImage]

        EditorActions.setViewPortActionsDisabledStatus(true)
        store.dispatch(updateActiveLabelId(null))
    }

    protected mouseMoveHandler(data: EditorData): void {
        if (!this.isPainting) {
            return
        }

        if (!RenderEngineUtil.isMouseOverCanvas(data)) {
            return
        }

        const pointOnImage = this.getClampedMousePointOnImage(data)
        const lastPoint = this.activeStrokePointsOnImage[this.activeStrokePointsOnImage.length - 1]

        if (!lastPoint || this.distance(lastPoint, pointOnImage) >= this.minPointDistanceImagePx) {
            this.activeStrokePointsOnImage.push(pointOnImage)
        }
    }

    protected mouseUpHandler(data: EditorData): void {
        if (!this.isPainting) {
            return
        }

        this.finishStroke()
    }

    public render(data: EditorData): void {
        this.drawExistingBrushLabels(data)
        this.drawActiveStroke(data)
        this.updateCursorStyle(data)
    }

    public isInProgress(): boolean {
        return this.isPainting
    }

    public cancelLabelCreation(): void {
        this.activeStrokePointsOnImage = []
        this.isPainting = false
        EditorActions.setViewPortActionsDisabledStatus(false)
    }

    private finishStroke(): void {
        if (this.activeStrokePointsOnImage.length === 0) {
            this.cancelLabelCreation()
            return
        }

        const activeLabelNameId = LabelsSelector.getActiveLabelNameId()
        const imageData = LabelsSelector.getActiveImageData()

        if (!imageData) {
            this.cancelLabelCreation()
            return
        }

        const stroke: LabelBrushStroke = {
            points: [...this.activeStrokePointsOnImage],
            radius: this.getBrushRadiusImagePx()
        }

        const labelBrushes = imageData.labelBrushes || []

        const existingBrush = labelBrushes.find((labelBrush: LabelBrush) => {
            return labelBrush.labelId === activeLabelNameId
        })

        let nextActiveLabelId: string
        let nextLabelBrushes: LabelBrush[]

        if (existingBrush) {
            nextActiveLabelId = existingBrush.id

            nextLabelBrushes = labelBrushes.map((labelBrush: LabelBrush) => {
                if (labelBrush.id !== existingBrush.id) {
                    return labelBrush
                }

                return {
                    ...labelBrush,
                    strokes: [
                        ...labelBrush.strokes,
                        stroke
                    ],
                    isVisible: true
                }
            })
        } else {
            const labelBrush = LabelUtil.createLabelBrush(activeLabelNameId, stroke)

            nextActiveLabelId = labelBrush.id
            nextLabelBrushes = [
                ...labelBrushes,
                labelBrush
            ]
        }

        const newImageData: ImageData = {
            ...imageData,
            labelBrushes: nextLabelBrushes
        }

        store.dispatch(updateImageDataById(newImageData.id, newImageData))
        store.dispatch(updateFirstLabelCreatedFlag(true))
        store.dispatch(updateActiveLabelId(nextActiveLabelId))

        this.activeStrokePointsOnImage = []
        this.isPainting = false
        EditorActions.setViewPortActionsDisabledStatus(false)
    }

    private drawExistingBrushLabels(data: EditorData): void {
        const imageData = LabelsSelector.getActiveImageData()

        if (!imageData || !imageData.labelBrushes) {
            return
        }

        imageData.labelBrushes.forEach((labelBrush: LabelBrush) => {
            if (!labelBrush.isVisible) {
                return
            }

            const isActive = labelBrush.id === LabelsSelector.getActiveLabelId()
            const color = BaseRenderEngine.resolveLabelLineColor(labelBrush.labelId, isActive)

            labelBrush.strokes.forEach((stroke: LabelBrushStroke) => {
                const pointsOnCanvas = RenderEngineUtil.transferPolygonFromImageToViewPortContent(stroke.points, data)
                const thicknessOnCanvas = this.imageLengthToCanvasLength(stroke.radius * 2, data)

                DrawUtil.drawRoundPolylineWithAlpha(
                    this.canvas,
                    pointsOnCanvas,
                    color,
                    thicknessOnCanvas,
                    isActive ? 0.55 : 0.38
                )
            })
        })
    }

    private drawActiveStroke(data: EditorData): void {
        if (!this.isPainting || this.activeStrokePointsOnImage.length === 0) {
            return
        }

        const activeLabelNameId = LabelsSelector.getActiveLabelNameId()
        const color = BaseRenderEngine.resolveLabelLineColor(activeLabelNameId, true)
        const pointsOnCanvas = RenderEngineUtil.transferPolygonFromImageToViewPortContent(
            this.activeStrokePointsOnImage,
            data
        )
        const thicknessOnCanvas = this.imageLengthToCanvasLength(this.getBrushRadiusImagePx() * 2, data)

        DrawUtil.drawRoundPolylineWithAlpha(
            this.canvas,
            pointsOnCanvas,
            color,
            thicknessOnCanvas,
            0.55
        )
    }

    private updateCursorStyle(data: EditorData): void {
        if (!this.canvas || !data.mousePositionOnViewPortContent || GeneralSelector.getImageDragModeStatus()) {
            return
        }

        const isMouseOverCanvas = RenderEngineUtil.isMouseOverCanvas(data)
        const isMouseOverImage = RenderEngineUtil.isMouseOverImage(data)

        if (!isMouseOverCanvas) {
            this.canvas.style.cursor = 'default'
            return
        }

        this.canvas.style.cursor = 'none'

        if (isMouseOverImage) {
            store.dispatch(updateCustomCursorStyle(CustomCursorStyle.BRUSH))
        } else {
            store.dispatch(updateCustomCursorStyle(CustomCursorStyle.CANCEL))
        }
    }

    private getClampedMousePointOnImage(data: EditorData): IPoint {
        const pointOnCanvas = RectUtil.snapPointToRect(
            data.mousePositionOnViewPortContent,
            data.viewPortContentImageRect
        )

        return RenderEngineUtil.transferPointFromViewPortContentToImage(pointOnCanvas, data)
    }

    private imageLengthToCanvasLength(lengthOnImage: number, data: EditorData): number {
        const scale = RenderEngineUtil.calculateImageScale(data)
        return lengthOnImage / scale
    }

    private distance(a: IPoint, b: IPoint): number {
        const dx = a.x - b.x
        const dy = a.y - b.y
        return Math.sqrt(dx * dx + dy * dy)
    }

    private getBrushRadiusImagePx(): number {
        return GeneralSelector.getBrushRadiusImagePx()
    }
}