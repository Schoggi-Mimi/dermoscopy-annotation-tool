import classNames from 'classnames';
import React, { useState } from 'react';
import ImagesDropZone from './ImagesDropZone/ImagesDropZone';
import './MainView.scss';

const MainView: React.FC = () => {
    const [projectInProgress, setProjectInProgress] = useState(false);
    const [projectCanceled, setProjectCanceled] = useState(false);

    const startProject = () => {
        setProjectInProgress(true);
    };

    const endProject = () => {
        setProjectInProgress(false);
        setProjectCanceled(true);
    };

    const getClassName = () => {
        return classNames(
            'MainView', {
            'InProgress': projectInProgress,
            'Canceled': !projectInProgress && projectCanceled
        }
        );
    };

    return (
        <div className={getClassName()}>
            <div className='Slider' id='lower'>
                <div className='TriangleVertical'>
                    <div className='TriangleVerticalContent' />
                </div>
            </div>

            <div className='Slider' id='upper'>
                <div className='TriangleVertical'>
                    <div className='TriangleVerticalContent' />
                </div>
            </div>

            <div className='LeftColumn'>
                <div className='LogoRow'>
                    <img
                        className='UniLogo'
                        draggable={false}
                        alt='University of Bern logo'
                        src='uni-bern-logo-transparent-vertical.jpg'
                    />
                    <img
                        className='MiaLogo'
                        draggable={false}
                        alt='Medical Image Analysis laboratory logo'
                        src='MIA.png'
                    />
                </div>

                <div className='AuthorSignature'>
                    Choekyel Nyungmartsang
                </div>

                <div className='ThesisIntroWrapper'>
                    <div className='ThesisIntroText'>
                        <h1>Dermoscopy Annotation Tool</h1>
                        <h2>Clinical region annotations for a master&apos;s thesis</h2>
                        <p>
                            This local web tool is used to annotate clinically relevant regions in melanoma dermoscopy images.
                            Images stay in the browser and are not uploaded to a server.
                        </p>
                        <ol>
                            <li>Click <strong>Get Started</strong>.</li>
                            <li>Upload the dermoscopy images.</li>
                            <li>Start region annotation and draw polygon regions.</li>
                            <li>Export the masks and CSV summary when finished.</li>
                        </ol>
                    </div>
                </div>

                <div className='TriangleVertical'>
                    <div className='TriangleVerticalContent' />
                </div>

                {projectInProgress && <div className='BackPanel' onClick={endProject}>
                    <span>Go Back</span>
                </div>}
            </div>

            <div className='RightColumn'>
                <ImagesDropZone />
                {!projectInProgress && <div className='StartPanel' onClick={startProject}>
                    <span>Get Started</span>
                </div>}
            </div>
        </div>
    );
};

export default MainView;
