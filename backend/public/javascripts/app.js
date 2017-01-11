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
    var normalcontainer = $('#normal-container');
    var mainsection = $('#main-section');
    var normalsection = $('#normal-section');
    var socket = io.connect('http://localhost:8080'); // Make it connect to port 8080 instead because that is where socket.io is located

    // Function that adds preview card
    var addPreviewCard = function (card) {

        if (card.images[0] != "#") {

        }
        var tags = '';
        for (var i = 0; i < card.tags.length; i++) {
            var tag = `<label>${card.tags[i]}</label>`;
            tags += tag;
        }
        var previewBox = ``;
        if (card.images[0] != undefined) {
            previewBox = `<div class="preview-box">
                <img src="${card.images[0]}"/>
            </div>`
        }

        var container = `<div class="preview-container" id="${card._id}">
            <div class="title">
                ${card.title === "" ? "Untitled" : card.title}
            </div>
            <div class="author">
                ${card.author === undefined ? "Somebody" : card.author.name}
            </div>
            <div class="tags">
                ${tags}
            </div>
            <div class="text-field">
                <p>${card.body}</p>
            </div>
            ${previewBox}
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

    // Clears edit container content
    var clearEditContainerContent = function () {
        $('#add-tag').val("");
        $('#new-card-title').val("");
        $('#new-card-author').text("");
        $('#new-card-notes').val("");
        $('#new-card-notes').attr("rows", 10);
        $('#new-card-tags label').remove();
        $('#upload-file').val("");
        $('.picture').addClass('hide');
        $('#uploaded-img').attr("src", "#");
        tagHolder = [];
        console.log('Card cleared!');
    }

    // Hides the modal
    var hideModal = function() {
         console.log('Done with the card!');
         editcontainer.addClass('hide');
         clearEditContainerContent();
         normalsection.empty();
         normalsection.addClass('hide');
         mainsection.removeClass('darken');
     }

    // Load and render the cards on the server
    var render = function() {
        $.ajax({
            url: "http://localhost:3000/api",
            type: "GET",
            success: function (response) {
                console.log(response.data);
                response.data.map(function (card) {
                    $('#preview-cards-div').append(addPreviewCard(card));
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

    // Load the cards and messages on page load
    render();
    renderMessages();

    // Click on register
    $('#top .register').on('click', function() {
        console.log('Creating a new account!');
        $('#login-form').addClass('hide');
        $('#register-form').removeClass('hide');
        mainsection.addClass('darken');
    });

    // Click on login
    $('#top .login').on('click', function() {
        console.log('Logging in!');
        $('#register-form').addClass('hide');
        $('#login-form').removeClass('hide');
        mainsection.addClass('darken');
    });

    // Search
    $('#top .search-bar').on('keyup', function() {
        console.log('Searching for something!');
        var criteria = $('#top .search-bar').val();

        // Return main section to full state when search field is cleared
        if (criteria.length === 0) render();
        else if (criteria.length < 3) return; // Mongo does not accept text queries of less than 3
        else {
            $('#preview-cards-div').empty();
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
                        $('#preview-cards-div').append(addPreviewCard(card));
                    });
                }
            });
        }

    });

    // Adding a new card, brings up edit container
    $('#add-card-button').on('click', function () {
        console.log('Adding a new card!');
        editcontainer.removeClass('hide');
        // $('#new-card-author').text(currentUser);
        mainsection.addClass('darken');
    });

    var readURL = function(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#uploaded-img').attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        }
    };

    $('#upload-file').change(function() {
        $('#new-card-notes').attr('rows', 5);
        $('.picture').removeClass('hide');
        readURL(this);
    });

    // Upload and create cards or edit them
    $('.edit-container .save-button').on('click', function () {
        var cardID = idHolder;
        // If the card id is empty, means that this is adding not editing
        if (cardID === '') {
            var newCardTitle = $('#new-card-title').val();
            var newCardNotes = $('#new-card-notes').val();
            var newCardImg = [];
            newCardImg.push($('#uploaded-img').attr('src'));
            var newCardObj = {
                title: newCardTitle,
                body: newCardNotes,
                images: newCardImg,
                tags: tagHolder
            };

            console.log('New card created!');
            console.log(newCardObj.images);

            $.ajax({
                url: "http://localhost:3000/api",
                data: newCardObj,
                type: "POST",
                traditional: true,
                success: function (response) {
                    console.log(response.data);
                    $('#preview-cards-div').append(addPreviewCard(response.data));
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

        // Else then we are editing the card
        else {
            var newTitle = $('#new-card-title')[0].value;
            var newNotes = $('#new-card-notes')[0].value;
            var newCardImg = [];
            newCardImg.push($('#uploaded-img').attr('src'));
            var idToPatch = cardID;
            console.log(idToPatch);
            $.ajax({
                url: "http://localhost:3000/api/" + idToPatch,
                data: {
                    title: newTitle,
                    body: newNotes,
                    images: newCardImg,
                    tags: tagHolder,
                },
                type: "PATCH",
                traditional: true,
                success: function(response) {
                    console.log(response.data);

                    // Hide and empty the content of the card
                    clearEditContainerContent();
                    editcontainer.addClass('hide');

                    // Remove the modal
                    mainsection.removeClass('darken');

                    for (var i = 0; i < cards[0].data.length; i++) {
                         if (cards[0].data[i]._id === idHolder) {
                             cards[0].data[i].title = response.data.title;
                             cards[0].data[i].tags = response.data.tags;
                             cards[0].data[i].images = response.data.images;
                             cards[0].data[i].body = response.data.body;
                         }
                    }
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

            var label = $('<label>');
            label.text($('#add-tag').val());
            console.log($('#add-tag').val());
            tagHolder.push($('#add-tag').val());

            $('#new-card-tags').prepend(label);
            $('#add-tag').val("");
        }
    });

    // Remove tags
    $('#new-card-tags').on('click', 'label', function () {
        console.log('Removed a tag!');
        var index = tagHolder.indexOf(this.textContent);
        tagHolder.splice(index, 1);
        $(this).remove();
    });

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
                if ((cards[0].data)[i].title != '') {
                    title = (cards[0].data)[i].title;
                }
                else {
                    title = 'Untitled';
                }
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

        hideModal();
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
        var title, author, images, tags, notes;

        console.log(idHolder);

        for (var i = 0; i < cards[0].data.length; i++) {
            if (cards[0].data[i]._id === idHolder) {
                console.log((cards[0].data)[i]);

                title = (cards[0].data)[i].title;
                if (cards[0].data[i].author != null) {
                    author = (cards[0].data)[i].author.name;
                }
                else {
                    author = "Somebody";
                }
                images = (cards[0].data)[i].images;
                tags = (cards[0].data)[i].tags;
                notes = (cards[0].data)[i].body;
                break;
            }
        }

        console.log(tags);

        $('#new-card-title').val(title);
        $('#new-card-author').text(author);
        $('#new-card-notes').attr('rows', 5);
        $('.picture').removeClass('hide');
        if (images) $('#uploaded-img').attr('src', images[0]);

        for (var i = tags.length - 1; i >= 0; i--) {
            var tag = $('<label>');
            tag.text(tags[i]);
            $('#new-card-tags').prepend(tag);
        }

        $('#new-card-notes').val(notes);
    });

    // Normal container exit button
    normalsection.on('click', '#normal-container .exit-button', function() {
        hideModal();
    });

    $('.edit-container .exit-button').on('click', function () {
        hideModal();
    });

    $('.edit-container .cancel-button').on('click', function () {
        hideModal();
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
            },
        });
    });

    // Append to the message feed after listening for the chat message event
    socket.on('chat message', function(msg) {
        console.log(addMessageCard(msg));
        $('#message-feed').append(addMessageCard(msg));
    });

 });
