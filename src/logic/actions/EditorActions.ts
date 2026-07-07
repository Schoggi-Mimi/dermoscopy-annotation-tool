import React from "react";
import { EditorData } from "../../data/EditorData";
import { CustomCursorStyle } from "../../data/enums/CustomCursorStyle";
import { LabelType } from "../../data/enums/LabelType";
import { IPoint } from "../../interfaces/IPoint";
import { IRect } from "../../interfaces/IRect";
import { ISize } from "../../interfaces/ISize";
import { EditorModel } from "../../staticModels/EditorModel";
import { GeneralSelector } from "../../store/selectors/GeneralSelector";
import { CanvasUtil } from "../../utils/CanvasUtil";
import { DrawUtil } from "../../utils/DrawUtil";
import { ImageUtil } from "../../utils/ImageUtil";
import { PointUtil } from "../../utils/PointUtil";
import { RectUtil } from "../../utils/RectUtil";
import { ContextManager } from "../context/ContextManager";
import { ViewPortHelper } from "../helpers/ViewPortHelper";
import { BrushRenderEngine } from "../render/BrushRenderEngine";
import { LineRenderEngine } from "../render/LineRenderEngine";
import { PointRenderEngine } from "../render/PointRenderEngine";
import { PolygonRenderEngine } from "../render/PolygonRenderEngine";
import { PrimaryEditorRenderEngine } from "../render/PrimaryEditorRenderEngine";
import { RectRenderEngine } from "../render/RectRenderEngine";
import { ViewPortActions } from "./ViewPortActions";

export class EditorActions {

    // =================================================================================================================
    // RENDER ENGINES
    // =================================================================================================================

    public static mountSupportRenderingEngine(activeLabelType: LabelType) {
        switch (activeLabelType) {
            case LabelType.RECT:
                EditorModel.supportRenderingEngine = new RectRenderEngine(EditorModel.canvas)
                break
            case LabelType.POINT:
                EditorModel.supportRenderingEngine = new PointRenderEngine(EditorModel.canvas)
                break
            case LabelType.LINE:
                EditorModel.supportRenderingEngine = new LineRenderEngine(EditorModel.canvas)
                break
            case LabelType.POLYGON:
                EditorModel.supportRenderingEngine = new PolygonRenderEngine(EditorModel.canvas)
                break
            case LabelType.BRUSH:
                EditorModel.supportRenderingEngine = new BrushRenderEngine(EditorModel.canvas)
                break
            default:
                EditorModel.supportRenderingEngine = null
                break
        }
    };

    public static swapSupportRenderingEngine(activeLabelType: LabelType) {
        EditorActions.mountSupportRenderingEngine(activeLabelType);
    };

    public static mountRenderEnginesAndHelpers(activeLabelType: LabelType) {
        EditorModel.viewPortHelper = new ViewPortHelper();
        EditorModel.primaryRenderingEngine = new PrimaryEditorRenderEngine(EditorModel.canvas);
        EditorActions.mountSupportRenderingEngine(activeLabelType);
    }

    // =================================================================================================================
    // RENDER
    // =================================================================================================================

    public static fullRender() {
        DrawUtil.clearCanvas(EditorModel.canvas);
        EditorModel.primaryRenderingEngine.render(EditorActions.getEditorData());
        EditorModel.supportRenderingEngine && EditorModel.supportRenderingEngine.render(EditorActions.getEditorData());
    }

    // =================================================================================================================
    // SETTERS
    // =================================================================================================================

    public static setLoadingStatus(status: boolean) {
        EditorModel.isLoading = status;
    }
    public static setActiveImage(image: HTMLImageElement) {
        EditorModel.image = image;
    }

    public static setViewPortActionsDisabledStatus(status: boolean) {
        EditorModel.viewPortActionsDisabled = status;
    }

    // =================================================================================================================
    // GETTERS
    // =================================================================================================================

    public static getEditorData(event?: Event): EditorData {
        return {
            mousePositionOnViewPortContent: EditorModel.mousePositionOnViewPortContent,
            viewPortContentSize: CanvasUtil.getSize(EditorModel.canvas),
            activeKeyCombo: ContextManager.getActiveCombo(),
            event: event,
            zoom: GeneralSelector.getZoom(),
            viewPortSize: EditorModel.viewPortSize,
            defaultRenderImageRect: EditorModel.defaultRenderImageRect,
            viewPortContentImageRect: ViewPortActions.calculateViewPortContentImageRect(),
            realImageSize: ImageUtil.getSize(EditorModel.image),
            absoluteViewPortContentScrollPosition: ViewPortActions.getAbsoluteScrollPosition()
        }
    }

    // =================================================================================================================
    // HELPERS
    // =================================================================================================================

    public static updateMousePositionIndicator(event: React.MouseEvent<HTMLCanvasElement, MouseEvent> | MouseEvent) {
        if (!EditorModel.image || !EditorModel.canvas) {
            EditorModel.mousePositionIndicator.style.display = "none";
            EditorModel.cursor.style.display = "none";
            return;
        }

        const mousePositionOverViewPortContent: IPoint = CanvasUtil.getMousePositionOnCanvasFromEvent(event, EditorModel.canvas);
        const viewPortContentScrollPosition: IPoint = ViewPortActions.getAbsoluteScrollPosition();
        const viewPortContentImageRect: IRect = ViewPortActions.calculateViewPortContentImageRect();
        const mousePositionOverViewPort: IPoint = PointUtil.subtract(mousePositionOverViewPortContent, viewPortContentScrollPosition);
        const isMouseOverImage: boolean = RectUtil.isPointInside(viewPortContentImageRect, mousePositionOverViewPortContent);
        const isMouseOverViewPort: boolean = RectUtil.isPointInside({ x: 0, y: 0, ...EditorModel.viewPortSize }, mousePositionOverViewPort);

        if (isMouseOverViewPort && !GeneralSelector.getPreventCustomCursorStatus()) {
            EditorModel.cursor.style.left = mousePositionOverViewPort.x + "px";
            EditorModel.cursor.style.top = mousePositionOverViewPort.y + "px";
            EditorModel.cursor.style.display = "block";

            const customCursorStyle = GeneralSelector.getCustomCursorStyle()

            if (customCursorStyle === CustomCursorStyle.BRUSH && isMouseOverImage) {
                const imageSize: ISize = ImageUtil.getSize(EditorModel.image)
                const scale: number = imageSize.width / viewPortContentImageRect.width
                const brushDiameterOnViewPort = Math.max(
                    2,
                    GeneralSelector.getBrushRadiusImagePx() * 2 / scale
                )

                EditorModel.cursor.style.width = brushDiameterOnViewPort + "px"
                EditorModel.cursor.style.height = brushDiameterOnViewPort + "px"
            } else {
                EditorModel.cursor.style.width = null
                EditorModel.cursor.style.height = null
            }

            if (isMouseOverImage && ![CustomCursorStyle.GRAB, CustomCursorStyle.GRABBING].includes(customCursorStyle)) {
                const imageSize: ISize = ImageUtil.getSize(EditorModel.image);
                const scale: number = imageSize.width / viewPortContentImageRect.width;
                const mousePositionOverImage: IPoint = PointUtil.multiply(
                    PointUtil.subtract(mousePositionOverViewPortContent, viewPortContentImageRect), scale);
                const text: string = "x: " + Math.round(mousePositionOverImage.x) + ", y: " + Math.round(mousePositionOverImage.y);

                EditorModel.mousePositionIndicator.innerHTML = text;
                EditorModel.mousePositionIndicator.style.left = (mousePositionOverViewPort.x + 15) + "px";
                EditorModel.mousePositionIndicator.style.top = (mousePositionOverViewPort.y + 15) + "px";
                EditorModel.mousePositionIndicator.style.display = "block";
            } else {
                EditorModel.mousePositionIndicator.style.display = "none";
            }
        } else {
            EditorModel.cursor.style.display = "none";
            EditorModel.mousePositionIndicator.style.display = "none";
        }
    };
}