import {ILabelFormatData} from '../interfaces/ILabelFormatData'
import {LabelType} from './enums/LabelType'
import {AnnotationFormatType} from './enums/AnnotationFormatType'

export type ExportFormatDataMap = Record<LabelType, ILabelFormatData[]>

export const ExportFormatData: ExportFormatDataMap = {
    [LabelType.RECT]: [],
    [LabelType.POINT]: [],
    [LabelType.LINE]: [],
    [LabelType.POLYGON]: [
        {
            type: AnnotationFormatType.PNG_MASK,
            label: 'Export PNG Masks + CSV Summary as ZIP.'
        }
    ],
    [LabelType.IMAGE_RECOGNITION]: [],
    [LabelType.BRUSH]: [
        {
            type: AnnotationFormatType.PNG_MASK,
            label: 'Export PNG Masks + CSV Summary as ZIP.'
        }
    ]
}