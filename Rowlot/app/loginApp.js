/**
 * Created by ASUS_01 on 24/03/2017.
 */
(function(){

    // Initialize Firebase
    const config = {
        apiKey: "AIzaSyAPsDLUl-siK8xadixI8emwb0N08JEhzpY",
        authDomain: "rowlot-c9891.firebaseapp.com",
        databaseURL: "https://rowlot-c9891.firebaseio.com",
        storageBucket: "rowlot-c9891.appspot.com",
        messagingSenderId: "844762296892"
    };

    firebase.initializeApp(config);
    const rootRef = firebase.database().ref();
    // Firebas Auth
    //Get Elements to sing up

    const txtEmail = document.getElementById('textEmail');
    const txtPassword = document.getElementById('textPassword');
    const btnLogin = document.getElementById('btnLogin');
    let permiso = false;

    // Add Login event
    btnLogin.addEventListener('click', function(e) {

        //Get email and Pass
        let email = txtEmail.value;
        const pass = txtPassword.value;
        const auth = firebase.auth();

        //Sign In
        auth.signInWithEmailAndPassword(email, pass).catch(function (error) {
            console.log('logeandoerror');
            // Handle Errors here.
            const errorCode = error.code;
            console.log(error.message);
            permiso = true;
            // ...
        });
        console.log('logeado');
    });

    // Add a realtime listener
    firebase.auth().onAuthStateChanged(function(user) {
        if(user) {
            if (permiso == true) {
                window.location.href = 'index5.html';
            };
            console.log(user);
        }else{
            console.log('not logged in');
        }
    });

})();