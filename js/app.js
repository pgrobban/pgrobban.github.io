$(document).ready(function () {

    // setup table
    table = $('#glosTable').DataTable({
        "order": [[0, "asc"]],
        "iDisplayLength": 25,
        dom: '<"top"i>Trt<"bottom"lp><"clear">',
        "oTableTools": {
            "sSwfPath": "swf/copy_csv_xls_pdf.swf",
            "aButtons": [
                {
                    "sExtends": "copy",
                    "mColumns": [0, 1, 2, 4],
                    "bFooter": false
                },
                {
                    "sExtends": "csv",
                    "sTitle": "My word list",
                    "bHeader": false,
                    "bFooter": false,
                    "sButtonText": "Save as CSV (importable)",
                    "sFieldSeparator": ".",
                },
                {
                    "sExtends": "pdf",
                    "sButtonText": "Generate PDF",
                    "sTitle": "My word list",
                    "mColumns": [0, 1, 2, 4],
                    "bFooter": false
                },
                {
                    "sExtends": "xls",
                    "sTitle": "My word list",
                    "mColumns": [0, 1, 2, 4],
                    "bFooter": false,
                    "sFileName": "My word list.xls",
                    "sFieldSeparator": ".",
                },
                "print"
            ]
        }
    });
    table.column(3).visible(false); // hide debug optional forms
    $('searchBox').addClass("ui-corner-all");

    swedishDictionaryForm = $("#swedishDictionaryForm"),
            definition = $("#definition"),
            wordClass = $("#wordClass"),
            allFields = $([]).add(swedishDictionaryForm).add(definition).add(wordClass),
            tips = $(".validateTips");

    // set up word classes
    for (var wc in wordClasses)
    {
        wordClass.append($("<option/>").val(wordClasses[wc]).text(wordClasses[wc]));
    }


    dialog = $("#dialogForm").dialog({
        autoOpen: false,
        height: 640,
        width: 500,
        modal: true,
        close: function () {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        addEntry();
    });


});

jQuery.fn.dataTableExt.oSort['string-case-asc'] = function (x, y) {
    return x.localeCompare(y, 'sv');
};


function toggleSelectedRow() {
    // prevent toggling of empty row
    var entries = table.rows().data();
    if (entries.length === 0)
        return;

    // "this" will be the DOM element
    $(this).toggleClass('selected');

    console.log(table.rows(".selected").data());

    if (table.rows(".selected").data().length === 0)
    {
        $("#editEntryButton").prop('disabled', true);
        $("#deleteEntriesButton").prop('disabled', true);
    }
    else
    {
        $("#editEntryButton").prop('disabled', false);
        $("#deleteEntriesButton").prop('disabled', false);
    }
}


function getData()
{
    var inputSwedishDictionaryForm = swedishDictionaryForm.val().trim();
    var inputDefinition = definition.val().trim();
    var inputWordClass = wordClass.val();
    var optionalForms = getOptionalWordForms();
    var prettifiedOptionalForms = prettifyOptionalWordForms(optionalForms);
    console.log("Word: swedishDictionaryForm: " + inputSwedishDictionaryForm +
            " definition:" + inputDefinition +
            " wordClass: " + inputWordClass +
            " optionalForms: " + optionalForms +
            " prettifiedOptionalForms: " + prettifiedOptionalForms);
    return [inputSwedishDictionaryForm, inputDefinition, inputWordClass, optionalForms, prettifiedOptionalForms];
}

function editEntry()
{
    var valid = validateEntry();
    if (valid)
    {
        var data = getData();
        // hacky
        table.row('.selected').remove().draw(false);
        table.row.add(data).draw();
        dialog.dialog("close");
    }
}

function prettifyOptionalWordForms(inputOptionalForms)
{
    console.log(inputOptionalForms);
    var result = "";
    for (var i in inputOptionalForms)
    {
        var s = inputOptionalForms[i].trim();
        if (s !== "")
            result += s + ", ";
    }
    return result.slice(0, result.length - 2);
}

$("#newEntryButton").on("click", function () {
    openNewEntryDialog();
});



function openEditEntryDialog()
{
    // see if we have 0 or mmore than 1 selected entry
    var selectedEntries = table.rows(".selected").data();
    if (selectedEntries.length !== 1)
    {
        alert("Please select one row to edit.");
        return;
    }

    // now we have guaranteed only one row
    var selectedEntry = selectedEntries[0];

    console.log("selected:");
    console.log(selectedEntry);

    dialog.dialog("option", "buttons", [
        {
            text: "Done",
            click: function () {
                editEntry();
                dialog.dialog("close");
            }
        }
    ]);
    dialog.dialog("open");
    $("span.ui-dialog-title").text('Edit entry');  // hacky

    swedishDictionaryForm.val(selectedEntry[0]);
    definition.val(selectedEntry[1]);
    var wordClassInput = selectedEntry[2];
    wordClass.val(wordClassInput);
    setupOptionalFormLabelsAndInputs(wordClassOptionalForms[wordClassInput]);
    setOptionalFormsToInputs(selectedEntry[3]);
}

function setOptionalFormsToInputs(optionalForms)
{
    if (typeof (optionalForms) === "string")
    {
        optionalForms = optionalForms.split(",");
    }
    $.each(optionalForms, function (index, value) {
        $("#optionalForms input").eq(index).val(value);
    });
}

function validateEntry()
{
    var valid = true;
    allFields.removeClass("ui-state-error");

    valid = valid && checkNotChosenWordClass();
    valid = valid && checkNotEmpty(swedishDictionaryForm, "Swedish dictionary form");
    valid = valid && checkNotEmpty(definition, "Definition");
    if (!valid)
        dialog.animate({scrollTop: 0}, "medium");

    return valid;
}

function checkNotChosenWordClass()
{
    if (wordClass.val() === null) {
        wordClass.addClass("ui-state-error");
        updateTips("Please select a word class.");
        return false;
    } else {
        return true;
    }
}

function checkNotEmpty(o, name)
{
    if (o.val().trim().length === 0) {
        o.addClass("ui-state-error");
        updateTips(name + " can't be empty.");
        return false;
    } else {
        return true;
    }
}

function updateTips(t) {
    tips
            .text(t)
            .addClass("ui-state-highlight");
    setTimeout(function () {
        tips.removeClass("ui-state-highlight", 1500);
    }, 500);
}


function deleteEntries()
{
    var selectedRowCount = table.row('.selected').length;
    if (selectedRowCount === 0)
        alert("No rows selected.");
    else if (confirm("Do you really want to delete the selected row(s)?"))
        table.row('.selected').remove().draw(false);
}

function getOptionalWordForms()
{
    var optionalWordForms = [];
    $.each($("#optionalForms input"), function () {
        optionalWordForms.push(this.value.trim());
    })
    return optionalWordForms;
}



function setupOptionalFormLabelsAndInputs(optionalForms)
{
    $("#optionalForms").empty();

    if (optionalForms.length > 0)
        $("#optionalForms").append($("<p>The following forms are optional. You may return here and fill them in when you get to know them.</p>"));

    for (var wco in optionalForms)
    {
        var formName = optionalForms[wco];

        $("#optionalForms").append($("<label>").attr("for", formName).html(formName));
        $("#optionalForms").append($("<input>").attr({
            type: "text",
            name: formName,
            id: formName,
            class: "text ui-widget-content ui-corner-all"
        }));
    }
}

function addEntry()
{
    var valid = validateEntry();
    if (valid)
    {
        var data = getData();
        table.row.add(data).draw();
        dialog.dialog("close");
    }
}

function tryParseFile()
{
    
    // try to read file
    var file = document.getElementById('fileInput').files[0];
    var textType = /text.*/;

    if (file.type.match(textType)) {
        var reader = new FileReader();

        reader.onload = function () {
            var contents = reader.result;
            // try to make table
            table.clear().draw();
            var array = CSVToArray(contents, ",");
            console.log("Parsed array from file:");
            console.log(array);
            for (var row in array)
            {
                table.row.add(array[row]);
            }
            table.draw();
        };

        reader.readAsText(file);
    } else {
        alert("File not supported");
    }
}

function openNewEntryDialog() {
    dialog.dialog("option", "buttons", [
        {
            text: "Done",
            click: addEntry
        }
    ]);
    $("#optionalForms").empty();
    dialog.dialog("open");
    $("span.ui-dialog-title").text('Add new entry');  // hacky
}