import React, {useState} from 'react'
import './ExportLabelPopup.scss'
import {AnnotationFormatType} from '../../../data/enums/AnnotationFormatType'
import {RectLabelsExporter} from '../../../logic/export/RectLabelsExporter'
import {LabelType} from '../../../data/enums/LabelType'
import {ILabelFormatData} from '../../../interfaces/ILabelFormatData'
import {PointLabelsExporter} from '../../../logic/export/PointLabelsExport'
import {PolygonLabelsExporter} from '../../../logic/export/polygon/PolygonLabelsExporter'
import {PopupActions} from '../../../logic/actions/PopupActions'
import {LineLabelsExporter} from '../../../logic/export/LineLabelExport'
import {TagLabelsExporter} from '../../../logic/export/TagLabelsExport'
import GenericLabelTypePopup from '../GenericLabelTypePopup/GenericLabelTypePopup'
import {ExportFormatData} from '../../../data/ExportFormatData'
import {AppState} from '../../../store'
import {connect} from 'react-redux'
import {BrushLabelsExporter} from '../../../logic/export/BrushLabelsExporter'

interface IProps {
    activeLabelType: LabelType
}

const ExportLabelPopup: React.FC<IProps> = ({activeLabelType}) => {
    const allowedLabelTypes: LabelType[] = [
        LabelType.BRUSH,
        LabelType.POLYGON
    ]

    const initialLabelType = allowedLabelTypes.includes(activeLabelType)
        ? activeLabelType
        : LabelType.BRUSH

    const [labelType, setLabelType] = useState(initialLabelType)
    const [exportFormatType, setExportFormatType] = useState(AnnotationFormatType.PNG_MASK)

    const onAccept = async (type: LabelType) => {
        console.error('EXPORT_ACCEPT_CLICKED')
        console.error('EXPORT_TYPE_FROM_POPUP', type)
        console.error('EXPORT_TYPE_FROM_STATE', labelType)
        console.error('EXPORT_FORMAT_TYPE', exportFormatType)

        try {
            if (type === LabelType.BRUSH) {
                console.error('CALLING_BRUSH_EXPORTER')

                const downloadWindow = window.open('', '_blank')

                if (downloadWindow) {
                    downloadWindow.document.write(`
                        <!doctype html>
                        <html>
                            <head>
                                <title>Preparing download</title>
                            </head>
                            <body style="font-family: Arial, sans-serif; padding: 32px;">
                                <h2>Preparing brush annotation export...</h2>
                                <p>Please keep this window open.</p>
                            </body>
                        </html>
                    `)
                    downloadWindow.document.close()
                }

                await BrushLabelsExporter.export(AnnotationFormatType.PNG_MASK, downloadWindow)

                console.error('BRUSH_EXPORTER_FINISHED')
                PopupActions.close()
                return
            }

            if (type === LabelType.POLYGON) {
                console.error('CALLING_POLYGON_EXPORTER')
                PolygonLabelsExporter.export(AnnotationFormatType.PNG_MASK)
                PopupActions.close()
                return
            }

            console.error('UNSUPPORTED_EXPORT_TYPE', type)
            PopupActions.close()
        } catch (error) {
            console.error('EXPORT_FAILED_IN_POPUP', error)
        }
    }

    const onReject = () => {
        PopupActions.close()
    }

    const onSelect = (type: AnnotationFormatType) => {
        setExportFormatType(type)
    }

    const getOptions = (exportFormatData: ILabelFormatData[]) => {
        return exportFormatData.map((entry: ILabelFormatData) => {
            return (
                <div
                    className='OptionsItem'
                    onClick={() => onSelect(entry.type)}
                    key={entry.type}
                >
                    {entry.type === exportFormatType ?
                        <img
                            draggable={false}
                            src='ico/checkbox-checked.png'
                            alt='checked'
                        /> :
                        <img
                            draggable={false}
                            src='ico/checkbox-unchecked.png'
                            alt='unchecked'
                        />}
                    {entry.label}
                </div>
            )
        })
    }

    const renderInternalContent = (type: LabelType) => {
        return (
            <>
                <div className='Message'>
                    Export annotations as PNG masks with a CSV summary.
                </div>
                <div className='Options'>
                    {getOptions(ExportFormatData[type])}
                </div>
            </>
        )
    }

    const onLabelTypeChange = (type: LabelType) => {
        setLabelType(type)
        setExportFormatType(AnnotationFormatType.PNG_MASK)
    }

    return (
        <GenericLabelTypePopup
            activeLabelType={labelType}
            allowedLabelTypes={allowedLabelTypes}
            title={`Export ${labelType.toLowerCase()} annotations`}
            onLabelTypeChange={onLabelTypeChange}
            acceptLabel='Export'
            onAccept={onAccept}
            disableAcceptButton={false}
            rejectLabel='Cancel'
            onReject={onReject}
            renderInternalContent={renderInternalContent}
        />
    )
}

const mapDispatchToProps = {}

const mapStateToProps = (state: AppState) => ({
    activeLabelType: state.labels.activeLabelType
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExportLabelPopup)