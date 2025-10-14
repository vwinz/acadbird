document.addEventListener('DOMContentLoaded', () => {
    const resourcesSection = document.querySelector('.resources-section');
    const addWeekBtn = document.querySelector('.add-week-btn');
    const popupOverlay = document.getElementById('content-popup');
    const popupCloseBtn = document.querySelector('.popup-close');
    const addFileBtn = document.getElementById('add-file-btn');
    const popupFileInput = document.getElementById('popup-file-input');
    const postBtn = document.getElementById('post-btn');
    const popupText = document.getElementById('popup-text');
    
    let currentTopicCard = null;
    let currentContentItem = null;
    let nextWeekNumber = 2;
    let nextTopicId = 14;

    // Initial state setup for the first week
    const week1Card = document.querySelector('.week-card:first-of-type');
    if (week1Card) {
        week1Card.classList.add('active');
        const week1Content = week1Card.querySelector('.week-content');
        if (week1Content) {
            week1Content.classList.add('active');
        }
    }

    // Function to handle the lock/unlock state and visual updates
    function updateLockStatus(card) {
        if (card.classList.contains('unlocked')) {
            card.style.borderLeft = '10px solid #76c784';
        } else {
            card.style.borderLeft = '10px solid #000';
        }
    }

    // Function to initialize all event listeners on dynamically added elements
    function initEventListeners() {
        // Handle week header click to toggle content
        document.querySelectorAll('.week-header').forEach(header => {
            header.onclick = (event) => {
                const weekCard = header.parentElement;
                if (!event.target.closest('.edit-icon') && !event.target.closest('.delete-week-icon') && !event.target.closest('.lock-status')) {
                    const weekContent = header.nextElementSibling;
                    weekContent.classList.toggle('active');
                    weekCard.classList.toggle('active');
                }
            };
        });

        // Handle topic header click to toggle content
        document.querySelectorAll('.topic-header').forEach(header => {
            header.onclick = (event) => {
                const topicCard = header.parentElement;
                if (!event.target.closest('.edit-icon') && !event.target.closest('.delete-topic-icon') && !event.target.closest('.lock-status')) {
                    const topicContent = header.nextElementSibling;
                    if (topicContent) {
                        topicContent.classList.toggle('active');
                    }
                    topicCard.classList.toggle('active');
                }
            };
        });

        // Toggle lock/unlock status for weeks and topics
        document.querySelectorAll('.week-card .lock-status, .topic-card .lock-status').forEach(lockStatus => {
            lockStatus.onclick = (event) => {
                event.stopPropagation();
                const card = lockStatus.closest('.week-card') || lockStatus.closest('.topic-card');
                const isLocked = card.classList.toggle('locked');
                const isUnlocked = card.classList.toggle('unlocked');
                
                // If it's a week card, lock/unlock all child topics
                if (card.classList.contains('week-card')) {
                    const topics = card.querySelectorAll('.topic-card');
                    topics.forEach(topic => {
                        topic.classList.toggle('locked', isLocked);
                        topic.classList.toggle('unlocked', isUnlocked);
                        updateLockStatus(topic);
                    });
                }
                updateLockStatus(card);
            };
        });
        
        // Edit functionality for week/topic titles
        document.querySelectorAll('.week-edit-icon, .topic-edit-icon').forEach(icon => {
            icon.onclick = (event) => {
                const parent = event.target.closest('.week-header') || event.target.closest('.topic-header');
                let textSpan;
                let isWeekSubtitle = false;

                if (parent.classList.contains('week-header')) {
                    textSpan = parent.querySelector('.week-subtitle');
                    isWeekSubtitle = true;
                } else {
                    textSpan = parent.querySelector('.topic-title');
                }

                if (textSpan) {
                    const currentText = textSpan.textContent;
                    const inputField = document.createElement('input');
                    inputField.type = 'text';
                    inputField.classList.add('editable-field');
                    inputField.value = currentText;

                    textSpan.replaceWith(inputField);
                    inputField.focus();

                    const saveEdit = () => {
                        const newText = inputField.value || (isWeekSubtitle ? 'New Week' : 'New Topic');
                        const newSpan = document.createElement('span');
                        newSpan.textContent = newText;
                        newSpan.classList.add(isWeekSubtitle ? 'week-subtitle' : 'topic-title');
                        inputField.replaceWith(newSpan);
                        initEventListeners();
                    };

                    inputField.addEventListener('blur', saveEdit);
                    inputField.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            inputField.blur();
                        }
                    });
                }
            };
        });

        // Open pop-up for adding new content
        document.querySelectorAll('.add-content-btn').forEach(item => {
            item.onclick = (event) => {
                currentTopicCard = event.target.closest('.topic-card');
                currentContentItem = null; // Clear to signal new content
                popupText.innerHTML = ''; // Clear pop-up text
                popupOverlay.classList.remove('hidden');
            };
        });

        // Open pop-up for editing existing content
        document.querySelectorAll('.topic-item.content-item-editable').forEach(item => {
            item.onclick = (event) => {
                if (!event.target.closest('.edit-item-icon') && !event.target.closest('.delete-item-icon')) {
                    currentContentItem = item;
                    currentTopicCard = item.closest('.topic-card');
                    popupText.innerHTML = item.querySelector('.item-text').innerHTML;
                    popupOverlay.classList.remove('hidden');
                }
            };
        });

        // Delete content item
        document.querySelectorAll('.delete-item-icon').forEach(icon => {
            icon.onclick = (event) => {
                const item = event.target.closest('.topic-item');
                if (item && !item.classList.contains('add-content-btn')) {
                    item.remove();
                }
            };
        });
        
        // Add Topic Button functionality
        document.querySelectorAll('.add-topic-btn').forEach(btn => {
            btn.onclick = () => {
                const weekContent = btn.parentElement;
                const newTopicHtml = `
                    <div class="topic-card unlocked" data-topic-id="${nextTopicId++}">
                        <div class="topic-header">
                            <span class="topic-title">New Topic</span>
                            <i class="fas fa-pencil-alt edit-icon topic-edit-icon"></i>
                            <div class="lock-status">
                                <i class="fas fa-lock-open unlock-icon"></i>
                                <i class="fas fa-lock lock-icon"></i>
                            </div>
                            <i class="fas fa-trash-alt delete-topic-icon"></i>
                        </div>
                        <div class="topic-content active">
                            <div class="topic-item content-item add-content-btn">
                                <i class="fas fa-plus"></i>
                                <span class="item-text">Add Topic Content</span>
                            </div>
                        </div>
                    </div>
                `;
                btn.insertAdjacentHTML('beforebegin', newTopicHtml);
                initEventListeners();
            };
        });

        // Delete entire week
        document.querySelectorAll('.delete-week-icon').forEach(icon => {
            icon.onclick = (event) => {
                event.stopPropagation();
                const weekCard = event.target.closest('.week-card');
                if (confirm('Are you sure you want to delete this entire week? This action cannot be undone.')) {
                    weekCard.remove();
                }
            };
        });

        // Delete entire topic
        document.querySelectorAll('.delete-topic-icon').forEach(icon => {
            icon.onclick = (event) => {
                event.stopPropagation();
                const topicCard = event.target.closest('.topic-card');
                if (confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
                    topicCard.remove();
                }
            };
        });
    }

    // Add Week functionality
    addWeekBtn.onclick = () => {
        const weekCount = document.querySelectorAll('.week-card').length + 1;
        const newWeekHtml = `
            <div class="week-card unlocked">
                <div class="week-header">
                    <span class="week-title">Week ${weekCount}</span>
                    <span class="week-subtitle">New Week</span>
                    <i class="fas fa-pencil-alt edit-icon week-edit-icon"></i>
                    <div class="lock-status">
                        <i class="fas fa-lock-open unlock-icon"></i>
                        <i class="fas fa-lock lock-icon"></i>
                    </div>
                    <i class="fas fa-trash-alt delete-week-icon"></i>
                </div>
                <div class="week-content active">
                    <div class="topic-card unlocked" data-topic-id="${nextTopicId++}">
                        <div class="topic-header">
                            <span class="topic-title">New Topic</span>
                            <i class="fas fa-pencil-alt edit-icon topic-edit-icon"></i>
                            <div class="lock-status">
                                <i class="fas fa-lock-open unlock-icon"></i>
                                <i class="fas fa-lock lock-icon"></i>
                            </div>
                            <i class="fas fa-trash-alt delete-topic-icon"></i>
                        </div>
                        <div class="topic-content active">
                            <div class="topic-item content-item add-content-btn">
                                <i class="fas fa-plus"></i>
                                <span class="item-text">Add Topic Content</span>
                            </div>
                        </div>
                    </div>
                    <div class="add-topic-btn">
                        <i class="fas fa-plus"></i> Add Topic
                    </div>
                </div>
            </div>
        `;
        resourcesSection.insertBefore(document.createRange().createContextualFragment(newWeekHtml), addWeekBtn.parentElement);
        initEventListeners();
        nextWeekNumber++;
    };

    // Pop-up close functionality
    popupCloseBtn.onclick = () => {
        popupOverlay.classList.add('hidden');
    };

    // Post content from pop-up
    postBtn.onclick = () => {
        const textContent = popupText.innerHTML;

        if (currentContentItem) {
            // Editing existing content
            currentContentItem.querySelector('.item-text').innerHTML = textContent;
        } else if (currentTopicCard) {
            // Adding new content
            const newContentHtml = `
                <div class="topic-item content-item-editable">
                    <i class="fas fa-book-open"></i>
                    <span class="item-text">${textContent}</span>
                    <i class="fas fa-pencil-alt edit-item-icon"></i>
                    <i class="fas fa-trash-alt delete-item-icon"></i>
                </div>
            `;
            const topicContent = currentTopicCard.querySelector('.topic-content');
            const addContentBtn = topicContent.querySelector('.add-content-btn');
            addContentBtn.insertAdjacentHTML('afterend', newContentHtml);
            initEventListeners();
        }
        popupOverlay.classList.add('hidden');
    };

    // Pop-up file upload
    addFileBtn.onclick = () => {
        popupFileInput.click();
    };

    popupFileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileName = file.name;
            const fileURL = URL.createObjectURL(file);
            const newFileItemHtml = `
                <div class="topic-item file-item">
                    <i class="fas fa-download"></i>
                    <a href="${fileURL}" download="${fileName}" class="download-link">
                        <span class="item-text">${fileName}</span>
                    </a>
                    <i class="fas fa-trash-alt delete-item-icon"></i>
                </div>
            `;
            const topicContent = currentTopicCard.querySelector('.topic-content');
            const addContentBtn = topicContent.querySelector('.add-content-btn');
            addContentBtn.insertAdjacentHTML('afterend', newFileItemHtml);
            popupOverlay.classList.add('hidden');
            initEventListeners();
        }
    };
    
    // Initial call to set up all event listeners
    initEventListeners();
});