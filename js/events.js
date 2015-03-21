"use strict";

$(document).ready(function () {

    // closing confirmation
    var myEvent = window.attachEvent || window.addEventListener;
    var chkevent = window.attachEvent ? 'onbeforeunload' : 'beforeunload'; /// make IE7, IE8 compitable
    myEvent(chkevent, function (e) { // For >=IE7, Chrome, Firefox
        var confirmationMessage = 'Are you sure to leave the page? All unsaved changes will be lost.';  // a space
        (e || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
    });


    $("#wordClass").change(function () {
        var currentWordClass = $("#wordClass").val();
        app.wordClassChanged(currentWordClass);
    });

    $("#ignoreArticlesWhenSorting").change(function () {
        app.ignoreEntriesWhenSorting = $("#ignoreArticlesWhenSorting").is(':checked');
        // force resort - ugly hack
        app.table.rows().remove().draw(false); // clear the table
        app.populateTableFromArray(app.entries); // repopulate it from existing app.entries array
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
    $("#deleteSelectedEntriesButton").on("click", app.deleteSelectedEntries);
    $("#clearTableButton").on("click", app.clearTable);

    $("#exportButton").on('click', app.exportEntriesAsJSON);
    $("#importButton").on("click", function () {
        if (app.entries.length > 0)
            if (!confirm("This will overwrite the current entry table. Continue?"))
                return;
        $("#fileInput").click();
    });

    function errorHandler(error)
    {
        console.log(error);
    }


    $("#fileInput").change(app.tryParseJSONFile);

    $("#filterBox").keyup(function () {
        app.table.search($(this).val()).draw();
    });

    // key events
    Mousetrap.bind('mod+n', function () {
        app.openNewEntryDialog();
        return false;
    });
    Mousetrap.bind("del", app.deleteSelectedEntries);

});
