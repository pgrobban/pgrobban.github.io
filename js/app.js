var app = {};

app.wordClasses = ["Noun", "Verb", "Adjective", "Adverb", "Personal pronoun", "Other pronoun",
    "Conjunction", "Interjection", "Preposition", "Numeral", "Phrase/Expression/Proverb", "Other"];

app.wordClassOptionalForms = {};
app.wordClassOptionalForms["Noun"] = ["Definite singular", "Indefinite pural", "Definite plural",
    "Genitive indefinite singular", "Genitive definite singular", "Genitive indefinite plural", "Genitive definite plural"];
app.wordClassOptionalForms["Verb"] = ["Present tense", "Past tense (preterite)", "Perfect tense (supine)", "Imperative mood",
    "Passive present tense", "Passive past tense", "Passive perfect tense", "Particip", "Perfekt particip"];
app.wordClassOptionalForms["Adjective"] = ["Positive <i>ett</i> ~ &lt;noun&gt;", "Positive <i>den/det/de</i> ~ &lt;noun&gt", "Positive <i>den</i> ~ &lt;masc. noun&gt",
    "Comparative <i>en/ett/den/det/de</i> ~ + &lt;noun&gt;", "Superlative <i>är ~</i>", "Def. superlative <i>den/det/de</i> ~ &lt;noun&gt;", "Def. superlative <i>den</i> ~ &lt;masc. noun&gt;"];
app.wordClassOptionalForms["Personal pronoun"] = ["Object form", "Possessive &lt;en-noun&gt;", "Possessive &lt;ett-noun&gt;", "Possessive &lt;plural noun&gt;"];
app.wordClassOptionalForms["Phrase/Expression/Proverb"] = ["Literal meaning"];
app.wordClassOptionalForms["Numeral"] = ["Ordinal form", "Ordinal form <i>den/det/de</i> ~ &lt;noun&gt;", "Ordinal form <i>den</i> ~ &lt;masc. noun&gt;"];

//
app.wordClassDictionaryFormTips = {};
app.wordClassDictionaryFormTips["Noun"] = "The dictionary form of a noun is the indefinite singular form. (<i>en/ett</i> ~)";
app.wordClassDictionaryFormTips["Verb"] = "The dictionary form of a verb is the infinitive form (<i>att</i> ~)";
app.wordClassDictionaryFormTips["Adjective"] = "The dictionary form of an adjective is the positive <i>en</i>-form.";
app.wordClassDictionaryFormTips["Personal pronoun"] = "The dictionary form of a personal pronoun is the subject form.";
app.wordClassDictionaryFormTips["Numeral"] = "The dictionary form of a numeral is the cardinal form.";

app.editingMode = false;

app.openNewEntryDialog = function () {
    app.editingMode = false;
    app.dialog.dialog("option", "buttons", [
        {
            text: "Done",
            click: app.addEntry
        }
    ]);
    $("#optionalForms").empty();
    app.dialog.dialog("open");
    app.dialog.dialog("option", "title", "Add new entry");
};

app.toggleSelectedRow = function () {
    // prevent toggling of empty row
    var entries = app.table.rows().data();
    if (entries.length === 0)
        return;

    // "this" will be the DOM element
    $(this).toggleClass('selected');

    console.log(app.table.rows(".selected").data());

    if (app.table.rows(".selected").data().length === 0)
    {
        $("#editEntryButton").prop('disabled', true);
        $("#deleteEntriesButton").prop('disabled', true);
    }
    else
    {
        $("#editEntryButton").prop('disabled', false);
        $("#deleteEntriesButton").prop('disabled', false);
    }
};


app.getInputData = function ()
{
    var inputSwedishDictionaryForm = app.swedishDictionaryForm.val().trim();
    var inputDefinition = app.definition.val().trim();
    var inputWordClass = app.wordClass.val();
    var optionalForms = app.getOptionalWordForms();
    var prettifiedOptionalForms = app.prettifyOptionalWordForms(optionalForms);
    console.log("Word: swedishDictionaryForm: " + inputSwedishDictionaryForm +
            " definition:" + inputDefinition +
            " wordClass: " + inputWordClass +
            " optionalForms: " + optionalForms +
            " prettifiedOptionalForms: " + prettifiedOptionalForms);
    return [inputSwedishDictionaryForm, inputDefinition, inputWordClass, optionalForms, prettifiedOptionalForms];
};


app.editEntry = function ()
{
    var valid = app.validateEntry();
    if (valid)
    {
        var data = app.getInputData();
        // hacky
        console.log(app.table.row(".selected"));
        app.table.row('.selected').remove().draw(false);
        app.table.row.add(data).draw();
        app.dialog.dialog("close");
    }
};

app.prettifyOptionalWordForms = function (inputOptionalForms)
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
};

app.openEditEntryDialog = function ()
{
    app.editingMode = true;
    // see if we have 0 or mmore than 1 selected entry
    var selectedEntries = app.table.rows(".selected").data();
    if (selectedEntries.length !== 1)
    {
        alert("Please select one row to edit.");
        return;
    }
    console.log("xxx");
    console.log(selectedEntries);

    // now we have guaranteed only one row
    var selectedEntry = selectedEntries[0];

    console.log("selected:");
    console.log(selectedEntry);

    app.dialog.dialog("option", "buttons", [
        {
            text: "Done",
            click: function () {
                app.editEntry();
                app.dialog.dialog("close");
            }
        }
    ]);
    app.dialog.dialog("open");
    app.dialog.dialog("option", "title", "Edit entry");

    app.swedishDictionaryForm.val(selectedEntry[0]);
    app.definition.val(selectedEntry[1]);
    var wordClassInput = selectedEntry[2];
    app.wordClass.val(wordClassInput);
    app.setupOptionalFormLabelsAndInputs(app.wordClassOptionalForms[wordClassInput]);
    app.setOptionalFormsToInputs(selectedEntry[3]);
};

app.setOptionalFormsToInputs = function (optionalForms)
{
    if (typeof (optionalForms) === "string")
    {
        optionalForms = optionalForms.split(",");
    }
    $.each(optionalForms, function (index, value) {
        $("#optionalForms input").eq(index).val(value);
    });
};

app.validateEntry = function ()
{
    var valid = true;
    app.allFields.removeClass("ui-state-error");

    valid = valid && app.checkNotChosenWordClass();
    valid = valid && app.checkNotEmpty(app.swedishDictionaryForm, "Swedish dictionary form");
    valid = valid && app.checkNotEmpty(app.definition, "Definition");
    if (!valid)
        app.dialog.animate({scrollTop: 0}, "medium");

    return valid;
};


app.checkNotChosenWordClass = function ()
{
    if (app.wordClass.val() === null) {
        app.wordClass.addClass("ui-state-error");
        app.updateTips("Please select a word class.");
        return false;
    } else {
        return true;
    }
};

app.checkNotEmpty = function (o, name)
{
    if (o.val().trim().length === 0) {
        o.addClass("ui-state-error");
        app.updateTips(name + " can't be empty.");
        return false;
    } else {
        return true;
    }
};

app.updateTips = function (t) {
    app.tips.text(t)
            .addClass("ui-state-highlight");
    setTimeout(function () {
        app.tips.removeClass("ui-state-highlight", 1500);
    }, 500);
};


app.deleteEntries = function ()
{
    var selectedRowCount = app.table.row('.selected').length;
    if (selectedRowCount === 0)
        alert("No rows selected.");
    else if (confirm("Do you really want to delete the selected row(s)?"))
        app.table.row('.selected').remove().draw(false);
};

app.getOptionalWordForms = function ()
{
    var optionalWordForms = [];
    $.each($("#optionalForms input"), function () {
        optionalWordForms.push(this.value.trim());
    });
    return optionalWordForms;
};

app.setupOptionalFormLabelsAndInputs = function (optionalForms)
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
};

app.addEntry = function ()
{
    var valid = app.validateEntry();
    if (valid)
    {
        var data = app.getInputData();
        app.table.row.add(data).draw();
        app.dialog.dialog("close");
    }
};

app.tryParseFile = function ()
{

    // try to read file
    var file = document.getElementById('fileInput').files[0];
    var textType = /text.*/;

    if (file.type.match(textType)) {
        var reader = new FileReader();

        reader.onload = function () {
            var contents = reader.result;
            // try to make table
            app.table.clear().draw();
            var array = CSVToArray(contents, ",");
            console.log("Parsed array from file:");
            console.log(array);
            for (var row in array)
            {
                app.table.row.add(array[row]);
            }
            app.table.draw();
        };

        reader.readAsText(file);
    } else {
        alert("File not supported");
    }
};


$(document).ready(function () {

    // setup table
    app.table = $('#glosTable').DataTable({
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
                    "sFieldSeparator": "."
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
                    "sFieldSeparator": "."
                },
                "print"
            ]
        }
    });
    app.table.column(3).visible(false); // hide debug optional forms
    $('searchBox').addClass("ui-corner-all");

    app.swedishDictionaryForm = $("#swedishDictionaryForm");
    app.definition = $("#definition");
    app.wordClass = $("#wordClass");
    app.allFields = $([]).add(app.swedishDictionaryForm).add(definition).add(wordClass),
            app.tips = $(".validateTips");

    // set up word classes
    for (var wc in app.wordClasses)
    {
        app.wordClass.append($("<option/>").val(app.wordClasses[wc]).text(app.wordClasses[wc]));
    }

    app.dialog = $("#dialogForm").dialog({
        autoOpen: false,
        height: 640,
        width: 500,
        modal: true,
        close: function () {
            app.form[0].reset();
            app.allFields.removeClass("ui-state-error");
        }
    });

    app.form = app.dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        if (app.editingMode)
            app.editEntry();
        else
            app.addEntry();
    });

});

jQuery.fn.dataTableExt.oSort['string-case-asc'] = function (x, y) {
    return x.localeCompare(y, 'sv');
};


