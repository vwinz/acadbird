document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const postCreationCard = document.getElementById('post-creation-card');
    const initialInput = document.getElementById('initial-input');
    const expandedContent = document.getElementById('expanded-content');
    const noteInput = document.getElementById('note-input');
    const typedPostInputs = document.getElementById('typed-post-inputs');
    const postTitleInput = document.getElementById('post-title-input');
    const postDateInput = document.getElementById('post-date-input');
    const postDescriptionInput = document.getElementById('post-description-input');
    const postButton = document.getElementById('post-button');
    const cancelButton = document.getElementById('cancel-button');
    const postFeed = document.getElementById('post-feed');
    const postActionBtns = document.querySelectorAll('.post-action-btn');
    const fileInput = document.getElementById('file-upload');
    const filePreviewContainer = document.getElementById('file-preview-container');
    const eventList = document.getElementById('event-list');
    const reminderList = document.getElementById('reminder-list');
    const taskList = document.getElementById('task-list');

    // Modal elements
    const shareCodeBtn = document.querySelector('.share-code-btn');
    const shareCodeModal = document.getElementById('shareCodeModal');
    const deleteModal = document.getElementById('deleteModal');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const classCodeText = document.getElementById('classCode');

    let postType = 'Note';
    let postToDelete = null;

    // Event listener to expand the card when the initial input is clicked
    initialInput.addEventListener('focus', () => {
        postCreationCard.classList.add('expanded');
        expandedContent.classList.remove('hidden');
        initialInput.classList.add('hidden');
        showInputFields('Note');
    });

    // Event listener for the Cancel button
    cancelButton.addEventListener('click', () => {
        resetPostCard();
    });

    // Handle post type selection
    postActionBtns.forEach(button => {
        button.addEventListener('click', (event) => {
            postActionBtns.forEach(btn => btn.classList.remove('active'));
            event.currentTarget.classList.add('active');
            postType = event.currentTarget.dataset.type;
            showInputFields(postType);
        });
    });

    // Function to show/hide input fields based on post type
    function showInputFields(type) {
        noteInput.classList.add('hidden');
        typedPostInputs.classList.add('hidden');
        noteInput.value = '';
        postTitleInput.value = '';
        postDateInput.value = '';
        postDescriptionInput.value = '';
        fileInput.value = '';
        filePreviewContainer.innerHTML = '';

        if (type === 'Note' || type === 'File') {
            noteInput.classList.remove('hidden');
            noteInput.placeholder = "What's taking place in your classroom?";
            noteInput.focus();
        } else {
            typedPostInputs.classList.remove('hidden');
            postTitleInput.placeholder = `Enter ${type} Title...`;
            postDescriptionInput.placeholder = `Description: What's taking place in your classroom?`;
            postTitleInput.focus();
        }
    }

    // Handle file upload and preview
    fileInput.addEventListener('change', (event) => {
        filePreviewContainer.innerHTML = '';
        const files = event.target.files;
        if (files.length > 0) {
            for (const file of files) {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        filePreviewContainer.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                } else {
                    const fileSpan = document.createElement('span');
                    fileSpan.textContent = file.name;
                    filePreviewContainer.appendChild(fileSpan);
                }
            }
        }
    });

    // Handle post creation
    postButton.addEventListener('click', () => {
        let content = '';
        let title = '';
        let date = '';

        if (postType === 'Note' || postType === 'File') {
            content = noteInput.value.trim();
            title = postType;
        } else {
            title = postTitleInput.value.trim();
            date = postDateInput.value;
            content = postDescriptionInput.value.trim();
        }

        const files = fileInput.files;

        if (title || content || files.length > 0) {
            const newPost = createPostElement(title, content, postType, date, files);
            postFeed.prepend(newPost);
            addPostInteractionListeners(newPost);
            if (postType === 'Event' || postType === 'Reminder' || postType === 'Task') {
                createRightSectionItem(title, date, postType);
            }
            resetPostCard();
        } else {
            alert('Please add some content, a title, or a file to your post.');
        }
    });

    function createPostElement(title, content, type, date, files) {
        const postElement = document.createElement('div');
        postElement.classList.add('card', 'post-feed-card');

        let fileHtml = '';
        if (files.length > 0) {
            const firstFile = files[0];
            if (firstFile.type.startsWith('image/')) {
                const imageUrl = URL.createObjectURL(firstFile);
                fileHtml = `<img src="${imageUrl}" alt="Uploaded image" class="post-image">`;
            } else {
                fileHtml = `<p class="post-text">Attached File: ${firstFile.name}</p>`;
            }
        }

        const now = new Date();
        const timestamp = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

        let additionalDetails = '';
        if (date) {
            const [year, month, day] = date.split('-');
            const formattedDate = `${day}/${month}/${year.slice(2)}`;
            additionalDetails += `<li><i class="fas fa-calendar-alt"></i> Date: ${formattedDate}</li>`;
        }
        if (type === 'Event') {
            additionalDetails += `<li><i class="fas fa-clock"></i> Time: To be announced</li>`;
        }

        const iconMap = {
            'Note': 'fas fa-file-alt',
            'Reminder': 'fas fa-bell',
            'Event': 'fas fa-calendar-alt',
            'Task': 'fas fa-tasks',
            'File': 'fas fa-paperclip'
        };

        const postHtml = `
            <div class="post-info">
                <div class="user-info">
                    <i class="fas fa-user-circle post-avatar"></i>
                    <div>
                        <p class="user-name">Mrs. Juana C. Cruz</p>
                        <p class="class-name">Kinder Lily</p>
                    </div>
                </div>
                <span class="timestamp">${timestamp}</span>
            </div>
            <h3 class="post-title">${title} ${type === 'Event' ? '🎉' : ''}</h3>
            <p class="post-text">${content.replace(/\n/g, '<br>')}</p>
            ${additionalDetails ? `<ul class="post-details">${additionalDetails}</ul>` : ''}
            ${fileHtml}
            <div class="post-footer">
                <div class="post-details">
                    <p class="event-info"><i class="${iconMap[type]}"></i> ${type}</p>
                </div>
                <div class="post-interaction">
                    <button class="like-btn"><i class="fas fa-heart"></i> <span class="like-count">0</span></button>
                    <button class="comment-btn"><i class="fas fa-comment-dots"></i> <span class="comment-count">0</span></button>
                    <div class="more-options-container">
                        <button class="more-btn"><i class="fas fa-ellipsis-h"></i></button>
                        <div class="dropdown-menu hidden">
                            <button class="delete-btn"><i class="fas fa-trash-alt"></i> Delete</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="comments-section">
                <div class="comment-input-container hidden">
                    <input type="text" class="comment-input" placeholder="Write a comment...">
                    <button class="submit-comment-btn">Post</button>
                </div>
                <div class="comments-list"></div>
            </div>
        `;

        postElement.innerHTML = postHtml;
        return postElement;
    }

    // Function to add interaction listeners to a single post element
    function addPostInteractionListeners(postElement) {
        const likeBtn = postElement.querySelector('.like-btn');
        const likeCountSpan = postElement.querySelector('.like-count');
        const commentBtn = postElement.querySelector('.comment-btn');
        const moreBtn = postElement.querySelector('.more-btn');
        const deleteBtn = postElement.querySelector('.delete-btn');
        const dropdownMenu = postElement.querySelector('.dropdown-menu');
        const commentsSection = postElement.querySelector('.comments-section');
        const commentInputContainer = commentsSection.querySelector('.comment-input-container');
        const commentsList = commentsSection.querySelector('.comments-list');
        const commentInput = commentInputContainer.querySelector('.comment-input');
        const submitCommentBtn = commentInputContainer.querySelector('.submit-comment-btn');

        // Toggle dropdown menu for delete button
        moreBtn.addEventListener('click', () => {
            dropdownMenu.classList.toggle('hidden');
        });

        // Hide dropdown if user clicks outside
        document.addEventListener('click', (event) => {
            if (!moreBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.classList.add('hidden');
            }
        });

        // Like button functionality
        likeBtn.addEventListener('click', () => {
            let likes = parseInt(likeCountSpan.textContent);
            if (likeBtn.classList.contains('liked')) {
                likes--;
                likeBtn.classList.remove('liked');
            } else {
                likes++;
                likeBtn.classList.add('liked');
            }
            likeCountSpan.textContent = likes;
        });

        // Comment button functionality
        commentBtn.addEventListener('click', () => {
            commentInputContainer.classList.toggle('hidden');
            if (!commentInputContainer.classList.contains('hidden')) {
                commentInput.focus();
            }
        });

        // Submit comment
        submitCommentBtn.addEventListener('click', () => {
            const commentText = commentInput.value.trim();
            if (commentText) {
                const commentElement = document.createElement('div');
                commentElement.classList.add('comment-item');
                const now = new Date();
                const timestamp = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

                commentElement.innerHTML = `
                    <div class="comment-author">Mrs. Juana C. Cruz</div>
                    <div class="comment-text">${commentText}</div>
                    <div class="comment-timestamp">${timestamp}</div>
                    <button class="delete-comment-btn"><i class="fas fa-times-circle"></i></button>
                `;
                commentsList.appendChild(commentElement);
                commentInput.value = '';

                const commentCountSpan = postElement.querySelector('.comment-count');
                let commentCount = parseInt(commentCountSpan.textContent);
                commentCount++;
                commentCountSpan.textContent = commentCount;

                // Add event listener for the new delete comment button
                commentElement.querySelector('.delete-comment-btn').addEventListener('click', () => {
                    commentElement.remove();
                    let commentCount = parseInt(commentCountSpan.textContent);
                    commentCount--;
                    commentCountSpan.textContent = commentCount;
                });
            }
        });

        // Delete post functionality with modal
        deleteBtn.addEventListener('click', () => {
            postToDelete = postElement;
            deleteModal.classList.remove('hidden');
        });
    }
    
    // Function to handle the right-side section updates
    function createRightSectionItem(title, date, type) {
        const listItem = document.createElement('li');
        let formattedDate = '';
        if (date) {
            const [year, month, day] = date.split('-');
            formattedDate = `${month}/${day}/${year}`;
        }
        const displayTitle = title.length > 25 ? title.substring(0, 22) + '...' : title;

        switch (type) {
            case 'Event':
                listItem.innerHTML = `<p class="event-item">${displayTitle}<br>${formattedDate || 'Date N/A'}<br>Time N/A</p>`;
                eventList.prepend(listItem);
                break;
            case 'Reminder':
                listItem.innerHTML = `<p class="reminder-item">${displayTitle}<br>When: ${formattedDate || 'Date N/A'}</p>`;
                reminderList.prepend(listItem);
                break;
            case 'Task':
                listItem.innerHTML = `<p class="task-item">${displayTitle}<br>When: ${formattedDate || 'Date N/A'}</p>`;
                taskList.prepend(listItem);
                break;
        }
    }

    function resetPostCard() {
        noteInput.value = '';
        postTitleInput.value = '';
        postDateInput.value = '';
        postDescriptionInput.value = '';
        fileInput.value = '';
        filePreviewContainer.innerHTML = '';
        
        expandedContent.classList.add('hidden');
        initialInput.classList.remove('hidden');
        postCreationCard.classList.remove('expanded');
        
        postType = 'Note';
        postActionBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector('.post-action-btn[data-type="Note"]').classList.add('active');
    }

    // Custom Modal Functionality
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.querySelector('.close-btn').addEventListener('click', () => modal.classList.add('hidden'));
        modal.querySelector('.modal-close-btn')?.addEventListener('click', () => modal.classList.add('hidden'));
        modal.querySelector('.modal-cancel-btn')?.addEventListener('click', () => modal.classList.add('hidden'));
    });

    shareCodeBtn.addEventListener('click', () => {
        shareCodeModal.classList.remove('hidden');
    });

    copyCodeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(classCodeText.textContent);
        alert('Class code copied!');
    });

    // Confirm Delete functionality
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        if (postToDelete) {
            postToDelete.remove();
            postToDelete = null;
        }
        deleteModal.classList.add('hidden');
    });

    // Initialize listeners for any pre-existing posts on page load (like the pizza party post)
    document.querySelectorAll('.post-feed-card').forEach(post => {
        addPostInteractionListeners(post);
    });

    // Add event listeners to delete existing comments on page load
    document.querySelectorAll('.comment-item .delete-comment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const commentItem = btn.closest('.comment-item');
            const postCard = btn.closest('.post-feed-card');
            if (commentItem && postCard) {
                commentItem.remove();
                const commentCountSpan = postCard.querySelector('.comment-count');
                if (commentCountSpan) {
                    let count = parseInt(commentCountSpan.textContent);
                    commentCountSpan.textContent = count > 0 ? count - 1 : 0;
                }
            }
        });
    });
});