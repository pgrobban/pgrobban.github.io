$(document).ready(function () {


    $("#wordClass").change(function () {
        var currentWordClass = $("#wordClass").val();
        $("#dictionaryFormTips").html(wordClassDictionaryFormTips[currentWordClass]);
        setupOptionalFormLabelsAndInputs(wordClassOptionalForms[currentWordClass]);
    });

    $('#glosTable tbody').on('click', 'tr', function () {
        toggleSelectedRow.call(this);
    });

    $('#glosTable tbody').on('dblclick', 'tr', function () {
        $(this).addClass('selected');
        openEditEntryDialog();
    });


    $("#newEntryButton").on("click", openNewEntryDialog);


    $("#importButton").on("click", function () {
        if (!confirm("This will overwrite the current entry table. Continue?"))
            return;
        $("#fileInput").click();
    });

    $("#deleteEntriesButton").on("click", deleteEntries);

    $("#fileInput").change(tryParseFile);

    $("#filterBox").keyup(function () {
        table.search($(this).val()).draw();
    });

    $('html').keyup(function (e) {
        if (e.keyCode === 46)
            deleteEntries();
    })

});
