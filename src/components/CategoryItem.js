import React from "react"
import { Dropdown } from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css'

const CategoryItem = props => {

    const handleSelectChange = (event, data) => {
        let selected = data.value;
        if(!Array.isArray(selected)) {
            let temp = [];
            temp.push(selected);
            selected = temp;
        }
        console.log(selected.length)
        props.updateSelected(selected, props.category.category_id, props.categoryIndex);
    };

    let selectionType = "单选";
    let dropdownCompo =  <Dropdown
                                placeholder="下拉菜单..."
                                fluid
                                selection
                                openOnFocus={false}
                                onChange={handleSelectChange}
                                scrolling
                                options={props.category.options}
                            />
    if(props.category.isMultiple === "1") {
        selectionType = "多选";
        dropdownCompo = 
                            <Dropdown
                                placeholder="下拉菜单..."
                                fluid
                                multiple
                                selection
                                openOnFocus={false}
                                onChange={handleSelectChange}
                                scrolling
                                options={props.category.options}
                            />
        }
    return (
            <div className="cg-item">
                <div style={{textAlign:"center", marginTop:'20px'}}>
                    <h3 style={{marginTop:'15px'}}>类别名称: {props.category.category_cn_name}</h3>
                    <p>({selectionType})</p>
                </div>
                <div>
                    <div className="cg-dropdown">
                       {dropdownCompo}
                    </div>
                </div>
            </div>
        )
}


export default CategoryItem