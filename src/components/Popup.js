import React from 'react';  
import './Popup.css';
import EditCategory from './EditCategory';

const Popup = props => {
    return (
        <div className='popup'>
            <div className='popup-inner'>
                <div style={{marginBottom:'20px', marginTop:'20px'}}>
                         <h3 style={{marginLeft: '40%', }}>编辑</h3>
                </div>
                <EditCategory 
                    closePopup={props.closePopup} 
                    catItem={props.catItem} 
                    EditCategoryAtIndex={props.EditCategoryAtIndex}
                    editArrayIndex={props.editArrayIndex}
                />
            </div>
        </div>  
        );  
}

export default Popup;
