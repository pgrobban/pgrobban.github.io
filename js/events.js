$(document).ready(function () {


    $("#wordClass").change(function () {
        var currentWordClass = $("#wordClass").val();
        $("#dictionaryFormTips").html(app.wordClassDictionaryFormTips[currentWordClass]);
        app.setupOptionalFormLabelsAndInputs(app.wordClassOptionalForms[currentWordClass]);
    });

    $('#glosTable tbody').on('click', 'tr', function () {
        app.toggleSelectedRow.call(this);
    });

    $('#glosTable tbody').on('dblclick', 'tr', function () {
        $(this).addClass('selected');
        app.openEditEntryDialog();
    });


    $("#newEntryButton").on("click", app.openNewEntryDialog);
    $("#editEntryButton").on("click", app.openEditEntryDialog);
    $("#deleteEntriesButton").on("click", app.deleteEntries);
    $("#exportButton").on('click', app.exportEntriesAsJSON);

    $("#importButton").on("click", function () {
        if (app.entries.length > 0)
            if (!confirm("This will overwrite the current entry table. Continue?"))
                return;
        $("#fileInput").click();
    });


    $("#fileInput").change(app.tryParseJSONFile);

    $("#filterBox").keyup(function () {
        app.table.search($(this).val()).draw();
    });

    $('html').keyup(function (e) {
        if (e.keyCode === 46)
            deleteEntries();
    });

    // key events
    Mousetrap.bind('mod+n', function () {
        app.openNewEntryDialog();
        return false;
    });



});
