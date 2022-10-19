
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.12.0/firebase-auth.js";


import {
    getFirestore,
    collection,
    doc,
    addDoc,
    setDoc,
    query,
    getDoc,
    getDocs,
    onSnapshot,
    updateDoc,
    where,
    orderBy,
    arrayUnion,
    arrayRemove,
} from "https://www.gstatic.com/firebasejs/9.12.0/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.12.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBL_2PS1I6p-wOyu-2shiNS9g6yR84QNK4",
    authDomain: "fakebookpostingapp.firebaseapp.com",
    projectId: "fakebookpostingapp",
    storageBucket: "fakebookpostingapp.appspot.com",
    messagingSenderId: "991432871773",
    appId: "1:991432871773:web:a0a7e1dab8dee6f531a2b4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let unsubscribe;



// ===========================Login Account=======================================

const loginbtn = document.getElementById("login1-btn");
if (loginbtn) {
    loginbtn.addEventListener("click", (e) => {
        e.preventDefault()
        console.log("test login")
        const email = document.getElementById("l-email")
        const password = document.getElementById("l-password")
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email.value, password.value)
            .then(async (userCredential) => {
                const user = userCredential.user;
                window.location = "./pages/portal.html"

            })

            .catch((error) => {
                const errorMessage = error.message;
                console.log(errorMessage)
            });
    })


}
// ==========================================================================================


//===================================  Register Account ====================================

const registerbtn = document.getElementById("register-btn");
if (registerbtn) {

    const register = (e) => {
        e.preventDefault()
        const username = document.getElementById("username");
        const email = document.getElementById("r-email");
        const password = document.getElementById("password");
        const phoneNumber = document.getElementById("phoneNumber");

        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email.value, password.value)
            .then(async (userCredential) => {
                const uid = userCredential.user.uid;

                let firstdoc = doc(db, "users", uid);
                await setDoc(firstdoc, {
                    name: username.value,
                    email: email.value,
                    phoneNumber: phoneNumber.value,
                });
                const profilePic = document.getElementById("profilePic")
                let file = profilePic.files[0];
                let url = await uploadFiles(file);
                const testdoc = doc(db, "users", uid);
                await updateDoc(testdoc, {
                    profile: url,
                });
            })

            .catch((error) => {
                const errorMessage = error.message;
                console.log(errorMessage)

            });
    }

    registerbtn.addEventListener("click", register)
}
// ====================================================================================

window.onload = () => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
        if (user) {


            getUserFromDatabase(user.uid)
        } else {
            console.log("user Not Found")

        };
    });
};


//============================ Getting Data from firestore================================
const getUserFromDatabase = async (uid) => {
    const docRef = doc(db, "users", uid)
    const docSnap = await getDoc(docRef);
    let currentUser = document.getElementById("current-user")
    if (docSnap.exists()) {
        let profile = document.getElementById("pp")
        profile.src = docSnap.data().profile
        currentUser.innerHTML = `${docSnap.data().name}`
        getAllUser(docSnap.data().email);
    } else {
        console.log("no such document")
    }
};







//==================================  Uploading Image ===================================
const uploadFiles = (file) => {
    return new Promise((resolve, reject) => {
        const storage = getStorage();
        const auth = getAuth();
        let uid = auth.currentUser.uid;
        const storageRef = ref(storage, `users/${uid}.png`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("Upload is " + progress + "% done");
                switch (snapshot.state) {
                    case "paused":
                        console.log("Upload is paused");
                        break;
                    case "running":
                        console.log("Upload is running");
                        break;
                }
                if (progress == 100) {
                    Swal.fire(
                        'Good job!',
                        'Account Created',
                        'success'
                    )
                } else {
                    Swal.fire(
                        'Please Wait',
                        'it may take sometime',
                        'success'
                    )

                }
            },
            (error) => {
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
};
// ==================================================================



// ================================GETTING ALL USERS ====================================
const getAllUser = async (email) => {
    const q = query(collection(db, "users"), where("email", "!=", email));
    const querySnapshot = await getDocs(q);
    let users = document.getElementById("users")
    querySnapshot.forEach((doc) => {
        users.innerHTML += `<li><img src="${doc.data().profile}"/> ${doc.data().name}</li>`

    });
}
// ========================================================================




// ================================Log Out=======================================
const logout = document.getElementById("logOut-btn");
if (logout) {

    logout.addEventListener("click", () => {
        window.location = "../index.html"
    });

}

// ======================================================================


var quill = new Quill("#editor", {
    theme: "snow",
});



// ========================== Creating Post ========================================
let CreatePost = () => {
    // if (unsubscribe) {
    //     unsubscribe();
    // }
    const auth = getAuth()
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const docRef = doc(db, "users", user.uid)
            const uid = user.uid
            const docSnap = await getDoc(docRef)
            console.log(docSnap.data())
            var delta = quill.root.innerHTML
            //  ========== Adding Post into firestore ====================================
            await addDoc(collection(db, "posts"), {
                sender_name: docSnap.data().name,
                post: delta,
                sender_pic: docSnap.data().profile,
                sender_id: uid,
                timestamp: new Date(),
                likes: [],
                lastlike: ""
            })

        }
    })


}


const createPost = document.getElementById("getText");
if (createPost) {
    createPost.addEventListener("click", CreatePost)
}


// ==============================Loading Post on load===========================

let loadAllPost = () => {
    const q = query(
        collection(db, "posts"),
        orderBy("timestamp", "desc")
    )
    const auth = getAuth()
    let post = document.getElementById("post")
    unsubscribe = onSnapshot(q, (querySnapshot) => {
        post.innerHTML = ""

        querySnapshot.forEach((doc) => {
            post.innerHTML += `<div class="post-main">
            <div class="content-header">
            <div class="testing">
            <img src="${doc.data().sender_pic}" id="posting-pic"/>
            <h6 style="font-weight:bold">${doc.data().sender_name}</h6></div>
            <p style="float:right !important;font-size:10px">${doc.data().timestamp.toDate().toDateString()}</p>
            </div>
            
            <div class="posting-content">${doc.data().post}
            </div>
            <span class="likenames">(${doc.data().likes.length})
             ${doc.data().lastlike ? `${doc.data().lastlike} like this` : ""
                } </span><hr> ${doc.data().likes.indexOf(auth.currentUser.uid) !== -1
                    ? `<button class="feedback-btns" onclick="unLikePost('${doc.id}')">Unlike</button>`
                    : `<button class="feedback-btns" onclick="likePost('${doc.id}')" >Like</button>`}
                    </div>`

        });
    });
}
loadAllPost()

//  =============================== Post Like ================================

const likePost = async (id) => {

    const auth = getAuth()
    const likeRef = doc(db, "users", auth.currentUser.uid)
    const likeSnap = await (getDoc(likeRef))
    // console.log(doc.data().name)
    // console.log(likeSnap.data())

    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, {
        likes: arrayUnion(auth.currentUser.uid),
        lastlike: likeSnap.data().name

    });
}

const unLikePost = async (id) => {
    const auth = getAuth()
    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, {
        likes: arrayRemove(auth.currentUser.uid),
    });
};
window.likePost = likePost
window.unLikePost = unLikePost;

// ===========================================================


// const commentPost = () => {
//     console.log("test")
// }



// window.commentPost = commentPost;