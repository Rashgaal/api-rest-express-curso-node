const debug = require('debug')('app:inicio');
// const dbDebug = require('debug')('app:db');
const express = require('express');
const config = require('config');
//const logger = require('./logger');
const morgan = require('morgan');
const Joi = require('joi');
const app = express();

//metodos
// app.get();
// app.post();
// app.put();
// app.delete();

//json
app.use(express.json());//body
//formulario
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));

//Configuracion de entornos
console.log('Aplicacion: ' + config.get('nombre'));
console.log('BD server: ' + config.get('configDB.host'));

//Uso middleware de terceros - Morgan
if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    console.log('Morgan habilitado...');
    debug('Morgan esta habilitado.');
}

//Trabajos con la base de datos
debug('Conectando con la base de datos...');

//app.use(logger);
// app.use(function(req,res,next){
//     console.log('Autenticando...');
//     next();
// });

const usuarios = [
    { id: 1, nombre: 'Quino' },
    { id: 2, nombre: 'Jose' },
    { id: 3, nombre: 'Ana' },
]

//ruta raiz
app.get('/', (req, res) => {
    res.send('Hola mundo desde Express');
});
//ruta api/usuarios
app.get('/api/usuarios', (req, res) => {
    res.send(usuarios);
});
// //ruta para un usuario
// app.get('/api/usuarios/:id', (req, res) => {
//     res.send(req.params.id)
// })
// //ruta para los parametros
// app.get('/api/usuarios/:year/:mes', (req, res) => {
//     // ver parametros
//     // res.send(req.params);
//     // ver query
//     res.send(req.query);
// });

// app.get('/api/usuarios/:year/:mes', (req, res) => {
// });

app.get('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id);
    if (!usuario) res.status(404).send('El usuario no fue encontrado');
    res.send(usuario);
})

//post
app.post('/api/usuarios', (req, res) => {
    //por formulario
    // let body = req.body;
    // console.log(body.nombre);
    //res.json({body})
    //por json
    //Validacion con Joi
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
    const { error, value } = validarUsuario(req.body.nombre);
    // console.log(result);
    if (!error) {
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    } else {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }

    //validacion previa al usuario
    // if(!req.body.nombre || req.body.nombre.length<= 2 ){
    //     //400 Bad Request
    //     res.status(400).send('Debe ingresar un nombre, que tenga minimo tres letras');
    //     return;
    // }
    // //creacion de usuario

});

//update
app.put('/api/usuarios/:id', (req, res) => {
    //let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    let usuario = existeUsuario(req.params.id)
    if (!usuario) {
        res.status(404).send('El usuario no fue encontrado');
        return;
    }

    const { error, value } = validarUsuario(req.body.nombre);
    // console.log(result);
    if (error) {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }

    usuario.nombre = value.nombre;
    res.send(usuario);
});

//delete
app.delete('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id)
    if (!usuario) {
        res.status(404).send('El usuario no fue encontrado');
        return;
    }

    const index = usuarios.indexOf(usuario);

    usuarios.splice(index, 1);

    res.send(usuario);
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}...`)
});

function existeUsuario(id) {
    return (usuarios.find(u => u.id === parseInt(id)));
};

function validarUsuario(nom) {
    const schema = Joi.object({
        nombre: Joi.string().min(3).required(),
    });
    return schema.validate({ nombre: nom })
}