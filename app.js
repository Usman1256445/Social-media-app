
        function showError(message) {
            var errorEl = document.getElementById('errorMessage');
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            setTimeout(function() {
                errorEl.style.display = 'none';
            }, 3000);
        }

        function showSuccess(message) {
            var successEl = document.getElementById('successMessage');
            successEl.textContent = message;
            successEl.style.display = 'block';
            setTimeout(function() {
                successEl.style.display = 'none';
            }, 3000);
        }

        function showLogin() {
            document.getElementById('loginForm').classList.remove('hidden');
            document.getElementById('signupForm').classList.add('hidden');
        }

        function showSignup() {
            document.getElementById('signupForm').classList.remove('hidden');
            document.getElementById('loginForm').classList.add('hidden');
        }

        function handleSignup() {
            var name = document.getElementById('signupName').value;
            var email = document.getElementById('signupEmail').value;
            var password = document.getElementById('signupPassword').value;
            var confirmPassword = document.getElementById('signupConfirmPassword').value;

            if (!name || !email || !password || !confirmPassword) {
                showError('Please fill in all fields');
                return;
            }

            if (!email.includes('@')) {
                showError('Please enter a valid email');
                return;
            }

            if (password.length < 6) {
                showError('Password must be at least 6 characters');
                return;
            }

            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }

            var users = JSON.parse(localStorage.getItem('users') || '[]');
            var existingUser = users.find(function(u) { return u.email === email; });

            if (existingUser) {
                showError('Email already registered');
                return;
            }

            var newUser = {
                id: Date.now(),
                name: name,
                email: email,
                password: password
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            showSuccess('Account created successfully! Please log in.');
            setTimeout(function() {
                showLogin();
            }, 1500);
        }

        function handleLogin() {
            var email = document.getElementById('loginEmail').value;
            var password = document.getElementById('loginPassword').value;

            if (!email || !password) {
                showError('Please fill in all fields');
                return;
            }

            var users = JSON.parse(localStorage.getItem('users') || '[]');
            var user = users.find(function(u) { 
                return u.email === email && u.password === password; 
            });

            if (!user) {
                showError('Invalid email or password');
                return;
            }

            localStorage.setItem('currentUser', JSON.stringify(user));
            showMainApp();
        }

        function handleLogout() {
            localStorage.removeItem('currentUser');
            document.getElementById('authContainer').classList.remove('hidden');
            document.getElementById('mainApp').classList.add('hidden');
            showLogin();
        }

        function showMainApp() {
            var currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            document.getElementById('authContainer').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
            
            document.getElementById('userName').textContent = currentUser.name;
            document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
            
            loadPosts();
        }

        function createPost() {
            var content = document.getElementById('postContent').value;
            var imageUrl = document.getElementById('postImageUrl').value;
            
            if (!content.trim()) {
                showError('Please write something');
                return;
            }

            var currentUser = JSON.parse(localStorage.getItem('currentUser'));
            var posts = JSON.parse(localStorage.getItem('posts') || '[]');

            var newPost = {
                id: Date.now(),
                userId: currentUser.id,
                userName: currentUser.name,
                content: content,
                imageUrl: imageUrl,
                likes: 0,
                likedBy: [],
                timestamp: new Date().toISOString()
            };

            posts.unshift(newPost);
            localStorage.setItem('posts', JSON.stringify(posts));
            
            document.getElementById('postContent').value = '';
            document.getElementById('postImageUrl').value = '';
            loadPosts();
        }

        function deletePost(postId) {
            if (!confirm('Are you sure you want to delete this post?')) return;

            var posts = JSON.parse(localStorage.getItem('posts') || '[]');
            posts = posts.filter(function(p) { return p.id !== postId; });
            localStorage.setItem('posts', JSON.stringify(posts));
            loadPosts();
        }
function toggleLike(postId) {
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    var posts = JSON.parse(localStorage.getItem('posts') || '[]');
    
    var post = posts.find(function(p) { return p.id === postId; });
    if (!post) return;

    var likedIndex = post.likedBy.indexOf(currentUser.id);
    
    if (likedIndex > -1) {
        post.likedBy.splice(likedIndex, 1);
        post.likes--;
    } else {
        post.likedBy.push(currentUser.id);
        post.likes++;
    }

    localStorage.setItem('posts', JSON.stringify(posts));
    loadPosts();
}


        function formatTime(timestamp) {
            var date = new Date(timestamp);
            var now = new Date();
            var diff = Math.floor((now - date) / 1000);

            if (diff < 60) return 'just now';
            if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
            if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
            return Math.floor(diff / 86400) + 'd ago';
        }

        function formatDate(timestamp) {
            var date = new Date(timestamp);
            var options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return date.toLocaleDateString('en-US', options);
        }

        function loadPosts() {
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    var posts = JSON.parse(localStorage.getItem('posts') || '[]');
    var feed = document.getElementById('postsFeed');

    if (posts.length === 0) {
        feed.innerHTML = '<div class="no-posts"><h3>No posts yet</h3><p>Be the first to share something!</p></div>';
        return;
    }

    feed.innerHTML = posts.map(function(post) {
        var isLiked = post.likedBy.includes(currentUser.id);
        var isOwner = post.userId === currentUser.id;

        return `
        <div class="post-card">
            <div class="post-header">
                <div class="post-author">
                    <div class="post-avatar">${post.userName.charAt(0).toUpperCase()}</div>
                    <div class="post-author-info">
                        <h4>${post.userName}</h4>
                        <small>${formatTime(post.timestamp)}</small>
                        <div class="post-date">${formatDate(post.timestamp)}</div>
                    </div>
                </div>
                ${isOwner ? `
    <div style="display:flex; gap:10px;">
        <button class="btn-delete" onclick="deletePost(${post.id})">Delete</button>
        <button class="btn-edit" onclick="openEditPopup(${post.id})">Edit</button>
    </div>
` : ''}


            <div class="post-content">${post.content}</div>

            ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image">` : ''}

            <div class="post-actions">
                <button 
                    class="btn-like ${isLiked ? 'liked' : ''}" 
                    onclick="toggleLike(${post.id})"
                >
                    <span>${isLiked ? '❤️' : '🤍'}</span>
                    <span>Like</span>
                </button>

                <span class="like-counter">${post.likes} ${post.likes === 1 ? 'Like' : 'Likes'}</span>
            </div>
        </div>`;
    }).join('');
}

function filterPosts() {
    var query = document.getElementById('searchInput').value.toLowerCase();
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    var posts = JSON.parse(localStorage.getItem('posts') || '[]');

    var filtered = posts.filter(function(post) {
        return (
            post.content.toLowerCase().includes(query) ||
            post.userName.toLowerCase().includes(query) ||
            formatDate(post.timestamp).toLowerCase().includes(query)
        );
    });

    displayFilteredPosts(filtered, currentUser);
}

function applyFilter() {
    var filter = document.getElementById('filterSelect').value;
    var posts = JSON.parse(localStorage.getItem('posts') || '[]');

    if (filter === "latest") {
        posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } 
    else if (filter === "oldest") {
        posts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
    else if (filter === "liked") {
        posts.sort((a, b) => b.likes - a.likes);
    }

    displayFilteredPosts(posts, JSON.parse(localStorage.getItem('currentUser')));
}

function openEditPopup(postId) {
    var posts = JSON.parse(localStorage.getItem('posts') || '[]');
    var post = posts.find(p => p.id === postId);

    if (!post) return;

    document.getElementById("editPopupContainer").innerHTML = `
        <div class="edit-popup-overlay">
            <div class="edit-popup">
                <h3>Edit Post</h3>

                <textarea id="editContent">${post.content}</textarea>
                <input type="text" id="editImage" value="${post.imageUrl || ''}" placeholder="Image URL">

                <div class="edit-popup-buttons">
                    <button class="btn-cancel" onclick="closeEditPopup()">Cancel</button>
                    <button class="btn-save" onclick="savePostChanges(${post.id})">Save</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById("editPopupContainer").classList.remove("hidden");
}

function closeEditPopup() {
    document.getElementById("editPopupContainer").classList.add("hidden");
    document.getElementById("editPopupContainer").innerHTML = "";
}


function savePostChanges(postId) {
    var posts = JSON.parse(localStorage.getItem('posts') || '[]');
    var post = posts.find(p => p.id === postId);

    if (!post) return;

    var newContent = document.getElementById("editContent").value.trim();
    var newImage = document.getElementById("editImage").value.trim();

    if (!newContent) {
        alert("Post content cannot be empty!");
        return;
    }

    post.content = newContent;
    post.imageUrl = newImage;

    localStorage.setItem("posts", JSON.stringify(posts));

    closeEditPopup();
    loadPosts();
}



function savePostChanges(postId) {
    var newContent = document.getElementById("editContent").value.trim();
    var newImageUrl = document.getElementById("editImage").value.trim();

    if (!newContent) {
        alert("Post content cannot be empty!");
        return;
    }

    var posts = JSON.parse(localStorage.getItem("posts") || "[]");
    var post = posts.find(p => p.id === postId);

    if (!post) return;

    post.content = newContent;
    post.imageUrl = newImageUrl;

    localStorage.setItem("posts", JSON.stringify(posts));

    closeEditPopup();
    loadPosts();
}

function displayFilteredPosts(posts, currentUser) {
    var feed = document.getElementById('postsFeed');

    if (posts.length === 0) {
        feed.innerHTML = `
            <div class="no-posts">
                <h3>No posts found</h3>
                <p>Try searching something else.</p>
            </div>
        `;
        return;
    }

    feed.innerHTML = posts.map(function(post) {
        var isLiked = post.likedBy.includes(currentUser.id);
        var isOwner = post.userId === currentUser.id;

        return `
        <div class="post-card">
            <div class="post-header">
                <div class="post-author">
                    <div class="post-avatar">${post.userName.charAt(0).toUpperCase()}</div>
                    <div class="post-author-info">
                        <h4>${post.userName}</h4>
                        <small>${formatTime(post.timestamp)}</small>
                        <div class="post-date">${formatDate(post.timestamp)}</div>
                    </div>
                </div>

                ${isOwner ? `
                <div style="display:flex; gap:10px;">
                    <button class="btn-delete" onclick="deletePost(${post.id})">Delete</button>
                    <button class="btn-edit" onclick="openEditPopup(${post.id})">Edit</button>
                </div>` : ""}
            </div>

            <div class="post-content">${post.content}</div>

            ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image">` : ''}

            <div class="post-actions">
                <button 
                    class="btn-like ${isLiked ? 'liked' : ''}" 
                    onclick="toggleLike(${post.id})"
                >
                    <span>${isLiked ? '❤️' : '🤍'}</span>
                    <span>Like</span>
                </button>

                <span class="like-counter">${post.likes} ${post.likes === 1 ? 'Like' : 'Likes'}</span>
            </div>
        </div>`;
    }).join('');
}


    const body = document.body;
    const toggle = document.getElementById("toggle");

    // Load saved mode
    const savedTheme = localStorage.getItem("theme");
    if(savedTheme){
        body.classList.add(savedTheme);
    } else {
        body.classList.add("light");  // default theme
    }

    // Toggle theme
    toggle.addEventListener("click", () => {
        if(body.classList.contains("light")){
            body.classList.replace("light", "dark");
            localStorage.setItem("theme", "dark");
        } else {
            body.classList.replace("dark", "light");
            localStorage.setItem("theme", "light");
        }
    });


