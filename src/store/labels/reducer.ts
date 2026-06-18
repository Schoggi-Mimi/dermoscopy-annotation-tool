import { Action } from '../Actions';
import { ImageData, LabelsActionTypes, LabelsState } from './types';
import { LabelType } from '../../data/enums/LabelType';

const initialState: LabelsState = {
    activeImageIndex: null,
    activeLabelNameId: 'diagnostic_region',
    activeLabelType: LabelType.RECT,
    activeLabelId: null,
    highlightedLabelId: null,
    imagesData: [],
    firstLabelCreatedFlag: true,
    labels: [
        { id: 'diagnostic_region', name: 'diagnostic_region', color: '#FF0000' },
        { id: 'suspicious_pigment', name: 'suspicious_pigment', color: '#FF9900' },
        { id: 'irregular_border', name: 'irregular_border', color: '#00AAFF' },
        { id: 'asymmetry_region', name: 'asymmetry_region', color: '#AA00FF' },
        { id: 'structure_pattern_region', name: 'structure_pattern_region', color: '#00CC66' },
        { id: 'artifact_ignore', name: 'artifact_ignore', color: '#999999' }
    ]
};

export function labelsReducer(
    state = initialState,
    action: LabelsActionTypes
): LabelsState {
    switch (action.type) {
        case Action.UPDATE_ACTIVE_IMAGE_INDEX: {
            return {
                ...state,
                activeImageIndex: action.payload.activeImageIndex
            }
        }
        case Action.UPDATE_ACTIVE_LABEL_NAME_ID: {
            return {
                ...state,
                activeLabelNameId: action.payload.activeLabelNameId
            }
        }
        case Action.UPDATE_ACTIVE_LABEL_ID: {
            return {
                ...state,
                activeLabelId: action.payload.activeLabelId
            }
        }
        case Action.UPDATE_HIGHLIGHTED_LABEL_ID: {
            return {
                ...state,
                highlightedLabelId: action.payload.highlightedLabelId
            }
        }
        case Action.UPDATE_ACTIVE_LABEL_TYPE: {
            return {
                ...state,
                activeLabelType: action.payload.activeLabelType
            }
        }
        case Action.UPDATE_IMAGE_DATA_BY_ID: {
            return {
                ...state,
                imagesData: state.imagesData.map((imageData: ImageData) =>
                    imageData.id === action.payload.id ? action.payload.newImageData : imageData
                )
            }
        }
        case Action.ADD_IMAGES_DATA: {
            return {
                ...state,
                imagesData: state.imagesData.concat(action.payload.imageData)
            }
        }
        case Action.UPDATE_IMAGES_DATA: {
            return {
                ...state,
                imagesData: action.payload.imageData
            }
        }
        case Action.UPDATE_LABEL_NAMES: {
            return {
                ...state,
                labels: action.payload.labels
            }
        }
        case Action.UPDATE_FIRST_LABEL_CREATED_FLAG: {
            return {
                ...state,
                firstLabelCreatedFlag: action.payload.firstLabelCreatedFlag
            }
        }
        default:
            return state;
    }
}
