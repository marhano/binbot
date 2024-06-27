$(document).ready(function () {
    var _data = getData();
    updateCodeBlock(_data);
    updateFieldView();
    let _fieldName = '';

    
    $('.field-card-container').sortable({
        revert: true
    });

    function updateFieldView() {
        var data = getData();
        var json_data = JSON.parse(data);

        $('.field-card-container').empty();

        processJsonData(json_data);
    }

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

    function getBackgroundColor(nestingLevel) {
        // Generate a background color based on the nesting level
        // You can adjust the lightness value or use any other method to generate colors
        var hue = 220; // Fixed hue for blue color
        var lightness = 95 - (nestingLevel * 5); // Decrease lightness for deeper nesting levels
        return `hsl(${hue}, 100%, ${lightness}%)`;
    }

    $(document).on('click', '#importBtn', function () {
        $('#fileInput').click();
    });

    $(document).on('change', '#fileInput', function (event) {
        const file = event.target.files[0];
        if (file && file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = function (e) {
                const jsonData = JSON.parse(e.target.result);
                handleJsonData(jsonData);
            };
            reader.readAsText(file);
        } else {
            alert('Please select a valid JSON file.');
        }
    });

    function handleJsonData(jsonData) {
        localStorage.setItem('formData', JSON.stringify(jsonData));
        data = getData();

        updateCodeBlock(data);
        updateFieldView();
    }

    $(document).on('click', 'i[data-action="delete"]', function () {
        var $fieldCard = $(this).closest('li.field-card');
        var id = $fieldCard.data('id');

        $fieldCard.remove();

        var storedData = localStorage.getItem('formData');
        var formDataArray = storedData ? JSON.parse(storedData) : [];
        formDataArray.splice(id, 1);

        localStorage.setItem('formData', JSON.stringify(formDataArray));

        data = getData();

        updateFieldView();
        updateCodeBlock(data);
    });

    $(document).on('click', 'i[data-action="edit"]', function () {
        var $fieldCard = $(this).closest('li.field-card');
        var itemId = $fieldCard.data('id');

        var storedData = localStorage.getItem('formData');
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

        // Example of updating modal with formDataItem
        $.each(data, function (name, value) {
            if (typeof value === 'boolean') {
                // Checkboxes
                $('input[type="checkbox"][name="' + name + '"]').prop('checked', value);
                $('input[type="hidden"][name="' + name + '"]').remove(); // Remove any hidden inputs
            } else {
                // Other input types (text, number, etc.)
                $('input[name="' + name + '"]').val(value);
            }
        });

        $('#fieldModal').modal('show');
        updateModal(data.input_type.toUpperCase());
    });

    $("ul, li").disableSelection()

    $('button[data-bs-target="#fieldModal"]').click(function () {
        _fieldName = $(this).text();
        updateModal(_fieldName);
    });

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

    $('#fieldModal').on('hidden.bs.modal', function () {
        $('#properties-tab').tab('show');
        $('#createFieldForm')[0].reset();
    });

    $(document).on('click', '#resetBtn', function (event) {
        localStorage.setItem('formData', []);
        updateCodeBlock('');
        updateFieldView();
    });

    $(document).on('click', '#addFieldBtn', function (event) {
        event.preventDefault();
        $('#createFieldForm input[type=checkbox]').each(function () {
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
                    }).appendTo('#createFieldForm');
                }
                hiddenInput.val('off'); 
            }
        });


        var formDataArray = $('#createFieldForm').serializeArray();
        var formDataJSON = {};

        $.each(formDataArray, function () {
            if (!this.value) {
                formDataJSON[this.name] = false;
            } else if (this.value ==='on') {
                formDataJSON[this.name] = true;
            } else if (this.value === 'off') {
                formDataJSON[this.name] = false;
            }else {
                formDataJSON[this.name] = this.value;
            }
        });

        formDataJSON.input_type = _fieldName;
        addData(formDataJSON);
        var data = getData();

        updateCodeBlock(data);
        updateFieldView();

        $('#createFieldForm')[0].reset();
        $('#fieldModal').modal('hide');
    });

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

    function addData(data){
        var storedData = localStorage.getItem('formData');
        var formDataArray = storedData ? JSON.parse(storedData) : [];

        formDataArray.push(data);

        localStorage.setItem('formData', JSON.stringify(formDataArray));
    }
    function getData() {
        var storedData = localStorage.getItem('formData');
        var formDataArray = storedData ? JSON.parse(storedData) : [];
        return JSON.stringify(formDataArray);
    }

    $(document).on('click', '#loginBinbotBtn', function (event) {
        event.preventDefault();

        var data = $('#loginForm').serialize();
        $('#loginModal').modal('hide');

        $.ajax({
            url: '/Home/LoginBinbot',
            type: 'POST',
            data: data,
            success: function (response) {
                var queryString = $('#requestInput').val(); 

                var [requestPart, queryPart] = queryString.split('?');
                var queryParams = parseQueryString(queryPart);
                var data = {
                    request: requestPart,
                    id: queryParams.id,
                    count: queryParams.count
                };
                data.jsonData = getData();

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

});