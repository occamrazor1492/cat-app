from flask import Flask, request
import csv

app = Flask(__name__)
PLACE_HOLDER = "###"
CAT_FILE_PATH = './data/cat_table.csv'
OPTION_FILE_PATH = './data/option_table.csv'

@app.route('/data_combo', methods = ['GET', 'POST'])
def get_data_combo():
    if request.method == 'GET':
        cat_data = readCSV_as_json_array(CAT_FILE_PATH)
        max_cat_id = get_max_category_id(cat_data)
        option_data = readCSV_as_json_array(OPTION_FILE_PATH)
        output = combine_data(cat_data, option_data)
        return {'data_combo': output, 'max_cat_id': max_cat_id}
    elif request.method == 'POST':
        request_data = request.get_json()
        categoryCombo = request_data['category']
        cat_data = [categoryCombo['category_id'], categoryCombo['category_en_name'],categoryCombo['category_cn_name'],categoryCombo['isMultiple']]
        append_to_csv(CAT_FILE_PATH, cat_data)
        write_options_csv(categoryCombo)
        return {'status': 'ok'}
    else:
        return {'error': 'method not supported'}    
@app.route('/update', methods=['POST'])
def update_data_combo():
    if request.method == 'POST':
        request_data = request.get_json()
        catComboArray = request_data['data_combo']
        cat_array = []
        # add category name first
        cat_header = ['category_id','category_en_name','category_cn_name','isMultiple']
        cat_array.append(cat_header)
        option_array = []
        # add options header
        option_header = ['category_id','option_id','option_cn_name','option_en_name']
        option_array.append(option_header)
        for categoryCombo in catComboArray:
            cat_data = [categoryCombo['category_id'], categoryCombo['category_en_name'],categoryCombo['category_cn_name'],categoryCombo['isMultiple']]
            cat_array.append(cat_data)
            options_data = categoryCombo['options']
            for option in options_data:
                optionData = [option['category_id'], option['option_id'], option['option_cn_name'], option['option_en_name']]
                option_array.append(optionData)
        update_from_array(CAT_FILE_PATH, cat_array)
        update_from_array(OPTION_FILE_PATH, option_array)
        return {'status': 'ok'}
    else:
        return {'error': 'method not supported'}    

def get_max_category_id(cat_data):
    max_id = 0
    for cat in cat_data:
        current_id = int(cat['category_id'])
        if current_id > max_id:
            max_id = current_id
    return max_id

def readCSV_as_json_array(csvFilePath):
    data = []
    with open(csvFilePath, encoding='utf-8') as csvf:
        csvReader = csv.DictReader(csvf)
        for rows in csvReader:
            data.append(rows)
    return data
      
def combine_data(cat_data, option_data):
    for i in range(len(cat_data)):
        categoryID = cat_data[i]['category_id']
        optionArray = list(filter(lambda item: (item['category_id'] == categoryID), option_data))
        for j in range(len(optionArray)):
            optionArray[j]['key'] = optionArray[j]['option_id']
            optionArray[j]['text'] = optionArray[j]['option_cn_name']
            optionArray[j]['value'] = optionArray[j]['option_cn_name'] + PLACE_HOLDER + optionArray[j]['option_en_name']
        cat_data[i]['options'] = optionArray
    return cat_data

def update_from_array(csvFilePath, dataArray):
    with open(csvFilePath, 'w') as f_object:
        writer_object = csv.writer(f_object)
        for row in dataArray:
            writer_object.writerow(row)

def append_to_csv(csvFilePath, data):
    with open(csvFilePath, 'a') as f_object:
        writer_object = csv.writer(f_object)
        writer_object.writerow(data)

def write_options_csv(categoryCombo):
    options = categoryCombo['options']
    for option in options:
        optionData = [option['category_id'], option['option_id'], option['option_cn_name'], option['option_en_name']]
        append_to_csv(OPTION_FILE_PATH, optionData)