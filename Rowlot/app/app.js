/**
 * Created by ASUS_01 on 23/03/2017.
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

    // Firebas Auth
    //Get Elements to sing up

    const txtName = document.getElementById('textName');
    const txtLastName = document.getElementById('textLastName');
    const txtEmail = document.getElementById('textEmail');
    const txtPassword = document.getElementById('textPassword');
    const btnSignUp = document.getElementById('btnSignUp');
    const btnLogin = document.getElementById('btnLogin');

    // Add Login event
    /*
    btnLogin.addEventListener('click', function(e) {

        //Get email and Pass
        let email = txtEmail.value;
        const pass = txtPassword.value;
        const auth = firebase.auth();

        //Sign In
        auth.signInWithEmailAndPassword(email, pass).catch(function (error) {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // ...
        });

    });*/

    // Add signup event
    btnSignUp.addEventListener('click', function(e){

        //Get email and Pass
        let email = txtEmail.value;
        const pass = txtPassword.value;
        const auth = firebase.auth();
        let name = txtName.value;
        let lastName = txtLastName.value;

        console.log('antes de crear');

        //Registro
        auth.createUserWithEmailAndPassword(email,pass)

        //Me devuelve al usuario
            .then(function(user){
                console.log('uid',user.uid);
                //const uid = user.uid;}
                writeUserData(user.uid,email, pass,'imagencita', name, lastName);

                const  promise = auth.signInWithEmailAndPassword(email,pass);
                promise.catch(e => console.log(e.message));

                //Here if you want you can sign in the user
            }).catch(function(error) {
            //Handle error
            console.log('error de registro', error);

        });

        /*
         firebase.auth().signInWithEmailAndPassword(email, pass).catch(function(error) {
         // Handle Errors here.
         // var errorCode = error.code;
         console.log('logeado');
         console.log(error);

         });
         */
    });




    //Funcion donde agrego los datos del usuario creado
    //a la base de datos, con el UID <3
    function writeUserData(userId, email, pass, imageUrl, nombre, apellido) {
        console.log('basededatos');
        firebase.database().ref('Usuarios/' + userId).set({
            Nombre: nombre,
            Apellido: apellido,
            email: email,
            Contrasena: pass,
            profile_picture : imageUrl,
            experiencia: 0,
            Moneda: 300,
            Tipo: 'Estudiante',
            Vida: 5

        });
    }

    // Add a realtime listener
    firebase.auth().onAuthStateChanged(user => {
        if(user){
            console.log(user);
        }else{
            console.log('not logged in');
        }
    });

    /* Salir
     firebase.auth().signOut().then(function() {
     console.log('Signed Out');
     }, function(error) {
     console.error('Sign Out Error', error);
     });
     */
})();



// Sync object changes
//dbRefObject.on('value', snap => console.log(snap.val()));