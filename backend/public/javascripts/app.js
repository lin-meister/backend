/**
 * Created by M on 6/16/2016.
 */

var cards = [

];

// Temporary tag holder, content deleted after upload or cancel
var tagHolder = [];

// Temporary card ID holder
var idHolder = '';

$(document).ready(function() {
    var editcontainer = $('.edit-container');
    var previewcontainer = $('.preview-container');
    var normalcontainer = $('.normal-container');
    var counter = 0;
    var socket = io.connect('http://localhost:8080'); // Make it connect to port 8080 instead because that is where socket.io is located

    /*Time stuff*/
    var d = new Date();
    var month = (d.getMonth() + 1) + "";
    if (month.length === 1) month = "0" + month;
    var day = d.getDate() + "";
    if (day.length === 1) day = "0" + day;

    var dateFormat = (month) + "-" + day + "-" + d.getFullYear();

    // Function that adds preview card
    var addPreviewCard = function (card) {
        console.log(card);
        // Create the holding container
        var container = $('<div/>');
        container.addClass('preview-container');
        container.attr('id', card._id);

        // Create the title. If title is not filled out by user set as Untitled
        var title = $('<div/>');
        title.addClass('title');
        if (card.title === "")
            title.text("Untitled");
        else
            title.text(card.title);

        // Create author
        var author = $('<div/>');
        author.addClass('author');
        if (card.author != null)
            author.text(card.author.name); // Will be made to user's id

        // Create tags
        var tags = $('<div/>');
        tags.addClass('tags');

        // Append the tags
        console.log(card.tags);
        for (var j = 0; j < card.tags.length; j++) {
            var tag = $('<label>');
            tag.text(card.tags[j]);
            tags.append(tag);
        }

        // Create the textfield that contains all the notes
        var textField = $('<div/>');
        textField.addClass('text-field');
        var notes = $('<p>');
        notes.text(card.body);
        textField.append(notes);

        // Preview image, add later
        var preview = $('<div/>');
        preview.addClass('preview hide');
        var previewImage = $('<img src="http://www.euractiv.com/wp-content/themes/euractiv_base/media/placeholder.png"/>');
        preview.append(previewImage);

        // Create the date
        var date = $('<div/>');
        date.addClass('date');
        date.text(card.createdAt);

        // Append the elements to construct the container
        container.append(title);
        container.append(author);
        container.append(tags);
        container.append(textField);
        container.append(preview);
        container.append(date);

        counter++;

        return container;
    }

    // Adds message card
    var addMessageCard = function (msg) {
        var message = $('<div/>');
        message.addClass('message');

        var dateCreated = $('<p>');
        dateCreated.text(msg.createdAt);

        var heading = $('<h1>');
        heading.text("Message");

        var content = $('<p>');
        content.addClass('message-content');
        content.text(msg.body);

        message.append(dateCreated);
        message.append(heading);
        message.append(content);

        return message;
    };

    // Load and render the cards on the server
    var render = function() {
        $.ajax({
            url: "http://localhost:3000/api",
            type: "GET",
            success: function (response) {
                console.log(response.data);
                response.data.map(function (card) {
                    $('#main-section').append(addPreviewCard(card));
                });
                cards.push(response);
            }
        });
    }

    var renderMessages = function() {
        $.ajax({
            url: "http://localhost:3000/messages",
            type: "GET",
            success: function (response) {
                socket.emit('connected', response.data.body);

                // Append every message to the message feed
                socket.on('connected', function(msg) {
                    response.data.map(function(msg) {
                        $('.message-feed').append(addMessageCard(msg));
                    });
                });
            }
        });
    }

    render();
    renderMessages();

    // Click on register
    $('#top .register').on('click', function() {
        console.log('Creating a new account!');
        $('#login-form').addClass('hide');
        $('#register-form').removeClass('hide');
        $('#main-section').addClass('darken');
    });

    $('#top .login').on('click', function() {
        console.log('Logging in!');
        $('#register-form').addClass('hide');
        $('#login-form').removeClass('hide');
        $('#main-section').addClass('darken');
    });

    $('#top .search-bar').on('keyup', function() {
        console.log('Searching for something!');
        var criteria = $('#top .search-bar').val();

        if (criteria.length < 3) return; // Mongo does not accept text queries of less than 3
        else {
            $('#main-section').empty();
            $.ajax({
                url: "http://localhost:3000/api/search",
                data: {
                    title: criteria
                },
                type: "GET",
                traditional: true,
                success: function (response) {
                    console.log(response.data);
                    response.data.map(function(card) {
                        $('#main-section').append(addPreviewCard(card));
                    });
                }
            });
        }

    });

    // Adding a new card, brings up edit container
    $('#add-card-button').on('click', function () {
        console.log('Adding a new card!');
        editcontainer.removeClass('hide');
        $('#main-section').addClass('darken');
    });

    // Upload and create cards
    $('.edit-container .save-button').on('click', function () {
        var container = $(this).parent().parent().parent()[0];
        var cardID = idHolder;
        if (cardID === '') {
            var newCardTitle = document.querySelector('#new-card-title').value;
            var newCardNotes = document.querySelector('#new-card-notes').value;
            var newCardObj = {
                title: newCardTitle,
                body: newCardNotes,
                tags: tagHolder
            };

            cards[0].data.push(newCardObj);
            console.log('New card created!');

            $.ajax({
                url: "http://localhost:3000/api",
                data: newCardObj,
                type: "POST",
                traditional: true,
                success: function (response) {
                    console.log(response.data);
                    $('#main-section').append(addPreviewCard(response.data));
                }
            });

            tagHolder = [];

            // Hide and empty the content of the card
            editcontainer.addClass('hide');
            clearEditContainerContent();

            // Remove the modal
            $('#main-section').removeClass('darken');
        }

        else {
            var newTitle = $('#new-card-title')[0].value;
            var newTags = tagHolder;
            var newNotes = $('#new-card-notes')[0].value;
            var idToPatch = cardID;
            console.log(idToPatch);
            $.ajax({
                url: "http://localhost:3000/api/" + idToPatch,
                data: {
                    title: newTitle,
                    tags: newTags,
                    body: newNotes
                },
                type: "PATCH",
                traditional: true,
                success: function(response) {
                    // Hide and empty the content of the card
                    clearEditContainerContent();
                    editcontainer.addClass('hide');

                    tagHolder = [];
                    // Remove the modal
                    $('#main-section').removeClass('darken');

                    var newPreview = addPreviewCard(response.data);
                    $('#' + idToPatch).replaceWith(newPreview);
                    idHolder = '';

                },
            });
        }

    });

    // Add tags
    $('#new-card-tags').on('keydown', function (event) {
        if (event.keyCode === 13) {
            console.log('Adding a new tag!');
            var card = {};

            for (var i = 0; i < cards[0].data.length; i++) {
                if (editcontainer.id = cards[0].data[i]._id) {
                    card = cards[0].data[i];
                }
            }

            var label = $('<label>');
            label.text(document.querySelector('#add-tag').value);
            tagHolder.push(document.querySelector('#add-tag').value);
            card.tags.push(document.querySelector('#add-tag').value);

            $('#new-card-tags').prepend(label);
            document.querySelector('#add-tag').value = "";
        }
    });

    // Remove tags
    $('#new-card-tags').on('click', 'label', function () {
        console.log('Removed a tag!');
        var card = {};

        for (var i = 0; i < cards[0].data.length; i++) {
            if (editcontainer.id = cards[0].data[i]._id) {
                card = cards[0].data[i];
            }
        }

        var index = tagHolder.indexOf(this.textContent);
        tagHolder.splice(index, 1);
        index = card.tags.indexOf(this.textContent);
        card.tags.splice(index, 1);
        $(this).remove(); // Remove this tag only
        // if (tagHolder.indexOf(this) > -1)
    });

    // Clears edit container content
    var clearEditContainerContent = function () {
        document.querySelector('#new-card-title').value = "";
        document.querySelector('#new-card-notes').value = "";
        $('#new-card-tags label').remove();
        tagHolder = [];
        console.log('Card cleared!');
    }

    // Click on preview container to bring up the full normal containers
    $('#main-section').on('click', '.preview-container', function () {
        idHolder = this.id;
        var mainContainerTags = $(this).find('.tags')[0].children;

        var container = $('<div/>');
        container.addClass('normal-container');

        var title = $('<div/>');
        title.addClass('title');
        title.attr('id', 'normal-container-title');
        title.text($(this).find('.title')[0].textContent);

        var author = $('<div/>');
        author.addClass('author');
        // Will change author text later
        author.text($(this).find('.author')[0].textContent);

        var tags = $('<div/>');
        tags.addClass('tags');
        for (var i = 0; i < mainContainerTags.length; i++) {
            var tag = $('<label>');
            tag.text(mainContainerTags[i].textContent);
            tags.append(tag);
            console.log(tag);
            tagHolder.push(tag[0].textContent);
        }

        var exit = $('<div/>');
        exit.addClass('exit');
        var exitButton = $('<button>');
        exitButton.addClass('exit-button');
        exitButton.text('X');
        exit.append(exitButton);

        var textField = $('<div/>');
        textField.addClass('text-field');
        var notes = $('<p>');
        notes.addClass('notes');
        notes.text($(this).find('.text-field')[0].textContent);
        textField.append(notes);

        var buttons = $('<div/>');
        buttons.addClass('button-list');
        var downloadButton = $('<button>');
        downloadButton.addClass('action-button download-button');
        downloadButton.text('DOWNLOAD');
        var editButton = $('<button>');
        editButton.addClass('action-button edit-button');
        editButton.text('EDIT');
        var deleteButton = $('<button>');
        deleteButton.addClass('action-button delete-button');
        deleteButton.text('DELETE');

        buttons.append(downloadButton);
        buttons.append(editButton);
        buttons.append(deleteButton);

        container.append(title);
        container.append(author);
        container.append(tags);
        container.append(textField);
        container.append(exit);
        container.append(buttons);

        $('#normal-section').append(container);
        $('#normal-section').removeClass('hide');
        $('#main-section').addClass('darken');
    });

    // Normal container delete the card, removes the preview container
    $('#normal-section').on('click', '.normal-container .delete-button', function () {
        console.log(idHolder);
        var idToDelete = idHolder;
        $.ajax({
            url: "http://localhost:3000/api/" + idToDelete,
            type: "DELETE",
            success: function(response) {
                console.log("Card deleted!");
                $('#' + idToDelete).remove();
                idHolder = '';
                tagHolder = [];
            },
        })

        normalcontainer.addClass('hide');
        $('#normal-section').empty();
        $('#main-section').removeClass('darken');
    });

    // Normal container edit the card, brings up edit container
    $('#normal-section').on('click', '.normal-container .edit-button', function () {
        editcontainer.removeClass('hide');
        $('#main-section').addClass('darken');
        $('#normal-section').empty();
        $('#normal-section').addClass('hide');
        var title;
        var tags;
        var notes;

        for (var i = 0; i < cards[0].data.length; i++) {
            if (cards[0].data[i]._id === idHolder) {
                console.log((cards[0].data)[i]);

                title = (cards[0].data)[i].title;
                tags = (cards[0].data)[i].tags;
                console.log(tags);
                notes = (cards[0].data)[i].body;
                break;
            }
        }

        console.log(title);
        console.log(tags);
        console.log(notes);

        $('#new-card-title').val(title);
        $('#new-card-title').attr('value', title);

        for (var i = tags.length - 1; i >= 0; i--) {
            var tag = $('<label>');
            tag.text(tags[i]);
            console.log(tag);
            $('#new-card-tags').prepend(tag);
        }

        $('#new-card-notes').val(notes);
        $('#new-card-notes').value = notes;
    });

    // Normal container exit button
    $('#normal-section').on('click', '.normal-container .exit-button', function() {
        idHolder = '';
        $('#normal-section').empty();
        $('#normal-section').addClass('hide');
        $('#main-section').removeClass('darken');
    });

    $('.edit-container .exit-button').on('click', function () {
        console.log('Done with the card!');
        editcontainer.addClass('hide');
        clearEditContainerContent();
        $('#normal-section').empty();
        $('#normal-section').addClass('hide');
        idHolder = '';
        $('#main-section').removeClass('darken');
    });

    $('.edit-container .cancel-button').on('click', function () {
        console.log('Done with the card!');
        editcontainer.addClass('hide');
        clearEditContainerContent();
        $('#normal-section').empty();
        $('#normal-section').addClass('hide');
        idHolder = '';
        $('#main-section').removeClass('darken');
    });

    $('#register-form .exit-button').on('click', function () {
        console.log('Done with registering');
        $('#register-form').addClass('hide');
        $('#main-section').removeClass('darken');
    });

    $('#login-form .exit-button').on('click', function () {
        console.log('Done with logging in!');
        $('#login-form').addClass('hide');
        $('#main-section').removeClass('darken');
    });

    // Submit messages to the chat
    $('.chat .text-field .submit-button').on('click', function () {
        var body = document.querySelector('.chat textarea').value;
        $.ajax({
            url: "http://localhost:3000/messages",
            data: {
                title: 'Message',
                body: body
            },
            type: "POST",
            traditional: true,
            success: function(response) {
                // Broadcast the message
                socket.emit('chat message', response.data.body);
                document.querySelector('.chat textarea').value = "";
                console.log(response.data);

                // Append to the message feed after listening for the chat message event
                socket.on('chat message', function(msg) {
                    $('.message-feed').append(addMessageCard(response.data.body));
                });
            },
        });
        console.log(body);
    });
});