/**
 * Created by ASUS_01 on 25/03/2017.
 */

(function() {

    // Initialize Firebase
    const config = {
        apiKey: "AIzaSyAPsDLUl-siK8xadixI8emwb0N08JEhzpY",
        authDomain: "rowlot-c9891.firebaseapp.com",
        databaseURL: "https://rowlot-c9891.firebaseio.com",
        storageBucket: "rowlot-c9891.appspot.com",
        messagingSenderId: "844762296892"
    };

    firebase.initializeApp(config);
    //acceso al servicio bd
    database = firebase.database();
    //Mi nodo de Usuarios
    let ref = database.ref('Usuarios');
    ref.on('value', function (ss) {
        //let nombre = ss.val();

        let nombres = ss.val();
        //tengo las keys de los usuarios en un array
        let keys = Object.keys(nombres);
        console.log(keys);

        for (let i = 0; i < keys.length; i++){
            let k = keys [i];
            // Saco el nombre
            let nombre = nombres[k].Nombre;
            // Saco el apellido
            let apellido = nombres[k].Apellido;
            // console.log(nombre, apellido);

            document.getElementById('nombreUsuario').innerHTML = nombre + ' ' + apellido;

        }

    });


}

)();

function gotData(snapshot) {
    //console.log(data.val());
    console.log(snapshot.val());

    /*
    let nombres = data.val();
    //tengo las keys de los usuarios en un array
    let keys = Object.keys(nombres);
    console.log(keys);

    for (let i = 0; i < keys.length; i++){
        let k = keys [i];
        // Saco el nombre
        let nombre = nombres[k].Nombre;
        // Saco el apellido
        let apellido = nombres[k].Apellido;
        // console.log(nombre, apellido);
        let span = createElement('a', nombre + ':' + apellido);
        span.parent('nombreUsuario');
    }
    */
}

function errorData (err) {
    console.log('Error!');
    console.log(err);
}
