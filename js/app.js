var app = {};

$(document).ready(function () {

    // setup table
    app.table = $('#glosTable').DataTable({
        "order": [[0, "asc"]],
        "iDisplayLength": 25,
        dom: '<"top"i>CTrt<"bottom"lp><"clear">',
        "oTableTools": {
            "sSwfPath": "swf/copy_csv_xls_pdf.swf",
            "aButtons": [
                {
                    "sExtends": "copy",
                    "bFooter": false
                },
                {
                    "sExtends": "pdf",
                    "sButtonText": "Generate PDF",
                    "sTitle": "My word list",
                    "bFooter": false
                },
                {
                    "sExtends": "xls",
                    "sTitle": "My word list",
                    "bFooter": false,
                    "sFileName": "My word list.xls",
                    "sFieldSeparator": "."
                },
                "print"
            ]
        }
    });
    $(".ColVis_Button").addClass("fa fa-table");

    app.swedishDictionaryFormInput = $("#swedishDictionaryForm");
    app.definitionInput = $("#definition");
    app.wordClassInput = $("#wordClass");
    app.pronunciationInput = $("#pronunciation");
    app.usageNotesInput = $("#usageNotes");
    app.nounArticlesInput = $("#nounArticles");
    app.allFieldsForValidation = $([]).add(app.swedishDictionaryFormInput).add(app.definitionInput).add(app.wordClassInput).add(app.nounArticlesInput);
    app.tipsBox = $(".validateTips");

    // set up word classes
    for (var wc in app.wordClassInputes)
    {
        app.wordClassInput.append($("<option/>").val(app.wordClassInputes[wc]).text(app.wordClassInputes[wc]));
    }

    app.dialog = $("#dialogForm").dialog({
        autoOpen: false,
        height: 0.8 * $(window).height(),
        width: 500,
        modal: true,
        close: function () {
            app.form[0].reset();
            app.allFieldsForValidation.removeClass("ui-state-error");
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


app.editingMode = false;
app.entries = [];

app.wordClassInputes = ["Noun", "Verb", "Adjective", "Adverb", "Personal pronoun", "Other pronoun",
    "Conjunction", "Interjection", "Preposition", "Numeral", "Phrase/Expression/Proverb", "Other"];

app.wordClassDictionaryFormTips = {};
app.wordClassDictionaryFormTips["Noun"] = "The dictionary form of a noun is the indefinite singular form. (<i>en/ett</i> ~)";
app.wordClassDictionaryFormTips["Verb"] = "The dictionary form of a verb is the infinitive form (<i>att</i> ~)";
app.wordClassDictionaryFormTips["Adjective"] = "The dictionary form of an adjective is the positive <i>en</i>-form.";
app.wordClassDictionaryFormTips["Personal pronoun"] = "The dictionary form of a personal pronoun is the subject form.";
app.wordClassDictionaryFormTips["Numeral"] = "The dictionary form of a numeral is the cardinal form.";

app.wordClassOptionalForms = {};
app.wordClassOptionalForms["Noun"] = ["Definite singular", "Indefinite pural", "Definite plural",
    "Genitive indefinite singular", "Genitive definite singular", "Genitive indefinite plural", "Genitive definite plural"];
app.wordClassOptionalForms["Verb"] = ["Present tense", "Past tense", "Perfect tense", "Imperative mood",
    "Passive present tense", "Passive past tense", "Passive perfect tense", "Particip", "Perfekt particip"];
app.wordClassOptionalForms["Adjective"] = ["Positive neuter", "Positive definite", "Positive definite masculine",
    "Comparative", "Superlative", "Definite superlative", "Definite superlative masculine"];
app.wordClassOptionalForms["Personal pronoun"] = ["Object form", "Possessive common", "Possessive neuter", "Possessive plural"];
app.wordClassOptionalForms["Phrase/Expression/Proverb"] = ["Literal meaning"];
app.wordClassOptionalForms["Numeral"] = ["Ordinal form", "Ordinal definite", "Ordinal definite masculine"];

app.wordClassOptionalFormTips = {};
app.wordClassOptionalFormTips["Past tense"] = "(preterite)";
app.wordClassOptionalFormTips["Perfect tense"] = "(supine)";
app.wordClassOptionalFormTips["Positive neuter"] = "<i>ett</i> ~ &lt;noun&gt;";
app.wordClassOptionalFormTips["Positive definite"] = "<i>den/det/de</i> ~ &lt;noun&gt";
app.wordClassOptionalFormTips["Positive definite masculine"] = "<i>den</i> ~ &lt;masc. noun&gt";
app.wordClassOptionalFormTips["Comparative"] = "<i>en/ett/den/det/de</i> ~ + &lt;noun&gt;";
app.wordClassOptionalFormTips["Superlative"] = " <i>är ~</i>";
app.wordClassOptionalFormTips["Definite superlative"] = "<i>den/det/de</i> ~ &lt;noun&gt";
app.wordClassOptionalFormTips["Definite superlative masculine"] = "<i>den</i> ~ &lt;masc. noun&gt";
app.wordClassOptionalFormTips["Possessive common"] = "(someone's &lt;en-noun&gt;)"
app.wordClassOptionalFormTips["Possessive neuter"] = "(someone's &lt;ett-noun&gt;)"
app.wordClassOptionalFormTips["Possessive plural"] = "(someone's &lt;pl. noun&gt;)"
app.wordClassOptionalFormTips["Ordinal definite"] = "<i>den/det/de</i> ~ &lt;noun&gt;"
app.wordClassOptionalFormTips["Ordinal definite masculine"] = "<i>den</i> ~ &lt;masc. noun&gt;";



app.openNewEntryDialog = function () {
    app.editingMode = false;
    app.dialog.dialog("option", "buttons", [
        {
            text: "Done",
            click: app.addEntry
        }
    ]);
    $("#nounArticles").hide();
    $("#additionalForms").empty();
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
        $("#deleteSelectedEntriesButton").prop('disabled', true);
    }
    else
    {
        $("#editEntryButton").prop('disabled', false);
        $("#deleteSelectedEntriesButton").prop('disabled', false);
    }
};


app.getInputData = function ()
{
    var newEntry = {};
    newEntry.wordClass = app.wordClassInput.val();

    if (newEntry.wordClass === "Noun")
    {
        newEntry.swedishDictionaryForm = {};
        newEntry.swedishDictionaryForm.article = $("#nounArticles").val();
        newEntry.swedishDictionaryForm.value = app.swedishDictionaryFormInput.val().trim();
    }
    else
    {
        newEntry.swedishDictionaryForm = app.swedishDictionaryFormInput.val().trim();
    }

    newEntry.pronunciation = app.pronunciationInput.val().trim();
    newEntry.usageNotes = app.usageNotesInput.val().trim();
    newEntry.definition = app.definitionInput.val().trim();
    newEntry.additionalForms = app.getOptionalWordForms();
    console.log("Got entry: ");
    console.log(newEntry);
    return newEntry;
};


app.addEntry = function ()
{
    var valid = app.validateEntry();
    if (valid)
    {
        var entry = app.getInputData();
        if (app.checkForPrependingParticles(entry) === false)
            return;
        app.entries.push(entry);
        var prettifiedOptionalForms = app.prettifyOptionalWordForms(entry.additionalForms);
        if (entry.wordClass === "Noun")
            var displayedSwedish = entry.swedishDictionaryForm.article + " " + entry.swedishDictionaryForm.value;
        else
            var displayedSwedish = entry.swedishDictionaryForm;

        app.table.row.add([displayedSwedish, entry.pronunciation, entry.definition, entry.wordClass, prettifiedOptionalForms]).draw();

        $("#nounArticles").hide();
        $("#clearTableButton, #exportButton").attr("disabled", false);
        app.dialog.dialog("close");
    }
};

// check for en/ett in front of nouns, att in front of verbs. returns true if the add/edit should proceed
app.checkForPrependingParticles = function (entry)
{
    if (entry.wordClass === "Verb")
    {
        if (!(entry.swedishDictionaryForm.startsWith("att ")))
            if (!confirm("It is recommended that you add 'att' in front of verbs. Continue without doing this?"))
                return false;
    }
    return true;
}


app.editEntry = function ()
{
    var valid = app.validateEntry();
    if (valid)
    {
        var entry = app.getInputData();
        if (app.checkForPrependingParticles(entry) === false)
            return;
        var selectedIndex = app.table.row(".selected").index();
        app.entries[selectedIndex] = entry;
        var prettifiedOptionalForms = app.prettifyOptionalWordForms(entry.additionalForms);
        app.table.row('.selected').remove().draw(false);
        app.table.row.add([entry.swedishDictionaryForm, entry.pronunciation, entry.definition, entry.wordClass, prettifiedOptionalForms]).draw();

        $("#nounArticles").hide();
        app.dialog.dialog("close");
    }
};

app.exportEntriesAsJSON = function ()
{
    var file = new File([JSON.stringify(app.entries, null, '\t')], {type: "data:text/json;charset=utf8"});
    saveAs(file, "My word list.json");
};

app.prettifyOptionalWordForms = function (inputOptionalForms)
{
    console.log(inputOptionalForms);
    var result = "";
    for (var i in inputOptionalForms)
    {
        var s = inputOptionalForms[i].value.trim();
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

    // now we have guaranteed only one row
    var selectedEntry = app.entries[app.table.row(".selected").index()];

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

    if (selectedEntry.wordClass === "Noun")
    {
        $("#nounArticles").show();
        $("#nounArticles").val(selectedEntry.swedishDictionaryForm.article);
        app.swedishDictionaryFormInput.val(selectedEntry.swedishDictionaryForm.value);
    }
    else
    {
        app.swedishDictionaryFormInput.val(selectedEntry.swedishDictionaryForm);
    }

    app.definitionInput.val(selectedEntry.definition);
    app.pronunciationInput.val(selectedEntry.pronunciation);
    app.usageNotesInput.val(selectedEntry.usageNotes);

    var wordClass = selectedEntry.wordClass;
    $("#dictionaryFormTips").html(app.wordClassDictionaryFormTips[wordClass]);

    app.wordClassInput.val(wordClass);
    app.setupOptionalFormLabelsAndInputs(app.wordClassOptionalForms[wordClass]);
    app.setOptionalFormsToInputs(selectedEntry.additionalForms);

    app.dialog.dialog("open");
    app.dialog.dialog("option", "title", "Edit entry");
};

app.wordClassChanged = function (currentWordClass)
{
    $("#dictionaryFormTips").html(app.wordClassDictionaryFormTips[currentWordClass]);
    if (currentWordClass === "Noun")
        $("#nounArticles").show();
    else
        $("#nounArticles").hide();

    app.setupOptionalFormLabelsAndInputs(app.wordClassOptionalForms[currentWordClass]);
};

app.setOptionalFormsToInputs = function (additionalForms)
{
    console.log(additionalForms);
    $.each(additionalForms, function (index, v) {
        $("#additionalForms input").eq(index).val(v.value);
    });
};

app.validateEntry = function ()
{
    var valid = true;
    app.allFieldsForValidation.removeClass("ui-state-error");

    valid = valid && app.checkNotChosenOption(app.wordClassInput, " word class.");

    if (app.wordClassInput.val() === "Noun")
        valid = valid && app.checkNotChosenOption(app.nounArticlesInput, " noun article.");

    valid = valid && app.checkNotEmpty(app.swedishDictionaryFormInput, "Swedish dictionary form");
    valid = valid && app.checkNotEmpty(app.definitionInput, "Definition");


    if (!valid)
        app.dialog.animate({scrollTop: 0}, "medium");

    return valid;
};


app.checkNotChosenOption = function (o, name)
{
    if (o.val() === null) {
        o.addClass("ui-state-error");
        app.updateTips("Please select a " + name);
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
    app.tipsBox.text(t)
            .addClass("ui-state-highlight");
    setTimeout(function () {
        app.tipsBox.removeClass("ui-state-highlight", 1500);
    }, 500);
};


app.deleteSelectedEntries = function ()
{
    var selectedRowCount = app.table.row('.selected').length;
    if (selectedRowCount === 0)
        alert("No rows selected.");
    else if (confirm("Do you really want to delete the selected row(s)?"))
    {
        console.log("Deleting selected indexes");
        var selectedIndices = app.table.rows(".selected").indexes();
        console.log(selectedIndices);
        for (var i = 0; i < selectedIndices.length; i++)
        {
            app.entries.splice(selectedIndices[i]);
        }
        app.table.row('.selected').remove().draw(false);
        console.log("Remaining entries");
        console.log(app.entries);
        $("#editEntryButton").attr("disabled", true);

        if (app.entries.length === 0)
            $("#exportButton, #clearTableButton, #deleteSelectedEntriesButton").attr("disabled", true);
    }
};

app.clearTable = function ()
{
    if (!confirm("This will remove all data in the table. Any unsaved entries will be lost. Continue?"))
        return;
    
    app.table.clear().draw();
    app.entries = [];
    $("#clearTableButton").attr("disabled", true);
};

app.getOptionalWordForms = function ()
{
    var inputOptionalFormsArrayOfObjects = [];

    var currentWordClassOptionalForms = app.wordClassOptionalForms[app.wordClassInput.val()];

    for (var form in currentWordClassOptionalForms)
    {
        var additionalForm = {};
        additionalForm.name = currentWordClassOptionalForms[form];
        additionalForm.value = $("#additionalForms input").eq(form).val();
        inputOptionalFormsArrayOfObjects.push(additionalForm);
    }

    return inputOptionalFormsArrayOfObjects;
};

app.setupOptionalFormLabelsAndInputs = function (additionalForms)
{
    var additionalFormsDiv = $("#additionalForms");
    additionalFormsDiv.empty();

    if (additionalForms.length > 0)
        additionalFormsDiv.append("<h3 class='formHeader'>Additional forms/conjugations</h3>");

    for (var wco in additionalForms)
    {
        var formName = additionalForms[wco];

        var formLabel = $("<label>").attr("for", formName).text(formName);
        formLabel.append($("<span>")
                .addClass("fieldTips")
                .html(app.wordClassOptionalFormTips[formName]));
        additionalFormsDiv.append(formLabel);

        additionalFormsDiv.append($("<input>").attr({
            type: "text",
            name: formName,
            id: formName,
            class: "text ui-widget-content ui-corner-all"
        }));
    }
};


app.tryParseJSONFile = function ()
{

    // try to read file
    var file = document.getElementById('fileInput').files[0];
    var textType = /application\/json.*/;

    if (file.type.match(textType)) {
        var reader = new FileReader();

        reader.onload = function () {
            var contents = reader.result;
            // try to make table
            app.table.clear().draw();

            app.entries = JSON.parse(contents);

            console.log("Parsed array from file:");
            console.log(contents);
            for (var e in app.entries)
            {
                var entry = app.entries[e];
                if (entry.wordClass === "Noun")
                    var displayedSwedish = entry.swedishDictionaryForm.article + " " + entry.swedishDictionaryForm.value;
                else
                    var displayedSwedish = entry.swedishDictionaryForm;

                var prettifiedOptionalForms = app.prettifyOptionalWordForms(entry.additionalForms);
                app.table.row.add([displayedSwedish, entry.pronunciation, entry.definition, entry.wordClass, prettifiedOptionalForms]).draw();
            }
            app.table.draw();
        };

        reader.readAsText(file);
    } else {
        alert("File not supported");
    }
};




jQuery.fn.dataTableExt.oSort['string-case-asc'] = function (x, y) {
    x = x.replace(/\(?(en|ett)\)? /i, "");
    y = y.replace(/\(?(en|ett)\)? /i, "");
    console.log(x + " " + y);
    return x.localeCompare(y, 'sv');
};

if (typeof String.prototype.startsWith !== 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) === 0;
    };
}
