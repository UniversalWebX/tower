// Tower Static Site JavaScript
class TowerApp {
  constructor() {
    this.posts = [];
    this.currentUser = null;
    this.init();
  }

  async init() {
    // Load posts from API
    try {
      const response = await fetch('/api/feed');
      if (response.ok) {
        const data = await response.json();
        this.posts = data.posts || [];
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
      this.posts = [];
    }

    // Check if user is logged in
    await this.checkAuth();
  }

  async checkAuth() {
    try {
      const response = await fetch('/api/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        this.currentUser = data.user;
      } else {
        this.currentUser = null;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      this.currentUser = null;
    }
    this.updateUI();
  }

  updateUI() {
    // Update navigation
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
      link.classList.remove('text-cyan-300');
      link.classList.add('text-zinc-300');
    });

    // Update auth state
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');
    
    if (this.currentUser) {
      if (loginButton) loginButton.textContent = 'Sign out';
      if (signupButton) signupButton.textContent = 'Profile';
    } else {
      if (loginButton) loginButton.textContent = 'Sign in';
      if (signupButton) signupButton.textContent = 'Sign up';
    }
  }

  async handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        await this.checkAuth();
        window.location.href = '/feed.html';
      } else {
        const error = await response.json();
        this.showError(error.error || 'Login failed');
      }
    } catch (error) {
      this.showError('Network error. Please try again.');
    }
  }

  async handleSignup(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const age = document.getElementById('age').value;
    const topics = Array.from(document.getElementById('topics').selectedOptions)
      .filter(option => option.selected)
      .map(option => option.value);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password, age, tags: topics })
      });

      if (response.ok) {
        await this.checkAuth();
        window.location.href = '/feed.html';
      } else {
        const error = await response.json();
        this.showError(error.error || 'Signup failed');
      }
    } catch (error) {
      this.showError('Network error. Please try again.');
    }
  }

  showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    }
  }

  hideError() {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.classList.add('hidden');
    }
  }

  renderPosts() {
    const feedContainer = document.getElementById('feed-container');
    if (!feedContainer) return;

    if (this.posts.length === 0) {
      feedContainer.innerHTML = '<p class="text-center py-8 text-zinc-500">No posts yet. Upload a video to seed the network.</p>';
    } else {
      feedContainer.innerHTML = this.posts.map(post => `
        <div class="post-card">
          <div class="post-header">
            <span class="author">@${post.author?.username || 'unknown'}</span>
            <span class="age">Ages ${post.ageMin}–${post.ageMax}</span>
            <span class="score">rank ${post.score?.toFixed(1) || '0.0'}</span>
          </div>
          <h3 class="post-title">${post.title}</h3>
          <div class="post-tags">
            ${post.tags?.map(tag => `<span class="tag">#${tag}</span>`).join('')}
          </div>
          <a href="/posts/${post.id}" class="post-link">View Post</a>
        </div>
      `).join('');
    }
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  const app = new TowerApp();
  
  // Setup event listeners
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => app.handleLogin(e));
  }
  
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => app.handleSignup(e));
  }
});
