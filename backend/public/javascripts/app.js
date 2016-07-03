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
    var normalcontainer = $('#normal-container');
    var mainsection = $('#main-section');
    var normalsection = $('#normal-section');
    var socket = io.connect('http://localhost:8080'); // Make it connect to port 8080 instead because that is where socket.io is located

    // Function that adds preview card
    var addPreviewCard = function (card) {
        var title;
        if (card.title === "")
            title = "Untitled";
        else
            title = card.title;

        var tags = '';
        for (var i = 0; i < card.tags.length; i++) {
            var tag = `<label>${card.tags[i]}</label>`;
            tags += tag;
        }

        var container = `<div class="preview-container" id="${card._id}">
            <div class="title">
                ${card.title === "" ? "Untitled" : card.title}
            </div>
            <div class="author">
                ${card.author === undefined ? "" : card.author.name}
            </div>
            <div class="tags">
                ${tags}
            </div>
            <div class="text-field">
                <p>${card.body}</p>     
            </div>
            <div class="date">
                 ${moment(card.createdAt).format('MMMM Do YYYY, h:mm:ss a')}
            </div>
        </div>`

        return container;
    }

    // Adds message card
    var addMessageCard = function (msg) {
        var author = '';
        if (msg.author != null) {
            author = msg.author.name;
        }
        else {
            author = 'Somebody';
        }
        var message = `<div class = "message">
            <p class = "message-description"><em>${author + ' on ' + moment(msg.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</em></p>
            <p class = "message-content"><strong>${msg.body}</strong></p>
            </div>`

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
                    mainsection.append(addPreviewCard(card));
                });
                cards.push(response);
            }
        });
    }

    // Load and render the messages on the server
    var renderMessages = function() {
        $.ajax({
            url: "http://localhost:3000/messages",
            type: "GET",
            success: function (response) {
                socket.emit('connected', response.data.body);

                // Append every message to the message feed
                socket.on('connected', function(msg) {
                    response.data.map(function(msg) {
                        $('#message-feed').append(addMessageCard(msg));
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
        mainsection.addClass('darken');
    });

    $('#top .login').on('click', function() {
        console.log('Logging in!');
        $('#register-form').addClass('hide');
        $('#login-form').removeClass('hide');
        mainsection.addClass('darken');
    });

    $('#top .search-bar').on('keyup', function() {
        console.log('Searching for something!');
        var criteria = $('#top .search-bar').val();

        if (criteria.length < 3) return; // Mongo does not accept text queries of less than 3
        else {
            mainsection.empty();
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
                        mainsection.append(addPreviewCard(card));
                    });
                }
            });
        }

    });

    // Adding a new card, brings up edit container
    $('#add-card-button').on('click', function () {
        console.log('Adding a new card!');
        editcontainer.removeClass('hide');
        mainsection.addClass('darken');
    });

    // Upload and create cards
    $('.edit-container .save-button').on('click', function () {
        var container = $(this).parent().parent().parent()[0];
        var cardID = idHolder;
        if (cardID === '') {
            var newCardTitle = $('#new-card-title').val();
            var newCardNotes = $('#new-card-notes').val();
            var newCardObj = {
                title: newCardTitle,
                body: newCardNotes,
                tags: tagHolder
            };

            console.log('New card created!');

            $.ajax({
                url: "http://localhost:3000/api",
                data: newCardObj,
                type: "POST",
                traditional: true,
                success: function (response) {
                    console.log(response.data);
                    mainsection.append(addPreviewCard(response.data));
                    cards[0].data.push(response.data);
                }
            });

            tagHolder = [];

            // Hide and empty the content of the card
            editcontainer.addClass('hide');
            clearEditContainerContent();

            // Remove the modal
            mainsection.removeClass('darken');
        }

        else {
            var newTitle = $('#new-card-title')[0].value;
            var newNotes = $('#new-card-notes')[0].value;
            var idToPatch = cardID;
            console.log(idToPatch);
            $.ajax({
                url: "http://localhost:3000/api/" + idToPatch,
                data: {
                    title: newTitle,
                    tags: tagHolder,
                    body: newNotes
                },
                type: "PATCH",
                traditional: true,
                success: function(response) {
                    // Hide and empty the content of the card
                    clearEditContainerContent();
                    editcontainer.addClass('hide');

                    // tagHolder = [];

                    // Remove the modal
                    mainsection.removeClass('darken');

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
                    break;
                }
            }

            var label = $('<label>');
            label.text($('#add-tag').val());
            console.log($('#add-tag').val());
            tagHolder.push($('#add-tag').val());

            $('#new-card-tags').prepend(label);
            $.querySelector('#add-tag').val("");
        }
    });

    // Remove tags
    $('#new-card-tags').on('click', 'label', function () {
        console.log('Removed a tag!');
        var card = {};

        for (var i = 0; i < cards[0].data.length; i++) {
            if (editcontainer.id = cards[0].data[i]._id) {
                card = cards[0].data[i];
                break;
            }
        }

        var index = tagHolder.indexOf(this.textContent);
        tagHolder.splice(index, 1);
        $(this).remove();
    });

    // Clears edit container content
    var clearEditContainerContent = function () {
        $('#new-card-title').val("");
        $('#new-card-notes').val("");
        $('#new-card-tags label').remove();
        tagHolder = [];
        console.log('Card cleared!');
    }

    // Click on preview container to bring up the full normal containers
    mainsection.on('click', '.preview-container', function () {
        idHolder = this.id;
        var title;
        var author = '';
        var mainContainerTags = '';
        var tags = '';
        var notes;

        for (var i = 0; i < cards[0].data.length; i++) {
            if (cards[0].data[i]._id === idHolder) {
                title = (cards[0].data)[i].title;
                if ((cards[0].data)[i].author != null) {
                    author = (cards[0].data)[i].author.name;
                }
                mainContainerTags = (cards[0].data)[i].tags;
                tagHolder = mainContainerTags;
                notes = (cards[0].data)[i].body;
                break;
            }
        }

        for (var i = 0; i < mainContainerTags.length; i++) {
            var tag = `<label>${mainContainerTags[i]}</label>`;
            tags += tag;
        }

        var container = `<div id = "normal-container">
            <div class="title" id="normal-container-title">${title}</div>
            <div class="author">${author}</div>
            <div class="tags">
                ${tags}
            </div>
            <div class="exit">
                <button class="exit-button">X</button>
            </div>
            <div class="text-field">
                <p class = "notes">${notes}</p>
            </div>
            <div class = "button-list">
                <button class = "action-button download-button">DOWNLOAD</button>
                <button class = "action-button edit-button">EDIT</button>
                <button class = "action-button delete-button">DELETE</button>
            </div>
        </div>`

        normalsection.append(container);
        normalsection.removeClass('hide');
        mainsection.addClass('darken');
    });

    // Normal container delete the card, removes the preview container
    normalsection.on('click', '#normal-container .delete-button', function () {
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
        normalsection.empty();
        mainsection.removeClass('darken');
    });

    // Normal container edit the card, brings up edit container
    normalsection.on('click', '#normal-container .edit-button', function () {
        editcontainer.removeClass('hide');
        mainsection.addClass('darken');
        normalsection.empty();
        normalsection.addClass('hide');
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
    normalsection.on('click', '#normal-container .exit-button', function() {
        idHolder = '';
        normalsection.empty();
        normalsection.addClass('hide');
        mainsection.removeClass('darken');
    });

    $('.edit-container .exit-button').on('click', function () {
        console.log('Done with the card!');
        editcontainer.addClass('hide');
        clearEditContainerContent();
        normalsection.empty();
        normalsection.addClass('hide');
        idHolder = '';
        mainsection.removeClass('darken');
    });

    $('.edit-container .cancel-button').on('click', function () {
        console.log('Done with the card!');
        editcontainer.addClass('hide');
        clearEditContainerContent();
        normalsection.empty();
        normalsection.addClass('hide');
        idHolder = '';
        mainsection.removeClass('darken');
    });

    $('#register-form .exit-button').on('click', function () {
        console.log('Done with registering');
        $('#register-form').addClass('hide');
        mainsection.removeClass('darken');
    });

    $('#login-form .exit-button').on('click', function () {
        console.log('Done with logging in!');
        $('#login-form').addClass('hide');
        mainsection.removeClass('darken');
    });

    // Submit messages to the chat
    $('#chat .submit-button').on('click', function () {
        var body = $('#chat textarea').val();
        console.log(body);

        $.ajax({
            url: "http://localhost:3000/messages",
            data: {
                body: body
            },
            type: "POST",
            traditional: true,
            success: function(response) {
                // Broadcast the message
                socket.emit('chat message', response.data);
                $('#chat textarea').val("");
                console.log(response.data);
                // Append to the message feed after listening for the chat message event
            },
        });
    });

    socket.on('chat message', function(msg) {
        console.log(addMessageCard(msg));
        $('#message-feed').append(addMessageCard(msg));
    });

 });