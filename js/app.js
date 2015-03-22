"use strict";

var app = {};

$(document).ready(function () {

    // setup table
    app.table = $('#glosTable').DataTable({
        "order": [[0, "asc"]],
        "iDisplayLength": 25,
        dom: '<"top"i>Trt<"bottom"p><"clear">',
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
    var colvis = new $.fn.dataTable.ColVis(app.table, {
        buttonText: 'Show/hide columns'
    });
    $("#tableMenu").append($(colvis.button()));
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
    for (var wc in app.wordClasses)
    {
        app.wordClassInput.append($("<option/>").val(app.wordClasses[wc]).text(app.wordClasses[wc]));
    }

    app.dialog = $("#dialogForm").dialog({
        autoOpen: false,
        height: 0.85 * $(window).height(),
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
app.ignoreEntriesWhenSorting = true;

app.entries = [];

app.wordClasses = ["Noun", "Verb", "Adjective", "Adverb", "Personal pronoun", "Other pronoun",
    "Conjunction", "Interjection", "Preposition", "Numeral", "Phrase/Expression/Proverb", "Other"];

app.wordClassDictionaryFormTips = {};
app.wordClassDictionaryFormTips["Noun"] = "The dictionary form of a noun is the indefinite singular form. (<i>en/ett</i> ~)";
app.wordClassDictionaryFormTips["Verb"] = "The dictionary form of a verb is the infinitive form.";
app.wordClassDictionaryFormTips["Adjective"] = "The dictionary form of an adjective is the positive <i>en</i>-form.";
app.wordClassDictionaryFormTips["Personal pronoun"] = "The dictionary form of a personal pronoun is the subject form.";
app.wordClassDictionaryFormTips["Numeral"] = "The dictionary form of a numeral is the cardinal form.";

app.wordClassAdditionalForms = {};
app.wordClassAdditionalForms["Noun"] = ["Definite singular", "Indefinite plural", "Definite plural",
    "Genitive indefinite singular", "Genitive definite singular", "Genitive indefinite plural", "Genitive definite plural"];
app.wordClassAdditionalForms["Verb"] = ["Present tense", "Past tense", "Perfect tense", "Imperative mood",
    "Passive present tense", "Passive past tense", "Passive perfect tense", "Particip", "Perfekt particip"];
app.wordClassAdditionalForms["Adjective"] = ["Positive neuter", "Positive definite", "Positive definite masculine",
    "Comparative", "Superlative", "Definite superlative", "Definite superlative masculine"];
app.wordClassAdditionalForms["Personal pronoun"] = ["Object form", "Possessive common", "Possessive neuter", "Possessive plural"];
app.wordClassAdditionalForms["Phrase/Expression/Proverb"] = ["Literal meaning"];
app.wordClassAdditionalForms["Numeral"] = ["Ordinal form", "Ordinal definite", "Ordinal definite masculine"];

app.wordClassAdditionalFormTips = {};
app.wordClassAdditionalFormTips["Past tense"] = "(preterite)";
app.wordClassAdditionalFormTips["Perfect tense"] = "(supine)";
app.wordClassAdditionalFormTips["Positive neuter"] = "<i>ett</i> ~ &lt;noun&gt;";
app.wordClassAdditionalFormTips["Positive definite"] = "<i>den/det/de</i> ~ &lt;noun&gt";
app.wordClassAdditionalFormTips["Positive definite masculine"] = "<i>den</i> ~ &lt;masc. noun&gt";
app.wordClassAdditionalFormTips["Comparative"] = "<i>en/ett/den/det/de</i> ~ + &lt;noun&gt;";
app.wordClassAdditionalFormTips["Superlative"] = " <i>är ~</i>";
app.wordClassAdditionalFormTips["Definite superlative"] = "<i>den/det/de</i> ~ &lt;noun&gt";
app.wordClassAdditionalFormTips["Definite superlative masculine"] = "<i>den</i> ~ &lt;masc. noun&gt";
app.wordClassAdditionalFormTips["Possessive common"] = "(someone's &lt;en-noun&gt;)";
app.wordClassAdditionalFormTips["Possessive neuter"] = "(someone's &lt;ett-noun&gt;)";
app.wordClassAdditionalFormTips["Possessive plural"] = "(someone's &lt;pl. noun&gt;)";
app.wordClassAdditionalFormTips["Ordinal definite"] = "<i>den/det/de</i> ~ &lt;noun&gt;";
app.wordClassAdditionalFormTips["Ordinal definite masculine"] = "<i>den</i> ~ &lt;masc. noun&gt;";



app.openNewEntryDialog = function () {
    app.editingMode = false;
    app.dialog.dialog("option", "buttons", [
        {
            text: "Done",
            click: app.addEntry
        }
    ]);
    $("#mandatoryData, #optionalData").hide();
    $("#dictionaryFormTips").text("");
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


app.getInputDataAsEntry = function ()
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
    newEntry.additionalForms = app.getAdditionalWordForms();
    console.log("Got entry: ");
    console.log(newEntry);
    return newEntry;
};


app.addEntry = function ()
{
    var valid = app.validateEntry();
    if (valid)
    {
        var entry = app.getInputDataAsEntry();
        app.entries.push(entry);
        var prettifiedOptionalForms = app.prettifyOptionalWordForms(entry.additionalForms);
        if (entry.wordClass === "Noun")
        {
            if (entry.swedishDictionaryForm.article === "")
                var displayedSwedish = entry.swedishDictionaryForm.value;
            else
                var displayedSwedish = entry.swedishDictionaryForm.article + " " + entry.swedishDictionaryForm.value;
        }
        else
            var displayedSwedish = entry.swedishDictionaryForm;

        app.table.row.add([displayedSwedish, entry.pronunciation, entry.definition, entry.wordClass, prettifiedOptionalForms]).draw();

        $("#nounArticles").hide();
        $("#clearTableButton, #exportButton").attr("disabled", false);
        app.dialog.dialog("close");
    }
};


app.editEntry = function ()
{
    var valid = app.validateEntry();
    if (valid)
    {
        var entry = app.getInputDataAsEntry();
        var selectedRow = app.table.row(".selected");
        var selectedIndex = selectedRow.index();
        console.log("In editEntry");
        console.log(selectedRow);
        console.log(selectedIndex);

        app.entries[selectedIndex] = entry;
        var prettifiedOptionalForms = app.prettifyOptionalWordForms(entry.additionalForms);
        if (entry.wordClass === "Noun")
            var displayedSwedish = entry.swedishDictionaryForm.article + " " + entry.swedishDictionaryForm.value;
        else
            var displayedSwedish = entry.swedishDictionaryForm;
        selectedRow.data([displayedSwedish, entry.pronunciation, entry.definition, entry.wordClass, prettifiedOptionalForms]).draw();

        $("#exportButton").attr("disabled", false);
        $("#nounArticles").hide();
        app.dialog.dialog("close");
    }
};



app.prettifyOptionalWordForms = function (inputOptionalForms)
{
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
    var selectedIndex = app.table.row(".selected").index();
    console.log("Selected index: " + selectedIndex);
    var selectedEntry = app.entries[selectedIndex];
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
    $("#mandatoryData, #optionalData").show();


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
    app.setupAdditionalFormLabelsAndInputs(app.wordClassAdditionalForms[wordClass]);
    app.setAdditionalFormsToInputs(selectedEntry.additionalForms);

    app.dialog.dialog("open");
    app.dialog.dialog("option", "title", "Edit entry");
};

app.wordClassChanged = function (currentWordClass)
{
    $("#mandatoryData, #optionalData").show("medium");
    $("#dictionaryFormTips").html(app.wordClassDictionaryFormTips[currentWordClass]);
    if (currentWordClass === "Noun")
    {
        $("#nounArticles").show();
        $("#nounArticles").focus();
    }
    else
    {
        $("#nounArticles").hide();
        app.swedishDictionaryFormInput.focus();
    }

    if (currentWordClass === "Verb")
    {
        app.swedishDictionaryFormInput.val("att ").focus();
    }
    else
    {
        if (app.swedishDictionaryFormInput.val() === "att ")
            app.swedishDictionaryFormInput.val("");
    }

    app.setupAdditionalFormLabelsAndInputs(app.wordClassAdditionalForms[currentWordClass]);
};

app.setAdditionalFormsToInputs = function (additionalForms)
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
    if (o.val() === null || o.val === "-") { // - is hack for noun article
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

app.getAdditionalWordForms = function ()
{
    var inputOptionalFormsArrayOfObjects = [];

    var currentWordClassOptionalForms = app.wordClassAdditionalForms[app.wordClassInput.val()];

    for (var form in currentWordClassOptionalForms)
    {
        var additionalForm = {};
        additionalForm.name = currentWordClassOptionalForms[form];
        additionalForm.value = $("#additionalForms input").eq(form).val();
        inputOptionalFormsArrayOfObjects.push(additionalForm);
    }

    return inputOptionalFormsArrayOfObjects;
};

app.setupAdditionalFormLabelsAndInputs = function (additionalForms)
{
    if (additionalForms === undefined) // can happen if the word class does not have additional forms
        return;

    var additionalFormsDiv = $("#additionalForms");
    additionalFormsDiv.empty();

    if (additionalForms.length > 0)
        additionalFormsDiv.append("<h3 class='formHeader'>Inflections/Additional forms</h3>");

    for (var wco in additionalForms)
    {
        var formName = additionalForms[wco];

        var formLabel = $("<label>").attr("for", formName).text(formName);
        formLabel.append($("<span>")
                .addClass("fieldTips")
                .html(app.wordClassAdditionalFormTips[formName]));
        additionalFormsDiv.append(formLabel);

        additionalFormsDiv.append($("<input>").attr({
            type: "text",
            name: formName,
            id: formName,
            class: "text ui-widget-content ui-corner-all"
        }));
    }
};

app.exportEntriesAsJSON = function ()
{
    var blob = new Blob([JSON.stringify(app.entries, null, '\t')], {type: "text/plain;charset=UTF-8"});
    var url = window.URL.createObjectURL(blob);
    console.log(url);

    // hacky
    var a = document.createElement('a');
    a.download = "My word list.txt";
    a.href = url;
    a.click();
};

app.tryParseJSONFile = function ()
{

    // try to read file
    var file = document.getElementById('fileInput').files[0];
    console.log(file.type);
    var textType = /text\/plain.*/;

    if (file.type.match(textType)) {
        var reader = new FileReader();

        reader.onload = function () {
            var contents = reader.result;
            // try to make table
            app.table.clear().draw();

            var entries = JSON.parse(contents);
            console.log("Parsed array from file:");
            console.log(entries);

            app.populateTableFromArray(entries);

            $("#clearTableButton").attr("disabled", false);
        };

        reader.readAsText(file);
    } else {
        alert("File not supported");
    }
};

app.populateTableFromArray = function (entries)
{
    app.entries = entries;
    for (var e in app.entries)
    {
        var entry = app.entries[e];
        if (entry.wordClass === "Noun")
        {
            if (entry.swedishDictionaryForm.article === "")
                var displayedSwedish = entry.swedishDictionaryForm.value;
            else
                var displayedSwedish = entry.swedishDictionaryForm.article + " " + entry.swedishDictionaryForm.value;
        }
        else
            var displayedSwedish = entry.swedishDictionaryForm;

        var prettifiedOptionalForms = app.prettifyOptionalWordForms(entry.additionalForms);
        app.table.row.add([displayedSwedish, entry.pronunciation, entry.definition, entry.wordClass, prettifiedOptionalForms]).draw();
    }
    app.table.draw();
};


jQuery.extend(jQuery.fn.dataTableExt.oSort, {
    "string-pre": function (a) {
        a = a.toLowerCase();
        if (!app.ignoreEntriesWhenSorting)
            return a.replace("(", "").replace(")", "");
        else
            return a.replace(/\(?(en|ett|att)\)? /i, "");
    },
    "string-asc": function (a, b) {
        return a.localeCompare(b, 'sv');
    },
    "string-desc": function (a, b) {
        return b.localeCompare(a, "sv");
    }
});



if (typeof String.prototype.startsWith !== 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) === 0;
    };
}
