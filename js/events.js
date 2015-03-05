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

    $("#importButton").on("click", function () {
        if (!confirm("This will overwrite the current entry table. Continue?"))
            return;
        $("#fileInput").click();
    });


    $("#fileInput").change(app.tryParseFile);

    $("#filterBox").keyup(function () {
        app.table.search($(this).val()).draw();
    });

    $('html').keyup(function (e) {
        if (e.keyCode === 46)
            deleteEntries();
    });

    

});
