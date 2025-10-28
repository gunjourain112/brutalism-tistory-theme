// Wrap everything in IIFE to avoid conflicts with Tistory's scripts
(function() {
    'use strict';

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.querySelector('.theme-icon');
const html = document.documentElement;

// Detect system theme preference
function getSystemTheme() {
    try {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    } catch (e) {
        // If error, default to dark
        return 'dark';
    }
}

// Check for saved theme preference or use system preference
const savedTheme = localStorage.getItem('theme');
const currentTheme = savedTheme || getSystemTheme();

if (currentTheme === 'dark') {
    html.setAttribute('data-theme', 'dark');
}
updateThemeIcon(currentTheme);

// Listen for system theme changes
try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            html.setAttribute('data-theme', newTheme);
            updateThemeIcon(newTheme);
        }
    });
} catch (e) {
    console.log('System theme detection not supported');
}

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'light' ? '◑' : '◐';
}

// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const nav = document.querySelector('.nav');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        nav.classList.toggle('mobile-open');
    });

    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && nav.classList.contains('mobile-open')) {
            nav.classList.remove('mobile-open');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('mobile-open');
        });
    });
}

// Search Functionality
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const articles = document.querySelectorAll('.article-card');
        
        articles.forEach(article => {
            const title = article.querySelector('.article-title')?.textContent.toLowerCase() || '';
            const excerpt = article.querySelector('.article-excerpt')?.textContent.toLowerCase() || '';
            
            if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
                article.style.display = '';
            } else {
                article.style.display = 'none';
            }
        });
    });

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchInput.focus();
        });
    }
}

// Terminal Typing Effect
const terminalBody = document.querySelector('.terminal-body');
if (terminalBody) {
    const lines = [
        { text: '$ cat /about.txt', delay: 0 },
        { text: '분기별 고급 기술 아티클', delay: 800 },
        { text: '실전 경험 · 성능 최적화', delay: 1200 },
        { text: '$ _', delay: 1600 }
    ];
    
    // Clear initial content
    terminalBody.innerHTML = '';
    
    lines.forEach((line, index) => {
        setTimeout(() => {
            const lineDiv = document.createElement('div');
            lineDiv.className = 'terminal-line';
            
            if (line.text.startsWith('$')) {
                const prompt = document.createElement('span');
                prompt.className = 'prompt';
                prompt.textContent = '$';
                lineDiv.appendChild(prompt);
                
                const command = document.createElement('span');
                command.textContent = line.text.substring(1);
                lineDiv.appendChild(command);
                
                if (line.text.includes('_')) {
                    const cursor = document.createElement('span');
                    cursor.className = 'cursor';
                    cursor.textContent = '_';
                    lineDiv.appendChild(cursor);
                }
            } else {
                lineDiv.textContent = line.text;
            }
            
            terminalBody.appendChild(lineDiv);
        }, line.delay);
    });
}

// Article Card Hover Effect (Random Shadow Colors)
const articleCards = document.querySelectorAll('.article-card');
const colors = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)'];

articleCards.forEach((card, index) => {
    const color = colors[index % colors.length];
    
    card.addEventListener('mouseenter', function() {
        this.style.boxShadow = `8px 8px 0 ${color}`;
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.boxShadow = '';
    });
});

// Glitch Effect on Title (Optional)
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    let glitchInterval;
    
    heroTitle.addEventListener('mouseenter', () => {
        let count = 0;
        glitchInterval = setInterval(() => {
            if (count < 3) {
                heroTitle.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
                count++;
            } else {
                heroTitle.style.transform = 'translate(0, 0)';
                clearInterval(glitchInterval);
            }
        }, 50);
    });
}

// Reading Progress Bar
const articleDetail = document.querySelector('.article-detail');
if (articleDetail) {
    const progressBar = document.querySelector('.reading-progress');
    
    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / documentHeight) * 100;
        
        if (progressBar) {
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
    });
}

// Syntax Highlighting with Prism
document.querySelectorAll('.code-block').forEach(block => {
    const langElement = block.querySelector('.code-lang');
    const codeElement = block.querySelector('code');
    
    if (langElement && codeElement) {
        const lang = langElement.textContent.toLowerCase();
        codeElement.classList.add(`language-${lang}`);
    }
});

// Initialize Prism if available
if (typeof Prism !== 'undefined') {
    Prism.highlightAll();
}

// Code Copy Buttons
document.querySelectorAll('.code-copy').forEach(button => {
    button.addEventListener('click', async function() {
        const codeBlock = this.closest('.code-block').querySelector('code');
        const code = codeBlock.textContent;
        
        try {
            await navigator.clipboard.writeText(code);
            this.textContent = 'COPIED!';
            this.classList.add('copied');
            
            setTimeout(() => {
                this.textContent = 'COPY';
                this.classList.remove('copied');
            }, 2000);
        } catch (err) {
            this.textContent = 'FAILED';
            setTimeout(() => {
                this.textContent = 'COPY';
            }, 2000);
        }
    });
});

// Share Buttons
document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        const shareType = this.dataset.share;
        const url = window.location.href;
        const title = document.querySelector('h1')?.textContent || document.title;
        
        switch(shareType) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'copy':
                try {
                    await navigator.clipboard.writeText(url);
                    const originalText = this.textContent;
                    this.textContent = 'COPIED!';
                    this.classList.add('copied');
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    alert('Failed to copy link');
                }
                break;
        }
    });
});


// Archive Filter
const filterBtns = document.querySelectorAll('.filter-btn');
const archiveItems = document.querySelectorAll('.archive-item');

if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter articles
            archiveItems.forEach(item => {
                if (filter === 'all') {
                    item.classList.remove('hidden');
                } else {
                    if (item.dataset.category === filter) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                }
            });
        });
    });
}

})(); // End of IIFE


// Detect page type and add body class
(function() {
    const body = document.body;
    const path = window.location.pathname;
    
    // Check if it's a permalink (article detail page)
    if (window.T && window.T.entryInfo && window.T.entryInfo.entryId) {
        body.classList.add('tt-body-permalink');
    } 
    // Check if it's archive
    else if (path.includes('/archive')) {
        body.classList.add('tt-body-archive');
    }
    // Check if it's category
    else if (path.includes('/category/')) {
        body.classList.add('tt-body-category');
    }
    // Default to index
    else {
        body.classList.add('tt-body-index');
    }
})();
