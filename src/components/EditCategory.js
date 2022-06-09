import React from "react"
import { Button } from 'semantic-ui-react'

class EditCategory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            categoryCNname: this.props.catItem.category_cn_name,
            categoryENname: this.props.catItem.category_en_name,
            isMultiple: this.props.catItem.isMultiple,
            totalOptionValues: this.props.catItem.options.map(option=>[option.option_cn_name, option.option_en_name]),
            inputOptionCN: "",
            inputOptionEN: "",
        }
    }
   
    addNewOption = () => {
        if(this.state.inputOptionCN && this.state.inputOptionEN) {
            let combo = []
            combo[0] = this.state.inputOptionCN;
            combo[1] = this.state.inputOptionEN;
            this.setState({
                totalOptionValues: [...this.state.totalOptionValues, combo],
                inputOptionCN: "",
                inputOptionEN: "",
            });
        } else {
            console.log(this.props.catItem)
            alert("需要提供选项的中文和英文!")
        }
    };
    onChangeOption = e => {
        this.setState({
            [e.target.name]: e.target.value,
        })
    };

    submitNewCategory = () => {
        // check if category name is empty and option is empty
        if(this.state.categoryCNname && this.state.categoryENname && this.state.totalOptionValues.length > 0) {
            let categoryObj = {}
            categoryObj['category_id'] = this.props.catItem.category_id;
            categoryObj['category_en_name'] = this.state.categoryENname;
            categoryObj['category_cn_name'] = this.state.categoryCNname;
            categoryObj['isMultiple'] = this.state.isMultiple;
            categoryObj['options'] = this.getOptionsDetails(categoryObj['category_id']);
            // 1. send value to parent as the object structure
            this.props.EditCategoryAtIndex(categoryObj, this.props.editArrayIndex);
            // 3. reset all to empty
            this.setState({
                categoryCNname: "",
                categoryENname: "",
                isMultiple: "0",
                totalOptionValues: [],
                inputOptionCN: "",
                inputOptionEN: "",
            });
            // 4. go back to parent page
            // 5. close popup
            this.props.closePopup(-1, false)
        } else {
            alert("类别名称和选项 不能为空")
        }
    };

    getOptionsDetails = (cat_id) => {
        let optionDetails = []
        let optionsCurr = this.state.totalOptionValues;
        let counter = 1;
        optionsCurr.forEach(item => {
            let optionObj = {
                "category_id": cat_id,
                "option_id": counter + '',
                "option_cn_name": item[0],
                "option_en_name": item[1],
                "key": counter + '',
                "text": item[0],
                "value": item[0] + "###" + item[1]
            }
            counter++;
            optionDetails.push(optionObj);
        })
        return optionDetails;
    };
    deleteOptionByIndex = (arrayIndex) => {
        let prevOptions = [...this.state.totalOptionValues]
        // delete option from array
        prevOptions.splice(arrayIndex, 1)
        this.setState({
            totalOptionValues: prevOptions,
        })
    }
    sendDataToPython = (categoryObj) => {
   
    };

    render() {
        let displaySingle = true;
        if(this.state.isMultiple === '1') {
            displaySingle = false;
        }
        return(
            <div>
                <div style={{marginTop:'10px', marginLeft:'50px'}}>
                    <div>
                            类别名称:
                            <input className="input-text"  type='text' name='categoryCNname' value={this.state.categoryCNname} placeholder='中文名...' onChange={this.onChangeOption} />
                            <input className="input-text" type='text' name='categoryENname' value={this.state.categoryENname} placeholder='英文名...' onChange={this.onChangeOption} />
                    </div>
                    <div style={{marginTop:'10px'}}>
                        <input className="input-text" type="radio" value="0" checked={displaySingle} name="isMultiple" onChange={this.onChangeOption} /> 单选
                        <input className="input-text" type="radio" value="1" checked={!displaySingle} name="isMultiple" onChange={this.onChangeOption} /> 多选
                    </div>
                    <div style={{marginTop:'10px'}}>
                        <Button primary size='tiny' onClick={this.addNewOption}>添加选项</Button>
                        <input 
                            type="text" 
                            className="input-text"
                            placeholder="选项中文..." 
                            name="inputOptionCN"
                            value={this.state.inputOptionCN}
                            onChange={this.onChangeOption}
                        />
                        <input 
                            type="text" 
                            className="input-text"
                            placeholder="选项英文..." 
                            name="inputOptionEN"
                            value={this.state.inputOptionEN}
                            onChange={this.onChangeOption}
                        />
                    </div>
                    <div style={{marginTop:'15px'}}>
                    已添加的选项: &nbsp;&nbsp;
                            {this.state.totalOptionValues.map((item, index) => (
                                <div key={index}><Button basic color='red' size='mini' onClick={()=>this.deleteOptionByIndex(index)}>delete</Button> {item[0]} {item[1]} </div>
                            ))}
                    </div>
                </div>
                <div className='buttonDIV-center'>
                    <Button primary onClick={this.submitNewCategory}>提交类别</Button>
                    <Button color='green' onClick={()=> this.props.closePopup(-1, false)}>关闭</Button>
                </div>
            </div>
        )
    }
}

export default EditCategory