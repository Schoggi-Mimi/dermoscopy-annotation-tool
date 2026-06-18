import React, {useState} from 'react';
import './ColorSelectorView.scss'
import {Settings} from '../../../../settings/Settings';

interface IProps {
    color: string;
    onClick: (color: string) => any;
}

export const ColorSelectorView: React.FC<IProps> = ({color, onClick}) => {
    const [isOpen, setIsOpen] = useState(false);

    const onSelectColor = (selectedColor: string) => {
        onClick(selectedColor);
        setIsOpen(false);
    };

    return <div className={'ColorSelectorView'}>
        <div
            className={'ColorSelectorButton'}
            style={{backgroundColor: color}}
            onClick={(event) => {
                event.stopPropagation();
                setIsOpen(!isOpen);
            }}
        >
            <img
                draggable={false}
                alt={'change color'}
                src={'ico/bucket.png'}
            />
        </div>
        {isOpen && <div className={'ColorPalette'}>
            {Settings.LABEL_COLORS_PALETTE.map((paletteColor: string) => <button
                key={paletteColor}
                type={'button'}
                className={'ColorPaletteOption'}
                style={{backgroundColor: paletteColor}}
                onClick={(event) => {
                    event.stopPropagation();
                    onSelectColor(paletteColor);
                }}
            />)}
        </div>}
    </div>
}
