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
        {
            id: 'diagnostic_region',
            name: 'Diagnostic region',
            color: '#FF0000'
        },
        {
            id: 'atypical_network',
            name: 'Atypical network',
            color: '#FF9900'
        },
        {
            id: 'atypical_dots',
            name: 'Atypical dots',
            color: '#FFD500'
        },
        {
            id: 'structureless_area',
            name: 'Structureless area',
            color: '#AA00FF'
        },
        {
            id: 'regression',
            name: 'Regression',
            color: '#00C2FF'
        },
        {
            id: 'atypical_vascular_pattern',
            name: 'Atypical vascular pattern',
            color: '#FF37C7'
        },
        {
            id: 'atypical_streaks',
            name: 'Atypical streaks',
            color: '#344593'
        },
        {
            id: 'regular_network',
            name: 'Regular network',
            color: '#48F90A'
        },
        {
            id: 'homogeneous',
            name: 'Homogeneous',
            color: '#92CC17'
        },
        {
            id: 'globular_network',
            name: 'Globular network',
            color: '#00D4BB'
        },
        {
            id: 'artifact_to_ignore',
            name: 'Artifact to ignore',
            color: '#999999'
        }
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
