let posts = [];

function addPost(){

    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    if(title === "" || content === ""){
        alert("Fill all fields");
        return;
    }

    posts.push({
        title,
        content,
        comments:[]
    });

    document.getElementById("title").value="";
    document.getElementById("content").value="";

    displayPosts();
}

function addComment(index){

    const input = document.getElementById(`comment-${index}`);

    if(input.value.trim()==="") return;

    posts[index].comments.push(input.value);

    displayPosts();
}

function deletePost(index){
    posts.splice(index,1);
    displayPosts();
}

function displayPosts(){

    const postsDiv = document.getElementById("posts");

    postsDiv.innerHTML="";

    posts.forEach((post,index)=>{

        let commentsHTML="";

        post.comments.forEach(comment=>{
            commentsHTML += `<li>${comment}</li>`;
        });

        postsDiv.innerHTML += `
        <div class="post">
            <h2>${post.title}</h2>
            <p>${post.content}</p>

            <button onclick="deletePost(${index})">
                Delete Post
            </button>

            <div class="comment-box">
                <input
                  id="comment-${index}"
                  placeholder="Add Comment">

                <button onclick="addComment(${index})">
                  Comment
                </button>

                <ul>
                    ${commentsHTML}
                </ul>
            </div>
        </div>
        `;
    });
}