$(document).ready(function () {
    var firstListItem = $('header ul li').first();
    handleNavClick(firstListItem);
    let _fieldName = '';

    $(document).on('click', 'header ul li', function () {
        handleNavClick(this);
    });

    $('#fieldTypeSelect').on('change', function () {
        // Hide all field type divs
        $('.field-type-text, .field-type-date, .field-type-radio, .field-type-select, .field-type-checkbox').hide();

        // Show the selected field type div
        var selectedType = $(this).val();
        $('.field-type-' + selectedType).fadeIn(200);
    });

    // Trigger change event on page load to show the correct field
    $('#fieldTypeSelect').trigger('change');

    /* CLICK EVENTS */
    $(document).on('click', 'button[data-bs-target="#fieldConditionModal"]', function () {
        removeData('conditionForm');
        populateFieldCondition();
        $('#addConditionForm')[0].reset();
        $('#createFieldConditionForm')[0].reset();
    });

    $(document).on('click', '#addFieldConditionBtn', function (event) {
        event.preventDefault();

        var dataKey = getDataKey();

        var formDataJSON = saveFieldFormData('#createFieldConditionForm');
        var conditionJSON = getData('conditionForm');
        formDataJSON.field_condition = JSON.parse(conditionJSON);

        addData(formDataJSON, dataKey);
        removeData("conditionForm");

        var data = getData(dataKey);

        updateCodeBlock(data);
        updateFieldView(dataKey);

        $('#fieldConditionModal').modal('hide');
    });

    $(document).on('click', '#addConditionBtn', function (event) {
        event.preventDefault();

        var formDataJSON = saveFieldFormData('#addConditionForm');
        addData(formDataJSON, "conditionForm");

        $('#addConditionForm')[0].reset();
        populateFieldCondition();
    });

    $(document).on('click', '#importBtn', function () {
        $('#fileInput').click();
    });

    $(document).on('click', '#downloadBtn', function () {
        var dataKey = getDataKey();
        var data = getData(dataKey);

        // Prompt the user for the filename
        var filename = prompt("Enter the filename (without extension):", "data");
        if (filename === null || filename.trim() === "") {
            alert("Invalid filename. Download canceled.");
            return;
        }

        var blob = new Blob([data], { type: 'application/json' });

        var a = document.createElement('a');
        var url = URL.createObjectURL(blob);
        a.href = url;
        a.download = filename + '.json';

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    $(document).on('click', 'i[data-action="delete"]', function () {
        var $fieldCard = $(this).closest('li.field-card');
        var id = $fieldCard.data('id');

        $fieldCard.remove();

        var dataKey = getDataKey();

        var storedData = localStorage.getItem(dataKey);
        var formDataArray = storedData ? JSON.parse(storedData) : [];
        formDataArray.splice(id, 1);

        localStorage.setItem(dataKey, JSON.stringify(formDataArray));

        data = getData(dataKey);

        updateFieldView(dataKey);
        updateCodeBlock(data);
    });

    $(document).on('click', 'i[data-action="edit"]', function () {
        var $fieldCard = $(this).closest('li.field-card');
        var itemId = $fieldCard.data('id');

        $('#fieldItemId').val(itemId);

        var dataKey = getDataKey();

        var storedData = localStorage.getItem(dataKey);
        var formDataArray = storedData ? JSON.parse(storedData) : [];

        // Split itemId into array of indices
        var itemIdArray = itemId.toString().split('-').map(function (item) {
            return parseInt(item); // Convert each index to integer
        });

        // Navigate through nested data using itemIdArray indices
        var data = formDataArray;
        for (var i = 0; i < itemIdArray.length; i++) {
            data = data[itemIdArray[i]];
            if (!data) {
                console.error('Item not found in formDataArray');
                return; // Exit if data is undefined
            }
        }

        _fieldName = data.input_type;

        // Example of updating modal with formDataItem
        $.each(data, function (name, value) {
            if (typeof value === 'boolean') {
                // Checkboxes
                $('input[type="checkbox"][name="' + name + '"]').prop('checked', value);
                $('input[type="hidden"][name="' + name + '"]').remove(); // Remove any hidden inputs
            } else if (Array.isArray(value)) {
                $('textarea[name="' + name + '"]').val(value.join('\r\n'));
            } else {
                // Other input types (text, number, etc.)
                $('input[name="' + name + '"]').val(value);
            }
        });

        $('#addFieldBtn').hide();
        $('#updateFieldBtn').show();
        if (dataKey === 'checkout_form_data') {
            $('#fieldModal').modal('show');
        } else {
            $('#fieldConditionModal').modal('show');
        }

        if (data.input_type) {
            updateModal(data.input_type.toUpperCase());
        }


        populateFieldCondition(itemIdArray[0]);
    });

    $(document).on('click', 'button[data-bs-target="#fieldModal"]', function () {
        $('#addFieldBtn').show();
        $('#updateFieldBtn').hide();
        _fieldName = $(this).text();
        updateModal(_fieldName);
    });

    $(document).on('click', '#resetBtn', function (event) {
        var dataKey = getDataKey();

        localStorage.setItem(dataKey, []);
        updateCodeBlock('');
        updateFieldView(dataKey);
    });

    $(document).on('click', '#addFieldBtn', function (event) {
        event.preventDefault();

        var formDataJSON = saveFieldFormData('#createFieldForm');

        var dataKey = getDataKey();

        addData(formDataJSON, dataKey);
        var data = getData(dataKey);

        updateCodeBlock(data);
        updateFieldView(dataKey);

        $('#createFieldForm')[0].reset();
        $('#fieldModal').modal('hide');
    });

    $(document).on('click', '#updateFieldBtn', function (event) {
        event.preventDefault();

        var formDataJSON = saveFieldFormData('#createFieldForm');
        var itemId = $('#fieldItemId').val();

        var dataKey = getDataKey();

        updateData(itemId, formDataJSON);

        data = getData(dataKey);

        updateCodeBlock(data);
        updateFieldView(dataKey);

        $('#createFieldForm')[0].reset();
        $('#fieldModal').modal('hide');
    });

    $(document).on('click', '#loginBinbotBtn', function (event) {
        event.preventDefault();

        var data = $('#loginForm').serialize();
        $('#loginModal').modal('hide');

        var dataKey = getDataKey();

        $.ajax({
            url: '/Home/LoginBinbot',
            type: 'POST',
            data: data,
            success: function (response) {
                var queryString = $('#requestInput').val();

                var [requestPart, queryPart] = queryString.split('?');
                var queryParams = parseQueryString(queryPart);

                var requestData = {};
                Object.keys(queryParams).forEach(function (key) {
                    requestData[key] = queryParams[key];
                });

                var data = {
                    request: requestPart,
                    requestData: JSON.stringify(requestData),
                };
                data.jsonData = getData(dataKey);

                console.log(response);

                $.ajax({
                    url: '/Home/RunScript',
                    type: 'POST',
                    data: data,
                    success: function (response) {
                        console.log(response);
                    },
                    error: function () {
                        console.log("error");
                    }
                });
            },
            error: function () {
                alert("An error occurred while processing your request. Please try again.");
            }
        });
    });

    /* CHANGE EVENTS */
    $(document).on('change', 'input[type="checkbox"]', function () {
        $(this).closest('label').next('div').find('input[type="text"]').prop('disabled', !this.checked);
    });
    $(document).on('change', '#fileInput', function (event) {
        const fileInput = $(this);
        const file = event.target.files[0];

        if (file && file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = function (e) {
                const jsonData = JSON.parse(e.target.result);
                handleJsonData(jsonData);

                fileInput.val('');
            };
            reader.readAsText(file);
        } else {
            alert('Please select a valid JSON file.');
            fileInput.val('');
        }
    });

    $("ul, li").disableSelection();

    $('#fieldModal').on('hidden.bs.modal', function () {
        $('#properties-tab').tab('show');
        $('#createFieldForm')[0].reset();
    });

    $('.field-card-container').sortable({
        revert: true,
        update: function (event, ui) {
            var droppedItem = ui.item; // Get the dropped item
            var currentIndex = droppedItem.attr('data-id'); // Get the data-id of the dropped item

            // Find the previous sibling of the dropped item
            var prevSibling = droppedItem.prev();
            var targetIndex = (prevSibling.length > 0) ? prevSibling.attr('data-id') : 0;

            var dataKey = getDataKey();

            var data = JSON.parse(getData(dataKey)); // Assuming getData() retrieves your JSON data
            console.log("Before sorting:", data);
            sortJsonData(data, currentIndex, targetIndex); // Function to sort JSON data
            console.log("After sorting:", data);

            localStorage.setItem(dataKey, JSON.stringify(data));
        }
    });

    function saveFieldFormData(formId) {
        $(formId + ' input[type=checkbox]').each(function () {
            var checkbox = $(this);
            var checkboxName = checkbox.attr('name');
            var hiddenInput = $('input[type=hidden][name="' + checkboxName + '"]');

            if (checkbox.is(':checked')) {
                hiddenInput.remove();
            } else {
                if (hiddenInput.length === 0) {
                    // Create hidden input if it doesn't exist
                    hiddenInput = $('<input>').attr({
                        type: 'hidden',
                        name: checkboxName
                    }).appendTo(formId);
                }
                hiddenInput.val('off');
            }
        });


        var formDataArray = $(formId).serializeArray();
        var formDataJSON = {};


        $.each(formDataArray, function () {
            if (!this.value) {
                formDataJSON[this.name] = false;
            } else if (this.value === 'on') {
                formDataJSON[this.name] = true;
            } else if (this.value === 'off') {
                formDataJSON[this.name] = false;
            } else {
                // Check if the value contains newline characters
                if (this.value.includes('\r\n') || this.value.includes('\n') || this.value.includes('\r')) {
                    // Split the value into an array by newline characters and filter out empty strings
                    formDataJSON[this.name] = this.value.split(/\r\n|\n|\r/).filter(function (line) {
                        return line.trim() !== '';
                    });
                } else {
                    formDataJSON[this.name] = this.value;
                }
            }
        });

        if (formId === '#createFieldForm') {
            formDataJSON.input_type = _fieldName;
        }

        return formDataJSON;
    }

});

function populateFieldCondition(index = 0) {
    var dataKey = getDataKey();
    if (dataKey != 'field_condition_data') {
        return;
    }
    var data = getData("conditionForm");
    var jsonData = JSON.parse(data);

    $('.field-conditions').empty();

    if (jsonData.length == 0) {
        jsonData = JSON.parse(getData(dataKey))[index].field_condition;
        if (jsonData.length == 0) {
            $('#field-condition-tab').hide();
        } else {
            $('#field-condition-tab').show();
        }
    } else {
        $('#field-condition-tab').show();
    }
    jsonData.forEach((condition) => {
        var fieldCondition = `<div class="bb__group flex-row gap-2 align-items-center">
                                    <div class="bb__input flex-grow-1">
                                        <input type="text" value="${condition.field_name}" disabled />
                                    </div>
                                    <a href="#">Edit</a>
                                    <a href="#"><i data-color="danger" class="fa-solid fa-trash"></i></a>
                                </div>`;

        $('.field-conditions').append(fieldCondition);
    });
}

function sortJsonData(data, currentIndex, targetIndex) {
    function findNestedArrayAndIndex(arr, indices) {
        if (indices.length === 1) {
            return { array: arr, index: indices[0] };
        } else {
            var subArray = arr[indices[0]];
            indices.shift();
            return findNestedArrayAndIndex(subArray, indices);
        }
    }

    var currentIndexArr = currentIndex.split('-').map(Number);
    var targetIndexArr = targetIndex.split('-').map(Number);

    var currentItem = findNestedArrayAndIndex(data, currentIndexArr);
    var targetItem = findNestedArrayAndIndex(data, targetIndexArr);

    var itemToMove = currentItem.array[currentItem.index];
    currentItem.array.splice(currentItem.index, 1);

    if (targetIndexArr.length > currentIndexArr.length) {
        targetItem.array.splice(targetItem.index + 1, 0, itemToMove);
    } else {
        targetItem.array.splice(targetItem.index, 0, itemToMove);
    }
}


/* HANDLE JSON DATA */
function handleJsonData(jsonData) {
    var dataKey = getDataKey();

    localStorage.setItem(dataKey, JSON.stringify(jsonData));
    data = getData(dataKey);

    updateCodeBlock(data);
    updateFieldView(dataKey);
}

/* UPDATE MODAL */
function updateModal(fieldName) {
    const fieldMap = {
        textfield: [
            '#nameInput',
            '#altNameInput',
            '#optionalHintInput',
            '#stringFormatInput',
            //'#values',
            '#defaultValueInputInput',
            //'#defaultValueCheckboxInput',
            '#requiredInput',
            '#disabledInput',
            '#reloadFormInput',

            '#cssClassLabelInput',
            '#cssClassValueInput',
            '#labelSizeInput',
            '#inputSizeInput',
            '#separateCellsInput',
            '#labelAboveInputInput',
            '#groupWithNextInput',
            //'#horizontalLayoutInput'
        ],
        select: [
            '#nameInput',
            '#altNameInput',
            '#optionalHintInput',
            //'#stringFormatInput',
            '#valuesInput',
            //'#defaultValueInputInput',
            '#defaultValueCheckboxInput',
            '#requiredInput',
            '#disabledInput',
            '#reloadFormInput',

            '#cssClassLabelInput',
            '#cssClassValueInput',
            '#labelSizeInput',
            '#inputSizeInput',
            '#separateCellsInput',
            '#labelAboveInputInput',
            '#groupWithNextInput',
            //'#horizontalLayoutInput'
        ],
        checkbox: [
            '#nameInput',
            '#altNameInput',
            '#optionalHintInput',
            /*'#stringFormatInput',*/
            //'#valuesInput',
            //'#defaultValueInputInput',
            '#defaultValueCheckboxInput',
            '#requiredInput',
            '#disabledInput',
            '#reloadFormInput',

            '#cssClassLabelInput',
            '#cssClassValueInput',
            '#labelSizeInput',
            '#inputSizeInput',
            '#separateCellsInput',
            '#labelAboveInputInput',
            '#groupWithNextInput',
            //'#horizontalLayoutInput'
        ],
        multiple_checkbox: [
            '#nameInput',
            '#altNameInput',
            '#optionalHintInput',
            //'#stringFormatInput',
            '#valuesInput',
            //'#defaultValueInputInput',
            '#defaultValueCheckboxInput',
            '#requiredInput',
            '#disabledInput',
            '#reloadFormInput',

            '#cssClassLabelInput',
            '#cssClassValueInput',
            '#labelSizeInput',
            '#inputSizeInput',
            '#separateCellsInput',
            '#labelAboveInputInput',
            '#groupWithNextInput',
            '#horizontalLayoutInput'
        ],
        label: [
            '#nameInput',
            '#altNameInput',
            '#optionalHintInput',
            //'#stringFormatInput',
            //'#valuesInput',
            //'#defaultValueInputInput',
            //'#defaultValueCheckboxInput',
            //'#requiredInput',
            //'#disabledInput',
            //'#reloadFormInput',

            '#cssClassLabelInput',
            //'#cssClassValueInput',
            '#labelSizeInput',
            //'#inputSizeInput',
            //'#separateCellsInput',
            //'#labelAboveInputInput',
            '#groupWithNextInput',
            //'#horizontalLayoutInput'
        ],
        radio: [
            '#nameInput',
            '#altNameInput',
            '#optionalHintInput',
            //'#stringFormatInput',
            '#valuesInput',
            //'#defaultValueInputInput',
            '#defaultValueCheckboxInput',
            '#requiredInput',
            '#disabledInput',
            '#reloadFormInput',

            '#cssClassLabelInput',
            //'#cssClassValueInput',
            '#labelSizeInput',
            //'#inputSizeInput',
            //'#separateCellsInput',
            //'#labelAboveInputInput',
            '#groupWithNextInput',
            //'#horizontalLayoutInput'
        ],

    };

    $('.field-input').hide();

    fieldName = fieldName.replace(/\s+/g, '_').toLowerCase();

    if (fieldMap[fieldName]) {
        fieldMap[fieldName].forEach(selector => {
            $(selector).show();
        });
    }

}

/* PARSE QUERY STRING */
function parseQueryString(queryString) {
    if (queryString.startsWith('?')) {
        queryString = queryString.substring(1);
    }

    var pairs = queryString.split('&');
    var result = {};

    pairs.forEach(function (pair) {
        var parts = pair.split('=');
        var key = decodeURIComponent(parts[0]);
        var value = decodeURIComponent(parts.slice(1).join('=')); // Handle '=' in parameter value
        if (!result[key]) {
            result[key] = value;
        } else if (Array.isArray(result[key])) {
            result[key].push(value);
        } else {
            result[key] = [result[key], value];
        }
    });

    return result;
}

/* ADD DATA */
function addData(data, key) {
    var storedData = localStorage.getItem(key);
    var formDataArray = storedData ? JSON.parse(storedData) : [];

    formDataArray.push(data);

    localStorage.setItem(key, JSON.stringify(formDataArray));
}

/* GET DATA */
function getData(key) {
    var storedData = localStorage.getItem(key);
    var formDataArray = storedData ? JSON.parse(storedData) : [];
    return JSON.stringify(formDataArray);
}

/* UPDATE DATA */
function updateData(itemId, newData) {
    var dataKey = getDataKey();

    var storedData = localStorage.getItem(dataKey);
    var formDataArray = storedData ? JSON.parse(storedData) : [];

    // Split itemId into array of indices
    var itemIdArray = itemId.toString().split('-').map(function (item) {
        return parseInt(item); // Convert each index to integer
    });

    // Navigate through nested data using itemIdArray indices
    var data = formDataArray;
    var parent = null;
    var key = null;

    for (var i = 0; i < itemIdArray.length; i++) {
        parent = data;
        key = itemIdArray[i];
        data = data[key];
        if (!data) {
            console.error('Item not found in formDataArray');
            return; // Exit if data is undefined
        }
    }

    // Update the nested data with newData
    parent[key] = newData;

    // Save the updated array back to local storage
    localStorage.setItem(dataKey, JSON.stringify(formDataArray));
}

function removeData(key) {
    localStorage.removeItem(key);
}

/* UPDATE CODE BLOCK */
function updateCodeBlock(data) {
    let formattedData;
    if (data) {
        formattedData = JSON.stringify(JSON.parse(data), null, 4);
    } else {
        formattedData = '';
    }

    var codediv = `
<pre><code class="language-json code-block">
${formattedData}
</code></pre>
                `;
    $('.code-block').html(codediv);
    Prism.highlightAll();
}

/* UPDATE FIELD VIEW */
function updateFieldView(key) {
    var data = getData(key);
    var json_data = JSON.parse(data);

    $('.field-card-container').empty();

    processJsonData(json_data);
}

/* PROCESS JSON DATA */
function processJsonData(jsonData, parentId = '', nestingLevel = 0) {
    if (Array.isArray(jsonData)) {
        jsonData.forEach((json, index) => {
            // Generate a unique id combining parentId and index
            var itemId = parentId ? `${parentId}-${index}` : `${index}`;

            if (Array.isArray(json)) {
                // If json is an array, recursively process it with increased nesting level
                processJsonData(json, itemId, nestingLevel + 1);
            } else {
                // Calculate margin based on nesting level
                var marginLeft = nestingLevel * 24;
                var backgroundColor = getBackgroundColor(nestingLevel);
                var style = `style="margin-left: ${marginLeft}px; background: ${backgroundColor};"`;
                var fieldCard = `<li class="field-card" data-id="${itemId}" ${style}>${json.name}<i data-action="delete" class="fa-regular fa-circle-xmark text-danger"></i><i data-action="edit" class="fa-solid fa-pen"></i><i class="fa-solid fa-grip-lines-vertical"></i></li>`;
                $('.field-card-container').append(fieldCard);
            }
        });
    } else {
        // Handle the case where jsonData is not an array (e.g., a single object)
        var fieldCard = `<li class="field-card" data-id="${parentId}-0">${jsonData.name}<i data-action="delete" class="fa-regular fa-circle-xmark text-danger"></i><i data-action="edit" class="fa-solid fa-pen"></i><i class="fa-solid fa-grip-lines-vertical"></i></li>`;
        $('.field-card-container').append(fieldCard);
    }
}

/* GET BACKGROUND COLOR */
function getBackgroundColor(nestingLevel) {
    // Generate a background color based on the nesting level
    // You can adjust the lightness value or use any other method to generate colors
    var hue = 220; // Fixed hue for blue color
    var lightness = 95 - (nestingLevel * 5); // Decrease lightness for deeper nesting levels
    return `hsl(${hue}, 100%, ${lightness}%)`;
}

function convertKebabToSnake(kebabStr) {
    // Remove the leading dot if it exists
    if (kebabStr.startsWith('.')) {
        kebabStr = kebabStr.substring(1);
    }

    // Replace "container" with "data"
    kebabStr = kebabStr.replace(/-container$/, '-data');

    // Replace hyphens with underscores
    let snakeStr = kebabStr.replace(/-/g, '_');

    return snakeStr;
}

function handleNavClick(element) {
    $('header ul li').removeClass('active');
    $(element).addClass('active');

    $('.checkout-form-container, .field-condition-container, .workflow-container, .field-visibility-container').hide();
    $($(element).data('target')).fadeIn(200);

    var dataKey = convertKebabToSnake($(element).data('target'));

    setDataKey(dataKey);

    var data = getData(dataKey);
    updateCodeBlock(data);
    updateFieldView(dataKey);
}

function setDataKey(dataKey) {
    localStorage.setItem('data_key', dataKey);
}

function getDataKey() {
    return localStorage.getItem('data_key');
}