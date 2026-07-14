import React from 'react'
import {ISize} from '../../../../interfaces/ISize'
import Scrollbars from 'react-custom-scrollbars-2'
import {ImageData, LabelBrush, LabelName} from '../../../../store/labels/types'
import './BrushLabelsList.scss'
import {
    updateActiveLabelId,
    updateActiveLabelNameId,
    updateImageDataById
} from '../../../../store/labels/actionCreators'
import {AppState} from '../../../../store'
import {connect} from 'react-redux'
import LabelInputField from '../LabelInputField/LabelInputField'
import EmptyLabelList from '../EmptyLabelList/EmptyLabelList'
import {findLast} from 'lodash'
import {updateBrushRadiusImagePx} from '../../../../store/general/actionCreators'

interface IProps {
    size: ISize
    imageData: ImageData
    updateImageDataByIdAction: (id: string, newImageData: ImageData) => any
    activeLabelId: string
    highlightedLabelId: string
    activeLabelNameId: string
    updateActiveLabelNameIdAction: (activeLabelNameId: string) => any
    labelNames: LabelName[]
    updateActiveLabelIdAction: (activeLabelId: string) => any
    brushRadiusImagePx: number
    updateBrushRadiusImagePxAction: (brushRadiusImagePx: number) => any
}

const BrushLabelsList: React.FC<IProps> = (
    {
        size,
        imageData,
        updateImageDataByIdAction,
        labelNames,
        activeLabelNameId,
        updateActiveLabelNameIdAction,
        activeLabelId,
        highlightedLabelId,
        updateActiveLabelIdAction,
        brushRadiusImagePx,
        updateBrushRadiusImagePxAction
    }
) => {
    const labelInputFieldHeight = 40
    const brushSizeControlHeight = 54
    const labelPaletteHeaderHeight = 28
    const labelPaletteOptionHeight = 32
    const maxLabelPaletteHeight = 390
    const brushRadiusMin = 1
    const brushRadiusMax = 30
    const labelBrushes = imageData.labelBrushes || []

    const labelPaletteHeight = Math.min(
        maxLabelPaletteHeight,
        labelPaletteHeaderHeight + labelNames.length * labelPaletteOptionHeight
    )

    const listStyle: React.CSSProperties = {
        width: size.width,
        height: size.height
    }

    const listStyleContent: React.CSSProperties = {
        width: size.width,
        height: labelBrushes.length * labelInputFieldHeight
    }

    const selectActiveLabelName = (labelNameId: string) => {
        updateActiveLabelNameIdAction(labelNameId)
        updateActiveLabelIdAction(null)
    }

    const deleteBrushLabelById = (labelBrushId: string) => {
        const newLabelBrushes = labelBrushes.filter((labelBrush: LabelBrush) =>
            labelBrush.id !== labelBrushId
        )

        const newImageData: ImageData = {
            ...imageData,
            labelBrushes: newLabelBrushes
        }

        updateImageDataByIdAction(imageData.id, newImageData)

        if (activeLabelId === labelBrushId || newLabelBrushes.length === 0) {
            updateActiveLabelIdAction(null)
        }
    }

    const toggleBrushLabelVisibilityById = (labelBrushId: string) => {
        const newImageData: ImageData = {
            ...imageData,
            labelBrushes: labelBrushes.map((labelBrush: LabelBrush) => {
                if (labelBrush.id !== labelBrushId) {
                    return labelBrush
                }

                return {
                    ...labelBrush,
                    isVisible: !labelBrush.isVisible
                }
            })
        }

        updateImageDataByIdAction(imageData.id, newImageData)
    }

    const updateBrushLabel = (labelBrushId: string, labelNameId: string) => {
        const sourceBrush = labelBrushes.find((labelBrush: LabelBrush) => labelBrush.id === labelBrushId)

        if (!sourceBrush) {
            return
        }

        const targetBrush = labelBrushes.find((labelBrush: LabelBrush) =>
            labelBrush.id !== labelBrushId && labelBrush.labelId === labelNameId
        )

        let newLabelBrushes: LabelBrush[]

        if (targetBrush) {
            newLabelBrushes = labelBrushes
                .filter((labelBrush: LabelBrush) => labelBrush.id !== sourceBrush.id)
                .map((labelBrush: LabelBrush) => {
                    if (labelBrush.id !== targetBrush.id) {
                        return labelBrush
                    }

                    return {
                        ...labelBrush,
                        strokes: [
                            ...labelBrush.strokes,
                            ...sourceBrush.strokes
                        ],
                        isVisible: labelBrush.isVisible || sourceBrush.isVisible
                    }
                })

            updateActiveLabelIdAction(targetBrush.id)
        } else {
            newLabelBrushes = labelBrushes.map((labelBrush: LabelBrush) => {
                if (labelBrush.id !== labelBrushId) {
                    return labelBrush
                }

                return {
                    ...labelBrush,
                    labelId: labelNameId
                }
            })

            updateActiveLabelIdAction(labelBrushId)
        }

        const newImageData: ImageData = {
            ...imageData,
            labelBrushes: newLabelBrushes
        }

        updateImageDataByIdAction(imageData.id, newImageData)
        updateActiveLabelNameIdAction(labelNameId)
    }

    const onClickHandler = () => {
        updateActiveLabelIdAction(null)
    }

    const renderActiveBrushSelector = () => {
        return (
            <div
                className='BrushLabelPalette'
                style={{
                    width: size.width,
                    height: labelPaletteHeight
                }}
                onClick={(event) => event.stopPropagation()}
            >
                <div
                    className='BrushLabelPaletteHeader'
                    style={{
                        height: labelPaletteHeaderHeight
                    }}
                >
                    Annotation label
                </div>
                <div className='BrushLabelPaletteScroll'>
                    <Scrollbars>
                        <div className='BrushLabelPaletteContent'>
                            {labelNames.map((labelName: LabelName) => {
                                const isActive = labelName.id === activeLabelNameId

                                return (
                                    <button
                                        type='button'
                                        key={labelName.id}
                                        className={isActive ? 'BrushLabelOption active' : 'BrushLabelOption'}
                                        style={{
                                            height: labelPaletteOptionHeight
                                        }}
                                        onClick={() => selectActiveLabelName(labelName.id)}
                                    >
                                        <span
                                            className='BrushLabelOptionMarker'
                                            style={{
                                                backgroundColor: labelName.color
                                            }}
                                        />
                                        <span className='BrushLabelOptionName'>
                                            {labelName.name}
                                        </span>
                                        {isActive && (
                                            <span className='BrushLabelOptionCheck'>
                                                ✓
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </Scrollbars>
                </div>
            </div>
        )
    }

    const renderBrushSizeControl = () => {
        return (
            <div
                className='BrushSizeControl'
                style={{
                    width: size.width,
                    height: brushSizeControlHeight
                }}
                onClick={(event) => event.stopPropagation()}
            >
                <div className='BrushSizeHeader'>
                    <span>Brush radius</span>
                    <span>{brushRadiusImagePx}px</span>
                </div>
                <input
                    className='BrushSizeSlider'
                    type='range'
                    min={brushRadiusMin}
                    max={brushRadiusMax}
                    step={1}
                    value={brushRadiusImagePx}
                    onChange={(event) => updateBrushRadiusImagePxAction(Number(event.target.value))}
                />
            </div>
        )
    }

    const getChildren = () => {
        return labelBrushes.map((labelBrush: LabelBrush) => {
            return (
                <LabelInputField
                    size={{
                        width: size.width,
                        height: labelInputFieldHeight
                    }}
                    isActive={labelBrush.id === activeLabelId}
                    isHighlighted={labelBrush.id === highlightedLabelId}
                    isVisible={labelBrush.isVisible}
                    id={labelBrush.id}
                    key={labelBrush.id}
                    onDelete={deleteBrushLabelById}
                    value={labelBrush.labelId !== null ? findLast(labelNames, {id: labelBrush.labelId}) : null}
                    options={labelNames}
                    onSelectLabel={updateBrushLabel}
                    toggleLabelVisibility={toggleBrushLabelVisibilityById}
                />
            )
        })
    }

    return (
        <div
            className='BrushLabelsList'
            style={listStyle}
            onClick={onClickHandler}
        >
            {renderActiveBrushSelector()}
            {renderBrushSizeControl()}
            <div className='BrushAnnotationsPanel'>
                <div className='BrushAnnotationsHeader'>
                    Annotations
                </div>
                {labelBrushes.length === 0 ?
                    <EmptyLabelList
                        labelBefore={'paint your first brush annotation'}
                        labelAfter={'no brush annotations created for this image yet'}
                    /> :
                    <Scrollbars>
                        <div
                            className='BrushLabelsListContent'
                            style={listStyleContent}
                        >
                            {getChildren()}
                        </div>
                    </Scrollbars>
                }
            </div>
        </div>
    )
}

const mapDispatchToProps = {
    updateImageDataByIdAction: updateImageDataById,
    updateActiveLabelNameIdAction: updateActiveLabelNameId,
    updateActiveLabelIdAction: updateActiveLabelId,
    updateBrushRadiusImagePxAction: updateBrushRadiusImagePx
}

const mapStateToProps = (state: AppState) => ({
    activeLabelId: state.labels.activeLabelId,
    highlightedLabelId: state.labels.highlightedLabelId,
    activeLabelNameId: state.labels.activeLabelNameId,
    labelNames: state.labels.labels,
    brushRadiusImagePx: state.general.brushRadiusImagePx
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BrushLabelsList)