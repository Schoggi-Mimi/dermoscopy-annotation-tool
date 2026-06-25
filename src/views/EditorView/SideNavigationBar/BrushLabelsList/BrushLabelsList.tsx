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
import {findLast, truncate} from 'lodash'
import {Settings} from '../../../../settings/Settings'
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
    const activeSelectorHeight = 46
    const brushSizeControlHeight = 54
    const brushRadiusMin = 5
    const brushRadiusMax = 80
    const labelBrushes = imageData.labelBrushes || []

    const activeLabelName = findLast(labelNames, {id: activeLabelNameId})

    const listStyle: React.CSSProperties = {
        width: size.width,
        height: size.height
    }

    const listStyleContent: React.CSSProperties = {
        width: size.width,
        height: labelBrushes.length * labelInputFieldHeight
    }

    const deleteBrushLabelById = (labelBrushId: string) => {
        const newImageData: ImageData = {
            ...imageData,
            labelBrushes: labelBrushes.filter((labelBrush: LabelBrush) => labelBrush.id !== labelBrushId)
        }

        updateImageDataByIdAction(imageData.id, newImageData)

        if (activeLabelId === labelBrushId) {
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
                className='ActiveBrushSelector'
                style={{
                    width: size.width,
                    height: activeSelectorHeight
                }}
                onClick={(event) => event.stopPropagation()}
            >
                <div
                    className='ActiveBrushMarker'
                    style={activeLabelName ? {backgroundColor: activeLabelName.color} : {}}
                />
                <select
                    className='ActiveBrushSelect'
                    value={activeLabelNameId || ''}
                    onChange={(event) => {
                        updateActiveLabelNameIdAction(event.target.value)
                        updateActiveLabelIdAction(null)
                    }}
                >
                    {labelNames.map((labelName: LabelName) => (
                        <option
                            key={labelName.id}
                            value={labelName.id}
                        >
                            {truncate(labelName.name, {length: Settings.MAX_DROPDOWN_OPTION_LENGTH})}
                        </option>
                    ))}
                </select>
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
            onClickCapture={onClickHandler}
        >
            {renderActiveBrushSelector()}
            {renderBrushSizeControl()}
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