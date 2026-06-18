import React, {useState} from 'react';
import classNames from 'classnames'
import './DropDownMenu.scss';
import {DropDownMenuData, DropDownMenuNode} from '../../../../data/info/DropDownMenuData';
import {EventType} from '../../../../data/enums/EventType';
import {updatePreventCustomCursorStatus} from '../../../../store/general/actionCreators';
import {AppState} from '../../../../store';
import {connect} from 'react-redux';
import {PolygonLabelsExporter} from '../../../../logic/export/polygon/PolygonLabelsExporter';
import {AnnotationFormatType} from '../../../../data/enums/AnnotationFormatType';

interface IProps {
    updatePreventCustomCursorStatusAction: (preventCustomCursor: boolean) => any;
}

const DropDownMenu: React.FC<IProps> = ({updatePreventCustomCursorStatusAction}) => {
    const topAnchor = 35;

    const [activeTabIdx, setActiveTabIdx] = useState(null);
    const [activeDropDownAnchor, setDropDownAnchor] = useState(null);
    const visibleDropDownMenuData: DropDownMenuNode[] = DropDownMenuData
        .filter((data: DropDownMenuNode) => data.name !== 'Community');

    const onTabClick = (tabIdx: number, event) => {
        if (activeTabIdx === null) {
            document.addEventListener(EventType.MOUSE_DOWN, onMouseDownBeyondDropDown);
        }

        if (activeTabIdx === tabIdx) {
            setActiveTabIdx(null);
            setDropDownAnchor(null);
        } else {
            setActiveTabIdx(tabIdx);
            setDropDownAnchor({x: event.target.offsetLeft, y: topAnchor});
        }
    }

    const onMouseEnterWindow = (event) => {
        updatePreventCustomCursorStatusAction(true);
    }

    const onMouseLeaveWindow = (event) => {
        updatePreventCustomCursorStatusAction(false);
    }

    const onMouseDownBeyondDropDown = (event) => {
        if (event.target.classList.contains('DropDownMenuTab') || event.target.classList.contains('DropDownMenuContentOption')) {
            return;
        }
        setActiveTabIdx(null);
        document.removeEventListener(EventType.MOUSE_DOWN, onMouseDownBeyondDropDown);
    }

    const onMouseEnterTab = (tabIdx: number, event) => {
        if (activeTabIdx !== null && activeTabIdx !== tabIdx) {
            setActiveTabIdx(tabIdx);
            setDropDownAnchor({x: event.target.offsetLeft, y: topAnchor});
        }
    }

    const getDropDownMenuTabClassName = (tabIdx: number) => {
        return classNames(
            'DropDownMenuTab',
            {'active': tabIdx === activeTabIdx}
        );
    };

    const getDropDownMenuContentOption = (disabled: boolean) => {
        return classNames(
            'DropDownMenuContentOption',
            {'active': !disabled}
        );
    }

    const getVisibleChildren = (data: DropDownMenuNode): DropDownMenuNode[] => {
        if (data.name !== 'Actions') return data.children;

        return data.children.filter((element: DropDownMenuNode) =>
            element.name === 'Edit Labels' ||
            element.name === 'Import Images' ||
            element.name === 'Export Annotations'
        );
    }

    const getOptionOnClick = (element: DropDownMenuNode): (() => void) => {
        if (element.name === 'Export Annotations') {
            return () => PolygonLabelsExporter.export(AnnotationFormatType.PNG_MASK);
        }

        return element.onClick;
    }

    const getDropDownContent = () => {
        return visibleDropDownMenuData.map((data: DropDownMenuNode, index: number) => getDropDownTab(data, index))
    }

    const wrapOnClick = (onClick?: () => void, disabled?: boolean): () => void => {
        return () => {
            if (!!disabled) return;
            if (!!onClick) onClick();
            setActiveTabIdx(null);
            updatePreventCustomCursorStatusAction(false);
            document.removeEventListener(EventType.MOUSE_DOWN, onMouseDownBeyondDropDown);
        }
    }

    const getDropDownTab = (data: DropDownMenuNode, index: number) => {
        return <div
            className={getDropDownMenuTabClassName(index)}
            key={index}
            onClick={(event) => onTabClick(index, event)}
            onMouseEnter={(event) => onMouseEnterTab(index, event)}
        >
            <img
                draggable={false}
                src={data.imageSrc}
                alt={data.imageAlt}
            />
            {data.name}
        </div>
    }

    const getDropDownWindow = (data: DropDownMenuNode) => {
        if (activeTabIdx !== null && !!data) {
            const visibleChildren: DropDownMenuNode[] = getVisibleChildren(data);
            const style: React.CSSProperties = {
                top: 35,
                left: activeDropDownAnchor.x,
                height: 40 * visibleChildren.length + 10
            }
            return <div
                className={'DropDownMenuContent'}
                style={style}
                onMouseEnter={onMouseEnterWindow}
                onMouseLeave={onMouseLeaveWindow}
            >
                {visibleChildren.map((element: DropDownMenuNode, index: number) => {
                    return <div className={getDropDownMenuContentOption(element.disabled)}
                        onClick={wrapOnClick(getOptionOnClick(element), element.disabled)}
                        key={index}
                    >
                        <div className='Marker'/>
                        <img src={element.imageSrc} alt={element.imageAlt}/>
                        {element.name}
                    </div>})}
            </div>
        } else {
            return null;
        }
    }

    return(<div className='DropDownMenuWrapper'>
        <>
            {getDropDownContent()}
            {activeTabIdx !== null && getDropDownWindow(visibleDropDownMenuData[activeTabIdx])}
        </>
    </div>)
}

const mapDispatchToProps = {
    updatePreventCustomCursorStatusAction: updatePreventCustomCursorStatus,
};

const mapStateToProps = (state: AppState) => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DropDownMenu);
