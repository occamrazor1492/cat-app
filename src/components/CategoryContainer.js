import React from "react"
import CategoryItem from "./CategoryItem"
import AddCategory from "./AddCategory"
import "./CategoryContainer.css"
import 'semantic-ui-css/semantic.min.css'
import { Button } from 'semantic-ui-react'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import Popup from "./Popup"

const PLACE_HOLDER = "###"

// reorder items of dragble
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };
  const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    width: '80%',
    marginLeft: '10%',
    height: 200,
    // change background colour if dragging
    background: isDragging ? "lightgreen" : "white",
   // styles we need to apply on draggables
   ...draggableStyle
  });


class CategoryContainer extends React.Component {
    constructor(props) {
        super(props);
        this.textAreaRefEN = React.createRef();
        this.textAreaRefCN = React.createRef();
        this.onDragEnd = this.onDragEnd.bind(this);
    };
    state = {
        categoryWithOptions: [],
        selectedOptions: [],
        outputENnames: '',
        outputCNnames: '',
        displayOutput: true,
        max_cat_id: 0,
        copySuccessEN:'',
        copySuccessCN:'',
        showPopup: false,
        editArrayIndex: '0',
    };

    componentDidMount() {
           // get data from python
           fetch('/data_combo').then(res => res.json()).then(data => {
            this.setState({
                categoryWithOptions: data.data_combo,
                max_cat_id: data.max_cat_id,
            })
            console.log(data.data_combo)
          });  
    };

    updateSelected = (selected, categoryID, categoryIndex) => {
        let tempSelect = {}
        let oldSelected = [...this.state.selectedOptions]
        // check if category_id already exists:
        tempSelect['category_id'] = categoryID;
        tempSelect['category_index'] = categoryIndex;
        let en_names = [];
        let cn_names = [];
        selected.forEach(item => {
            let names = item.split(PLACE_HOLDER);
            cn_names.push(names[0]);
            en_names.push(names[1]);
        });
        tempSelect['option_en_name'] = en_names;
        tempSelect['option_cn_name'] = cn_names;
        // if obj already in array, do not push
        let position = oldSelected.findIndex((item) => item['category_index'] === categoryIndex);
        if(position === -1) {
            oldSelected.push(tempSelect);
        } else {
            oldSelected[position] = tempSelect;
        }
        console.log('selected: ', oldSelected);
        this.setState({
            selectedOptions: oldSelected,
        })
    };

    addNewCategoryWithOption = (data) => {
        this.setState({
            categoryWithOptions: [...this.state.categoryWithOptions, data],
        })
    };
    EditCategoryAtIndex = (data, index) => {
        console.log('in parent')
        if(index >= 0) {
            let tempItems = [...this.state.categoryWithOptions]
            tempItems[index] = data
            this.setState({
                categoryWithOptions: tempItems,
            })
            // send new data to python
            this.sendReWriteDataToPython(tempItems)
        }
    }

    copyToClipboard1 = (element) => {
        const node = element.current;
        node.select();
        document.execCommand('copy');
        node.focus();
        this.setState({ copySuccessEN: '复制成功!' });
        setTimeout(() => {
            this.setState({ copySuccessEN: '' });
        }, 3000);
    };
    copyToClipboard2 = (element) => {
        const node = element.current;
        node.select();
        document.execCommand('copy');
        node.focus();
        this.setState({ copySuccessCN: '复制成功!' });
        setTimeout(() => {
            this.setState({ copySuccessCN: '' });
        }, 3000);

    };
    generateOutputAsString = () => {
        console.log("generate output");
        console.log(this.state.selectedOptions);

        // 1. re-order by array index
        let selectedOptionsCopy = [...this.state.selectedOptions];
        selectedOptionsCopy.sort(function(a, b) {
            return a['category_index'] - b['category_index'];
        });
        // 2. always put first category in the end
        let outputCNnames = '';
        let outputENnames = '';
        // check if first category is master category
        if(selectedOptionsCopy.length > 0) {
            for(let startIndex = 0 ; startIndex < selectedOptionsCopy.length; startIndex++) {
                let currentObj = selectedOptionsCopy[startIndex];
                let cnNames = currentObj['option_cn_name'];
                let enNames = currentObj['option_en_name'];
                 // 3. check if any of subarray is empty
                 if(cnNames.length > 0) {
                    outputCNnames += cnNames.join(' ') + ' ';
                    outputENnames += enNames.join(' ') + ' ';
                 }
            }
        }
        this.setState({
            displayOutput: true,
            outputCNnames: outputCNnames,
            outputENnames: outputENnames,
        })
    };
    refreshPage = () => {
        window.location.reload();
    };

    // drag drop functions
    onDragEnd(result) {
         // dropped outside the list
        if (!result.destination) {
            return;
        }
        if(result.destination.index === result.source.index) {
            return;
        }

        const items = reorder(
            this.state.categoryWithOptions,
            result.source.index,
            result.destination.index
        );
    
        this.setState({
            categoryWithOptions: items,
        });

        // send data to python update
        this.sendReWriteDataToPython(items);
        this.refreshPage();
    };
    sendReWriteDataToPython = (items) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data_combo: items })
        };
        fetch('/update', requestOptions)
            .then(response => response.json())
            .then(data => console.log(data));
    };
    deleteCategoryByIndex = (arrayIndex)=>{
        console.log("delete", arrayIndex)
        let prevCatWithOptions = [...this.state.categoryWithOptions]
        prevCatWithOptions.splice(arrayIndex, 1)
        // check if this deleted category has options been selected
        //selectedOptions
        let oldSelected = [...this.state.selectedOptions]
        let position = oldSelected.findIndex((item) => item['category_index'] === arrayIndex);
        if(position > -1) {
            oldSelected.splice(position, 1);
            // update selected
            this.setState({
                selectedOptions: oldSelected,
            })
        } 

        this.setState({
            categoryWithOptions: prevCatWithOptions,
        })
        this.sendReWriteDataToPython(prevCatWithOptions)
    };
    addCatPopup = (arrayIndex, showPopup) => {
        this.setState({
            showPopup: showPopup,
            editArrayIndex: arrayIndex,
        })
    };

    render() {
        let enOutput = '';
        let cnOutput = '';
        if(this.state.displayOutput) {
            enOutput = this.state.outputENnames;
            cnOutput = this.state.outputCNnames;
        }
        return (
            <div>
                <div>
                    <DragDropContext onDragEnd={this.onDragEnd}>
                        <Droppable droppableId="droppable">
                        {(provided, snapshot) => (
                            <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            >
                            {this.state.categoryWithOptions.map((category, index) => (
                                <Draggable key={index} draggableId={index + ""} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={getItemStyle(
                                        snapshot.isDragging,
                                        provided.draggableProps.style
                                      )}
                                    >
                                        <CategoryItem category={category} categoryIndex={index} updateSelected={this.updateSelected} key={index} />
                                        <Button color='green' onClick={()=> this.addCatPopup(index, true)}>Edit</Button>
                                        <Button color='red' onClick={()=>this.deleteCategoryByIndex(index)}>Delete</Button>
                                    </div>
                                )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                            </div>
                        )}
                        </Droppable>
                    </DragDropContext>
                </div>
                <div className="cg-container">

                        {/* {this.state.categoryWithOptions.map((category, index) => (
                            <CategoryItem category={category} categoryIndex={index} updateSelected={this.updateSelected} key={index} />
                        ))} */}

                        <AddCategory max_cat_id={this.state.max_cat_id} addNewCategoryWithOption={this.addNewCategoryWithOption} />
                        <div className="cg-footer">
                            <div>
                                <div style={{textAlign:"center", marginTop:'3px'}}>
                                    <h3>最终结果</h3>
                                </div>
                                <div style={{marginLeft:"20px"}}>
                                        <p>英文</p>
                                        <textarea ref={this.textAreaRefEN} rows={2} cols={60} value={enOutput} readOnly></textarea>
                                        <div>
                                            <Button onClick={()=>this.copyToClipboard1(this.textAreaRefEN)}>复制到剪贴板</Button>
                                            {this.state.copySuccessEN}
                                        </div>
                                        <p>中文</p>
                                        <textarea ref={this.textAreaRefCN} rows={2} cols={60} value={cnOutput} readOnly></textarea>
                                        <div>
                                            <Button onClick={()=>this.copyToClipboard2(this.textAreaRefCN)}>复制到剪贴板</Button>
                                            {this.state.copySuccessCN}
                                        </div>
                                </div>
                                
                            </div>
                            <div className='buttonDIV-center'>
                                <Button primary onClick={this.generateOutputAsString}>生成结果</Button>
                            </div>
                            <div className='buttonDIV-center'>
                                <Button primary onClick={this.refreshPage}>刷新</Button>
                            </div>
                        </div>
                </div>
                <div>
                    { this.state.showPopup ?
                        <Popup
                            closePopup={this.addCatPopup}
                            catItem={this.state.categoryWithOptions[this.state.editArrayIndex]}
                            EditCategoryAtIndex={this.EditCategoryAtIndex}
                            editArrayIndex={this.state.editArrayIndex}
                        />
                        : null
                    }
              </div>
            </div>
        )
    }
}
export default CategoryContainer