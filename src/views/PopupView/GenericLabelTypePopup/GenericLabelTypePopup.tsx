import React, {useState} from 'react'
import './GenericLabelTypePopup.scss'
import {LabelType} from '../../../data/enums/LabelType'
import {AppState} from '../../../store'
import {connect} from 'react-redux'
import {ImageButton} from '../../Common/ImageButton/ImageButton'
import {GenericYesNoPopup} from '../GenericYesNoPopup/GenericYesNoPopup'
import {ILabelToolkit, LabelToolkitData} from '../../../data/info/LabelToolkitData'
import {ProjectType} from '../../../data/enums/ProjectType'

interface IProps {
    title: string
    activeLabelType: LabelType
    projectType: ProjectType
    allowedLabelTypes?: LabelType[]
    onLabelTypeChange?: (labelType: LabelType) => any
    acceptLabel: string
    onAccept: (labelType: LabelType) => any
    skipAcceptButton?: boolean
    disableAcceptButton?: boolean
    rejectLabel: string
    onReject: (labelType: LabelType) => any
    renderInternalContent: (labelType: LabelType) => any
}

const GenericLabelTypePopup: React.FC<IProps> = (
    {
        title,
        activeLabelType,
        projectType,
        allowedLabelTypes,
        onLabelTypeChange,
        acceptLabel,
        onAccept,
        skipAcceptButton,
        disableAcceptButton,
        rejectLabel,
        onReject,
        renderInternalContent
    }) => {

    const [labelType, setLabelType] = useState(activeLabelType)

    const getSidebarLabels = (): ILabelToolkit[] => {
        const labels = LabelToolkitData.filter((label: ILabelToolkit) => {
            const isCorrectProject = label.projectType === projectType
            const isAllowed = !allowedLabelTypes || allowedLabelTypes.includes(label.labelType)

            return isCorrectProject && isAllowed
        })

        if (!allowedLabelTypes) {
            return labels
        }

        return allowedLabelTypes
            .map((allowedLabelType: LabelType) => labels.find((label: ILabelToolkit) => label.labelType === allowedLabelType))
            .filter((label: ILabelToolkit | undefined) => !!label) as ILabelToolkit[]
    }

    const getSidebarButtons = () => {
        return getSidebarLabels()
            .map((label: ILabelToolkit) => {
                return <ImageButton
                    key={label.labelType}
                    image={label.imageSrc}
                    imageAlt={label.imageAlt}
                    buttonSize={{width: 40, height: 40}}
                    padding={20}
                    onClick={() => {
                        setLabelType(label.labelType)
                        onLabelTypeChange && onLabelTypeChange(label.labelType)
                    }}
                    isActive={labelType === label.labelType}
                />
            })
    }

    const renderContent = () => {
        return (
            <div className='GenericLabelTypePopupContent'>
                <div className='LeftContainer'>
                    {getSidebarButtons()}
                </div>
                <div className='RightContainer'>
                    {renderInternalContent(labelType)}
                </div>
            </div>
        )
    }

    return(
        <GenericYesNoPopup
            title={title}
            renderContent={renderContent}
            acceptLabel={acceptLabel}
            onAccept={() => onAccept(labelType)}
            skipAcceptButton={skipAcceptButton}
            disableAcceptButton={disableAcceptButton}
            rejectLabel={rejectLabel}
            onReject={() => onReject(labelType)}
        />
    )
}

const mapDispatchToProps = {}

const mapStateToProps = (state: AppState) => ({
    projectType: state.general.projectData.type
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GenericLabelTypePopup)