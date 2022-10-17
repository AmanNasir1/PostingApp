
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
    orderBy
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

const registerbtn = document.getElementById("register-btn");
if (registerbtn) {

    const register = (e) => {
        e.preventDefault()
        const username = document.getElementById("username");
        const email = document.getElementById("r-email");
        const password = document.getElementById("password");
        const phoneNumber = document.getElementById("phoneNumber");

        console.log("testing register")
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email.value, password.value)
            .then(async (userCredential) => {
                const uid = userCredential.user.uid;
                console.log(uid)

                let firstdoc = doc(db, "users", uid);
                await setDoc(firstdoc, {
                    name: username.value,
                    email: email.value,
                    phoneNumber: phoneNumber.value,
                });
                const profilePic = document.getElementById("profilePic")
                let file = profilePic.files[0];
                let url = await uploadFiles(file);
                // console.log(user.email)
                const testdoc = doc(db, "users", uid);
                console.log(testdoc)
                console.log(url)
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
const getUserFromDatabase = async (uid) => {
    const docRef = doc(db, "users", uid)
    const docSnap = await getDoc(docRef);
    let currentUser = document.getElementById("current-user")
    if (docSnap.exists()) {
        let profile = document.getElementById("pp")
        profile.src = docSnap.data().profile
        currentUser.innerHTML = `${docSnap.data().name}`
        // console.log(docSnap.data());
        getAllUser(docSnap.data().email, uid, docSnap.data().name);
    } else {
        console.log("no such document")
    }
};








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



const getAllUser = async (email, currentId, currentName) => {
    const q = query(collection(db, "users"), where("email", "!=", email));
    const querySnapshot = await getDocs(q);
    let users = document.getElementById("users")
    querySnapshot.forEach((doc) => {
        users.innerHTML += `<li><img src="${doc.data().profile}"/> ${doc.data().name}</li>`

    });
}


const logout = document.getElementById("logOut-btn");
if(logout){

    logout.addEventListener("click", () => {
        window.location = "../index.html"
    });
    
}

    
    var quill = new Quill("#editor", {
        theme: "snow",
    });
    



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
            await addDoc(collection(db, "posts"), {
                sender_name: docSnap.data().name,
                post: delta,
                sender_pic: docSnap.data().profile,
                sender_id: uid,
                timestamp: new Date()
            })

        }
    })


}


let loadAllPost = () => {
    console.log("testing loadAllPost")
    const q = query(
        collection(db, "posts"),
        orderBy("timestamp", "asc")
    )
    console.log(q)
    let post = document.getElementById("post")
    unsubscribe = onSnapshot(q, (querySnapshot) => {
        post.innerHTML = ""
        console.log(unsubscribe)
        // allMessages.innerHTML = "";
        querySnapshot.forEach((doc) => {

            post.innerHTML += `<div class="post-main">
            <div class="content-header">
            <img src="${doc.data().sender_pic}" id="posting-pic"/>
            <h6 style="font-weight:bold">${doc.data().sender_name}</h6>
            </div>
            <div class="posting-content">${doc.data().post}<div>
            </div>`;
        });
    });
}

loadAllPost()

const createPost = document.getElementById("getText");
createPost.addEventListener("click", CreatePost)

