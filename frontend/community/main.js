// community.js

document.addEventListener('DOMContentLoaded', function() {
    const postsContainer = document.getElementById('posts-container');
    const postForm = document.getElementById('post-form');
    const postContent = document.getElementById('post-content');
    const postImage = document.getElementById('post-image');

    // Load existing posts from localStorage
    let posts = JSON.parse(localStorage.getItem('terraAlyPosts')) || [];

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add new post
    postForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const content = postContent.value.trim();
        const imageFile = postImage.files[0];
        if (content) {
            const postId = Date.now().toString();
            const post = {
                id: postId,
                content: content,
                image: imageFile ? URL.createObjectURL(imageFile) : null,
                likes: 0,
                comments: [],
                reposts: 0,
                saved: false,
                timestamp: new Date().toISOString()
            };
            posts.push(post);
            localStorage.setItem('terraAlyPosts', JSON.stringify(posts));
            renderPosts();
            postContent.value = '';
            postImage.value = '';
        }
    });

    // Render posts
    function renderPosts() {
        postsContainer.innerHTML = '';
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-item';
            postElement.innerHTML = `
                <p>${post.content}</p>
                ${post.image ? `<img src="${post.image}" alt="Post Image" class="post-image">` : ''}
                <div class="post-actions">
                    <button class="like-btn" data-id="${post.id}">Like (${post.likes})</button>
                    <button class="repost-btn" data-id="${post.id}">Repost (${post.reposts})</button>
                    <button class="save-btn" data-id="${post.id}">${post.saved ? 'Unsave' : 'Save'}</button>
                    <input type="text" class="comment-input" data-id="${post.id}" placeholder="Add a comment...">
                    <button class="comment-btn" data-id="${post.id}">Comment</button>
                </div>
                <div class="comments-section" data-id="${post.id}">
                    ${post.comments.map(comment => `<p class="comment"><span>${comment.user || 'Anonymous'}:</span> ${comment.text} <button class="comment-like-btn" data-post-id="${post.id}" data-comment-id="${comment.id}">Like (${comment.likes || 0})</button></p>`).join('')}
                </div>
            `;
            postsContainer.appendChild(postElement);
        });

        // Add event listeners after rendering
        addEventListeners();
    }

    // Add event listeners for interactions
    function addEventListeners() {
        document.querySelectorAll('.like-btn').forEach(button => {
            button.addEventListener('click', function() {
                const postId = this.getAttribute('data-id');
                const post = posts.find(p => p.id === postId);
                post.likes++;
                localStorage.setItem('terraAlyPosts', JSON.stringify(posts));
                renderPosts();
            });
        });

        document.querySelectorAll('.comment-btn').forEach(button => {
            button.addEventListener('click', function() {
                const postId = this.getAttribute('data-id');
                const input = this.previousElementSibling;
                const commentText = input.value.trim();
                if (commentText) {
                    const commentId = Date.now().toString();
                    const post = posts.find(p => p.id === postId);
                    post.comments.push({ id: commentId, text: commentText, likes: 0, user: 'User' + Math.floor(Math.random() * 100) });
                    localStorage.setItem('terraAlyPosts', JSON.stringify(posts));
                    input.value = '';
                    renderPosts();
                }
            });
        });

        document.querySelectorAll('.comment-like-btn').forEach(button => {
            button.addEventListener('click', function() {
                const postId = this.getAttribute('data-post-id');
                const commentId = this.getAttribute('data-comment-id');
                const post = posts.find(p => p.id === postId);
                const comment = post.comments.find(c => c.id === commentId);
                comment.likes = (comment.likes || 0) + 1;
                localStorage.setItem('terraAlyPosts', JSON.stringify(posts));
                renderPosts();
            });
        });

        document.querySelectorAll('.repost-btn').forEach(button => {
            button.addEventListener('click', function() {
                const postId = this.getAttribute('data-id');
                const post = posts.find(p => p.id === postId);
                post.reposts++;
                localStorage.setItem('terraAlyPosts', JSON.stringify(posts));
                renderPosts();
                alert(`Reposted! ${post.reposts} reposts now.`);
            });
        });

        document.querySelectorAll('.save-btn').forEach(button => {
            button.addEventListener('click', function() {
                const postId = this.getAttribute('data-id');
                const post = posts.find(p => p.id === postId);
                post.saved = !post.saved;
                localStorage.setItem('terraAlyPosts', JSON.stringify(posts));
                this.textContent = post.saved ? 'Unsave' : 'Save';
                renderPosts();
            });
        });
    }

    // Initial render
    renderPosts();
});