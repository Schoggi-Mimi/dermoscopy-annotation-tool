import React, { useState } from 'react';
import './InsertLabelNamesPopup.scss';
import { GenericYesNoPopup } from '../GenericYesNoPopup/GenericYesNoPopup';
import { PopupWindowType } from '../../../data/enums/PopupWindowType';
import { updateLabelNames } from '../../../store/labels/actionCreators';
import { updateActivePopupType, updatePerClassColorationStatus } from '../../../store/general/actionCreators';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import Scrollbars from 'react-custom-scrollbars-2';
import { ImageButton } from '../../Common/ImageButton/ImageButton';
import { LabelName } from '../../../store/labels/types';
import { LabelUtil } from '../../../utils/LabelUtil';
import { LabelsSelector } from '../../../store/selectors/LabelsSelector';
import { LabelActions } from '../../../logic/actions/LabelActions';
import { ColorSelectorView } from './ColorSelectorView/ColorSelectorView';
import { Settings } from '../../../settings/Settings';
import { reject, sample, filter, uniq } from 'lodash';
import { ProjectType } from '../../../data/enums/ProjectType';
import { submitNewNotification } from '../../../store/notifications/actionCreators';
import { INotification } from '../../../store/notifications/types';
import { NotificationUtil } from '../../../utils/NotificationUtil';
import { NotificationsDataMap } from '../../../data/info/NotificationsData';
import { Notification } from '../../../data/enums/Notification';
import { StyledTextField } from '../../Common/StyledTextField/StyledTextField';

interface IProps {
    updateActivePopupTypeAction: (activePopupType: PopupWindowType) => any;
    updateLabelNamesAction: (labels: LabelName[]) => any;
    updatePerClassColorationStatusAction: (updatePerClassColoration: boolean) => any;
    submitNewNotificationAction: (notification: INotification) => any;
    isUpdate: boolean;
    projectType: ProjectType;
    enablePerClassColoration: boolean;
}

const InsertLabelNamesPopup: React.FC<IProps> = (
    {
        updateActivePopupTypeAction,
        updateLabelNamesAction,
        updatePerClassColorationStatusAction,
        submitNewNotificationAction,
        isUpdate,
        projectType,
        enablePerClassColoration
    }) => {
    const [labelNames, setLabelNames] = useState(LabelsSelector.getLabelNames());

    const validateEmptyLabelNames = (): boolean => {
        const emptyLabelNames = filter(labelNames, (labelName: LabelName) => labelName.name === '');
        return emptyLabelNames.length === 0;
    };

    const validateNonUniqueLabelNames = (): boolean => {
        const uniqueLabelNames = uniq(labelNames.map((labelName: LabelName) => labelName.name));
        return uniqueLabelNames.length === labelNames.length;
    };

    const callbackWithLabelNamesValidation = (callback: () => any): () => any => {
        return () => {
            if (!validateEmptyLabelNames()) {
                submitNewNotificationAction(NotificationUtil
                    .createErrorNotification(NotificationsDataMap[Notification.EMPTY_LABEL_NAME_ERROR]));
                return;
            }
            if (validateNonUniqueLabelNames()) {
                callback();
            } else {
                submitNewNotificationAction(NotificationUtil
                    .createErrorNotification(NotificationsDataMap[Notification.NON_UNIQUE_LABEL_NAMES_ERROR]));
            }
        };
    };

    const getNextUnusedColor = (): string => {
        const usedColors = labelNames.map((labelName: LabelName) => labelName.color);
        const unusedColor = Settings.LABEL_COLORS_PALETTE.find((color: string) => !usedColors.includes(color));
        return unusedColor || sample(Settings.LABEL_COLORS_PALETTE);
    };

    const addLabelNameCallback = () => {
        const newLabelName = {
            ...LabelUtil.createLabelName(''),
            color: getNextUnusedColor()
        };
        const newLabelNames = [
            ...labelNames,
            newLabelName
        ];
        setLabelNames(newLabelNames);
    };

    const safeAddLabelNameCallback = () => callbackWithLabelNamesValidation(addLabelNameCallback)();

    const deleteLabelNameCallback = (id: string) => {
        const newLabelNames = reject(labelNames, { id });
        setLabelNames(newLabelNames);
    };


    const changeLabelNameColorCallback = (id: string, color: string) => {
        const newLabelNames = labelNames.map((labelName: LabelName) => {
            return labelName.id === id ? { ...labelName, color } : labelName;
        });
        setLabelNames(newLabelNames);
    };

    const onKeyUpCallback = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            safeAddLabelNameCallback();
        }
    };

    const onChange = (id: string, value: string) => {
        const newLabelNames = labelNames.map((labelName: LabelName) => {
            return labelName.id === id ? {
                ...labelName, name: value
            } : labelName;
        });
        setLabelNames(newLabelNames);
    };

    const labelInputs = labelNames.map((labelName: LabelName) => {
        const onChangeCallback = (event: React.ChangeEvent<HTMLInputElement>) =>
            onChange(labelName.id, event.target.value);
        const onDeleteCallback = () => deleteLabelNameCallback(labelName.id);
        const onChangeColorCallback = (color: string) => changeLabelNameColorCallback(labelName.id, color);
        return <div className='LabelEntry' key={labelName.id}>
            <StyledTextField variant='standard'
                id={'key'}
                autoComplete={'off'}
                autoFocus={true}
                type={'text'}
                margin={'dense'}
                label={'Insert label'}
                onKeyUp={onKeyUpCallback}
                value={labelName.name}
                onChange={onChangeCallback}
                style={{ width: 280 }}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            {projectType === ProjectType.OBJECT_DETECTION && enablePerClassColoration && <ColorSelectorView
                color={labelName.color}
                onClick={onChangeColorCallback}
            />}
            <ImageButton
                image={'ico/trash.png'}
                imageAlt={'remove_label'}
                buttonSize={{ width: 30, height: 30 }}
                onClick={onDeleteCallback}
            />
        </div>;
    });


    const onCreateAcceptCallback = () => {
        const nonEmptyLabelNames: LabelName[] = reject(labelNames,
            (labelName: LabelName) => labelName.name.length === 0);
        if (labelNames.length > 0) {
            updateLabelNamesAction(nonEmptyLabelNames);
        }
        updateActivePopupTypeAction(null);
    };

    const safeOnCreateAcceptCallback = () => callbackWithLabelNamesValidation(onCreateAcceptCallback)();

    const onUpdateAcceptCallback = () => {
        const nonEmptyLabelNames: LabelName[] = reject(labelNames,
            (labelName: LabelName) => labelName.name.length === 0);
        const missingIds: string[] = LabelUtil.labelNamesIdsDiff(LabelsSelector.getLabelNames(), nonEmptyLabelNames);
        LabelActions.removeLabelNames(missingIds);
        updateLabelNamesAction(nonEmptyLabelNames);
        updateActivePopupTypeAction(null);
    };

    const safeOnUpdateAcceptCallback = () => callbackWithLabelNamesValidation(onUpdateAcceptCallback)();

    const onCreateRejectCallback = () => {
        updateActivePopupTypeAction(PopupWindowType.LOAD_LABEL_NAMES);
    };

    const onUpdateRejectCallback = () => {
        updateActivePopupTypeAction(null);
    };

    const renderContent = () => {
        return (<div className='InsertLabelNamesPopup'>
            <div className='RightContainer'>
                <div className='Message'>
                    {
                        isUpdate ?
                            'Edit the available annotation labels. Use Add label to add another label below the current list.' :
                            'Before you start, review the available annotation labels. You can add more labels if needed.'
                    }
                </div>
                <div className='LabelsContainer'>
                    {Object.keys(labelNames).length !== 0 ? <>
                        <div className='LabelsScrollArea'>
                            <Scrollbars>
                                <div
                                    className='InsertLabelNamesPopupContent'
                                >
                                    {labelInputs}
                                </div>
                            </Scrollbars>
                        </div>
                        <button
                            type='button'
                            className='AddLabelButton'
                            onClick={safeAddLabelNameCallback}
                        >
                            <img
                                draggable={false}
                                alt={'add_label'}
                                src={'ico/plus.png'}
                            />
                            <span>Add label</span>
                        </button>
                    </> :
                        <div
                            className='EmptyList'
                            onClick={addLabelNameCallback}
                        >
                            <img
                                draggable={false}
                                alt={'upload'}
                                src={'ico/type-writer.png'}
                            />
                            <p className='extraBold'>Your label list is empty</p>
                            <p>Click here to add a label</p>
                        </div>}
                </div>
            </div>
        </div>);
    };

    return (
        <GenericYesNoPopup
            title={isUpdate ? 'Edit labels' : 'Create labels'}
            renderContent={renderContent}
            acceptLabel={isUpdate ? 'Accept' : 'Start project'}
            onAccept={isUpdate ? safeOnUpdateAcceptCallback : safeOnCreateAcceptCallback}
            rejectLabel={isUpdate ? 'Cancel' : 'Load labels from file'}
            onReject={isUpdate ? onUpdateRejectCallback : onCreateRejectCallback}
        />);
};

const mapDispatchToProps = {
    updateActivePopupTypeAction: updateActivePopupType,
    updateLabelNamesAction: updateLabelNames,
    updatePerClassColorationStatusAction: updatePerClassColorationStatus,
    submitNewNotificationAction: submitNewNotification
};

const mapStateToProps = (state: AppState) => ({
    projectType: state.general.projectData.type,
    enablePerClassColoration: state.general.enablePerClassColoration
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(InsertLabelNamesPopup);
