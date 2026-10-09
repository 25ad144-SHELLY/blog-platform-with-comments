```javascript
const articles = [
    {
        id: 1,
        category: "Technology",
        title: "The quiet revolution happening in the way we work",
        excerpt: "The future of work isn't about doing more. It's about making room for the work that matters.",
        date: "Oct 08, 2026",
        read: "6 min read",
        author: "Maya Bennett",
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85",
        featured: true,
        body: [
            ["A different kind of progress", "For years, the story of work was a story of speed. Faster tools, fuller calendars, more tabs open at once. Somewhere along the way, we began to mistake motion for progress."],
            ["Make space for meaningful work", "The most useful shift may be a quieter one: protecting the time and attention required to do something well. That means fewer unnecessary meetings, clearer priorities, and the confidence to leave some things undone."],
            ["A practice, not a productivity hack", "Better work rarely comes from one dramatic change. It comes from small, repeated choices: asking better questions, making time to think, and giving good ideas enough room to grow."]
        ]
    },
    {
        id: 2,
        category: "Design",
        title: "Why the best design knows when to be quiet",
        excerpt: "A thoughtful interface doesn't compete for attention. It helps people spend it well.",
        date: "Oct 04, 2026",
        read: "4 min read",
        author: "Oliver Chen",
        image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=85",
        body: [
            ["Less, with intention", "Good design is not simply the absence of decoration. It is the presence of intention. Every element earns its place by helping someone understand, decide, or feel."],
            ["Clarity is a kindness", "Clear hierarchy, readable typography and honest feedback give people confidence without demanding unnecessary attention."],
            ["Leave room to breathe", "Whitespace gives content a rhythm and lets the important parts stand out. The goal is not to make a screen empty, but to make its purpose unmistakable."]
        ]
    },
    {
        id: 3,
        category: "Culture",
        title: "The small rituals that make a day meaningful",
        excerpt: "A few intentional moments can change the texture of an otherwise ordinary day.",
        date: "Sep 29, 2026",
        read: "5 min read",
        author: "Amara Lewis",
        image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=900&q=85",
        body: [
            ["An ordinary kind of magic", "Meaning doesn't always arrive as a milestone. Often it is found in familiar rituals: a slow morning drink, a walk without headphones, or a conversation that lasts longer than planned."],
            ["Attention changes the experience", "The ritual itself doesn't have to be remarkable. What matters is the attention we bring to it. A small pause can create a boundary between rushing through the day and actually being in it."],
            ["Start with one thing", "Choose one moment you already have and make it more deliberate. Keep it simple enough to repeat. Over time, the repetition becomes a gentle anchor."]
        ]
    },
    {
        id: 4,
        category: "Ideas",
        title: "Curiosity is a skill you can practise",
        excerpt: "You don't need to know everything. You need to keep asking what you might be missing.",
        date: "Sep 24, 2026",
        read: "7 min read",
        author: "Noah Williams",
        image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=85",
        body: [
            ["Ask one more question", "Curiosity begins with a willingness to stay with a question a little longer. Instead of reaching for the quickest explanation, ask what else could be true."],
            ["Follow the unexpected thread", "Some of the most interesting ideas appear at the edges of what we already know. Read outside your field, talk to people with different experiences, and let a surprising detail lead you somewhere new."],
            ["Keep a record of wonder", "Write down questions, not just answers. A short list of things you don't understand can become a map for what to explore next."]
        ]
    },
    {
        id: 5,
        category: "Technology",
        title: "Building digital tools that feel more human",
        excerpt: "Technology works best when it respects the person on the other side of the screen.",
        date: "Sep 18, 2026",
        read: "6 min read",
        author: "Maya Bennett",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=85",
        body: [
            ["People before features", "A useful product isn't defined by the number of features it contains. It is defined by whether those features make someone's life easier, clearer, or more connected."],
            ["Trust is part of the interface", "Predictable behaviour, understandable language, accessible controls and respectful defaults are the foundation of a product people can trust."],
            ["Technology with a point of view", "Human-centred tools understand the problem, explain themselves clearly, and get out of the way when the work is done."]
        ]
    },
    {
        id: 6,
        category: "Design",
        title: "A field guide to noticing the details",
        excerpt: "Pay attention to the things most people pass by. They often have the best stories.",
        date: "Sep 12, 2026",
        read: "3 min read",
        author: "Oliver Chen",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85",
        body: [
            ["Look a little closer", "A good observation doesn't have to be grand. It might be the way light moves across a room, how a sign guides a stranger, or why one chair invites you to stay longer than another."],
            ["Notice without judging", "Before deciding whether something is good or bad, describe what is actually happening. This pause can reveal details that a quick opinion would miss."],
            ["Turn noticing into making", "Collect the details that stay with you. Sketch them, photograph them, or write a sentence about why they matter. Attention is a useful starting point for creative work."]
        ]
    }
];

const $ = selector => document.querySelector(selector);

const featuredStory = $("#featuredStory");
const storyGrid = $("#storyGrid");
const searchInput = $("#searchInput");
const dialog = $("#articleDialog");
const articleContent = $("#articleContent");
const toast = $("#toast");

let activeCategory = "All";
let toastTimer;

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function getComments(id) {
    try {
        return JSON.parse(
            localStorage.getItem(`margin-comments-${id}`) || "[]"
        );
    } catch {
        return [];
    }
}

function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

function metadata(article) {
    return `
        <div class="meta">
            ${escapeHTML(article.category)} ·
            ${escapeHTML(article.date)} ·
            ${escapeHTML(article.read)}
        </div>
    `;
}

function renderFeatured(article) {
    featuredStory.innerHTML = `
        <article class="featured-card" tabindex="0" role="button"
            aria-label="Read ${escapeHTML(article.title)}">
            <div class="featured-image">
                <img src="${article.image}"
                     alt="${escapeHTML(article.title)}"
                     loading="lazy">
                <span class="image-tag">EDITOR'S PICK</span>
            </div>

            <div class="featured-copy">
                ${metadata(article)}
                <h3>${escapeHTML(article.title)}</h3>
                <p>${escapeHTML(article.excerpt)}</p>
                <span class="read-link">Read the story ↗</span>
            </div>
        </article>
    `;

    const card = featuredStory.querySelector(".featured-card");

    card.addEventListener("click", () => openArticle(article.id));

    card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openArticle(article.id);
        }
    });
}

function renderCard(article) {
    const count = getComments(article.id).length;

    return `
        <article class="story-card"
            data-id="${article.id}"
            tabindex="0"
            role="button"
            aria-label="Read ${escapeHTML(article.title)}">

            <div class="story-image">
                <img src="${article.image}"
                     alt="${escapeHTML(article.title)}"
                     loading="lazy">
                <span class="image-tag">
                    ${escapeHTML(article.category.toUpperCase())}
                </span>
            </div>

            <div class="story-copy">
                ${metadata(article)}
                <h3>${escapeHTML(article.title)}</h3>
                <p>${escapeHTML(article.excerpt)}</p>

                <div class="card-footer">
                    <span>${count} comments</span>
                    <span class="read-link">Read more ↗</span>
                </div>
            </div>
        </article>
    `;
}

function renderStories() {
    const query = searchInput.value.trim().toLowerCase();

    const matches = article => {
        const categoryMatches =
            activeCategory === "All" ||
            article.category === activeCategory;

        const text = [
            article.title,
            article.excerpt,
            article.category,
            article.author
        ].join(" ").toLowerCase();

        return categoryMatches && text.includes(query);
    };

    const featured = articles.find(article => article.featured);
    const showFeatured = matches(featured);

    featuredStory.hidden = !showFeatured;

    if (showFeatured) {
        renderFeatured(featured);
    }

    const results = articles.filter(
        article => !article.featured && matches(article)
    );

    storyGrid.innerHTML = results.map(renderCard).join("");

    storyGrid.hidden = results.length === 0;

    $("#emptyMessage").hidden =
        showFeatured || results.length > 0;

    storyGrid.querySelectorAll(".story-card").forEach(card => {
        const open = () => openArticle(Number(card.dataset.id));

        card.addEventListener("click", open);

        card.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                open();
            }
        });
    });
}

function renderComments(id) {
    const comments = getComments(id);

    if (!comments.length) {
        return `<p class="no-comments">
            No comments yet. Start a thoughtful conversation.
        </p>`;
    }

    return comments.slice().reverse().map(comment => `
        <div class="comment-item">
            <strong>${escapeHTML(comment.name)}</strong>
            <small>${escapeHTML(comment.date)}</small>
            <p>${escapeHTML(comment.text)}</p>
        </div>
    `).join("");
}

function openArticle(id) {
    const article = articles.find(item => item.id === id);

    if (!article) return;

    const body = article.body.map((section, index) => `
        ${index === 1
            ? `<blockquote>
                “The best ideas often begin when we give ourselves room to think.”
               </blockquote>`
            : ""}
        <h3>${escapeHTML(section[0])}</h3>
        <p>${escapeHTML(section[1])}</p>
    `).join("");

    articleContent.innerHTML = `
        <img class="dialog-hero"
             src="${article.image}"
             alt="${escapeHTML(article.title)}">

        <div class="dialog-body">
            ${metadata(article)}

            <h2>${escapeHTML(article.title)}</h2>
            <p class="dialog-intro">${escapeHTML(article.excerpt)}</p>

            <p class="meta">Written by ${escapeHTML(article.author)}</p>

            <div class="article-text">${body}</div>

            <section class="comments">
                <h3>Join the conversation</h3>
                <p class="no-comments">
                    Keep it thoughtful. Share your perspective.
                </p>

                <form class="comment-form" id="commentForm">
                    <input name="name"
                           maxlength="50"
                           placeholder="Your name"
                           aria-label="Your name"
                           required>

                    <textarea name="text"
                              maxlength="1000"
                              placeholder="Share your thoughts..."
                              aria-label="Your comment"
                              required></textarea>

                    <button type="submit">Post comment ↗</button>
                </form>

                <div id="commentList">
                    ${renderComments(id)}
                </div>
            </section>
        </div>
    `;

    dialog.showModal();

    $("#commentForm").addEventListener("submit", event => {
        event.preventDefault();

        const form = event.currentTarget;
        const name = form.elements.name.value.trim();
        const text = form.elements.text.value.trim();

        if (!name || !text) return;

        const comments = getComments(id);

        comments.push({
            name,
            text,
            date: new Date().toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric"
            })
        });

        try {
            localStorage.setItem(
                `margin-comments-${id}`,
                JSON.stringify(comments)
            );

            $("#commentList").innerHTML = renderComments(id);
            form.reset();
            renderStories();

            notify("Comment saved on this device.");
        } catch {
            notify("Unable to save. Check browser storage settings.");
        }
    });
}

// Category filters
$("#filters").addEventListener("click", event => {
    const button = event.target.closest("[data-category]");

    if (!button) return;

    activeCategory = button.dataset.category;

    document.querySelectorAll(".filter").forEach(filter => {
        filter.classList.toggle("active", filter === button);
    });

    renderStories();
});

// Search
searchInput.addEventListener("input", renderStories);

// Reset filters
$("#resetFilters").addEventListener("click", () => {
    activeCategory = "All";
    searchInput.value = "";

    document.querySelectorAll(".filter").forEach(filter => {
        filter.classList.toggle(
            "active",
            filter.dataset.category === "All"
        );
    });

    renderStories();
});

// Article dialog
$("#closeDialog").addEventListener("click", () => dialog.close());

dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
});

// Dark mode
$("#themeToggle").addEventListener("click", () => {
    const dark = document.body.classList.toggle("dark");

    $("#themeToggle").textContent = dark ? "☀" : "◐";

    try {
        localStorage.setItem("margin-theme", dark ? "dark" : "light");
    } catch {}
});

try {
    if (localStorage.getItem("margin-theme") === "dark") {
        document.body.classList.add("dark");
        $("#themeToggle").textContent = "☀";
    }
} catch {}

// Mobile navigation
$("#menuToggle").addEventListener("click", () => {
    const nav = $("#navigation");
    const open = nav.classList.toggle("open");

    $("#menuToggle").setAttribute("aria-expanded", String(open));
});

document.querySelectorAll("#navigation a").forEach(link => {
    link.addEventListener("click", () => {
        $("#navigation").classList.remove("open");
        $("#menuToggle").setAttribute("aria-expanded", "false");
    });
});

// Topic cards
document.querySelectorAll("[data-topic]").forEach(button => {
    button.addEventListener("click", () => {
        activeCategory = button.dataset.topic;
        searchInput.value = "";

        document.querySelectorAll(".filter").forEach(filter => {
            filter.classList.toggle(
                "active",
                filter.dataset.category === activeCategory
            );
        });

        renderStories();
        $("#stories").scrollIntoView({ behavior: "smooth" });
    });
});

// Newsletter demonstration
$("#newsletterForm").addEventListener("submit", event => {
    event.preventDefault();

    $("#newsletterMessage").textContent =
        "Demo only: connect an email service to receive subscriptions.";

    $("#email").value = "";
});

// Footer year
$("#year").textContent = new Date().getFullYear();

// Initial render
renderStories();
```
