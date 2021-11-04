import React from 'react';

import TronLinkLogo from './TronLinkLogo.png';


const WEBSTORE_URL = 'https://metamask.io/download.html';

const logo = (
    <div className='col-sm-4 text-center'>
        <img src={ TronLinkLogo } className="img-fluid" alt='TronLink logo' />
    </div>
);

const openTronLink = (url) => {
    window.open(url, '_blank');
};

const TronLinkGuide = props => {
    const {
        installed = false
    } = props;

    var link = window.location.href;

    if(!installed) {
        return (
            <div className="container">
                <div className='row' onClick={ () => openTronLink(WEBSTORE_URL) } style={{'paddingTop': '7em','color': 'black','textDecoration': 'none'}}>
                    <div className='col-sm-8 bg-secondary text-white'>
                        <h1>Install Metamask</h1>
                        <p>
                            To create a post or tip others you must install Metamask. Metamask is a wallet that you can download at <a href={ WEBSTORE_URL } target='_blank' rel='noopener noreferrer'></a>.
                            Once installed, go back and refresh the page.
                        </p>
                    </div>
                    { logo }
                </div>
            </div>
        );
    }

    return (
    
        <div className="container" onClick={ () => openTronLink(link) }>

        <div className='tronLink row' style={{'paddingTop': '7em','color': 'black','textDecoration': 'none'}}>

            <div className='info col-sm-8 bg-secondary text-white'>
                <h1>Requires Login</h1>
                <p>
                Metamask is installed but log in first. Open Metamask in the browser bar and configure your first wallet or unlock an already created wallet.
                </p>
            </div>
            { logo }
        </div>
        </div>
    );
};

export default TronLinkGuide;
