//guarda los puntos que se capturan desde que se empieza hasta que se termina el trazo 
let puntos = [];

// guarda todas las curvas que se han capturado
let curvas = [];

// las curvas tienen id
let n = 0;

// el canvas
let canvas;

// si true vertical, si no, horizontal
let vertical = true;

// para controlar la carga de las imágenes
let imgCargada, imgPintada, imgSolicitada;

// imagen de fondo
let img;

// url de la imagen de fondo a cargar
let url = "http://ritchie.euitio.uniovi.es/~UO250687/escuela.jpg";
let path = "http://plotter.ddns.net:82/dibujo/0/imprimir";

// medidas del canvas
let ancho, alto;

function setup() {
    negro = color(0);
    blanco = color(255);
    colorFondo = color(240);

    estableceMedidasCanvas();

    canvas = createCanvas(ancho, alto);
    canvas.parent("div_canvas");

    anteriorX = mouseX;
    anteriorY = mouseY;
    grosorLinea = 5;

    stroke(color(0));
    background(colorFondo);

}

function windowResized() {
    estableceMedidasCanvas();
	redimensionarCanvas();
}

function estableceMedidasCanvas() {
	n = 800;
    if (vertical) {
		do {
			ancho = min(n, windowWidth * 0.80);
			alto = ancho * pow(2, 0.5);			
			n -= 10;
		} while(ancho > windowWidth * 0.80 || alto > windowHeight * 0.80 );
    } else {
		do{			
			alto = min(n, windowHeight * 0.80);
			ancho = alto * pow(2, 0.5);
			n -= 10;
		} while(ancho > windowWidth * 0.80  || alto > windowHeight * 0.80 );
    }
}

function redimensionarCanvas(){
    resizeCanvas(ancho, alto);	
	limpiar();
}

function girarOrientacion() {
    vertical = !vertical;
    estableceMedidasCanvas();
	redimensionarCanvas();
}

function draw() {
    if (imgSolicitada && !imgCargada) {
        imgSolicitada = false;
        console.log('start loading');
        loadImage(url, function(i) {
            imgCargada = true;
            img = i;
        }, function(e) {
            console.log(e);
        })
    }
    if (imgCargada && !imgPintada) {
		background(colorFondo);
        imgPintada = true;
        tint(255, 128);

        let alAncho = 1.0 * width / img.width;
        let alAlto = 1.0 * height / img.height;

        let anchoImg, altoImg, xImg, yImg;

        if (alAlto < alAncho) {
            anchoImg = img.width * alAlto;
            altoImg = img.height * alAlto;
            xImg = width / 2 - anchoImg / 2;
            yImg = 0;
        } else {
            anchoImg = img.width * alAncho;
            altoImg = img.height * alAncho;
            xImg = 0;
            yImg = height / 2 - altoImg / 2;
        }

        image(img, xImg, yImg, anchoImg, altoImg);
        filter(GRAY);
    }
}

/**
	De momento carga siempre la misma imagen.
	mirar cargar iamgen con el formulario de html5 para que el usuario pueda poner la imagen que quiera
	alternativa: tener una serie de imágenes ya predefinidas para escoger
	
	pendiente ajustar al lienzo
*/
function cargaImagenFondo() {
    console.log("alguien ha llamado a cargaImagen");
    imgCargada = false;
    imgPintada = false;
    imgSolicitada = true;
}

function limpiar() {
    background(colorFondo);
    if (imgPintada) {
        cargaImagenFondo();
    }
}

function enviar() {
	console.log("alguien ha llamado a enviar");
	httpPost(path, 'json', curvas, function(result){
		console.log("parece que todo fue bien");
		console.log(result);
	}, function(error){
		console.log("parece que hubo un error");
		console.log(error);
	});
}

function touchStarted() {
    anteriorX = mouseX;
    anteriorY = mouseY;
}

function pintaLinea() {
    anyadePunto();
    strokeWeight(grosorLinea);
    line(anteriorX, anteriorY, mouseX, mouseY);
    anteriorX = mouseX;
    anteriorY = mouseY;
}

function touchMoved() {
    pintaLinea();
    return mouseX <= 0 || mouseY <= 0 || mouseX >= width || mouseY >= height; /* return false cuando no se clicka en el canvas para evitar el scroll o reload en los móviles */
}

function touchEnded() {
    pintaLinea();
    anyadeCurva();
}

function anyadeCurva() {
    if (typeof puntos !== "undefined" && puntos != null && puntos.length != null && puntos.length > 0) {
        curvas.push(new Curva(puntos, n));
        puntos = [];
        n++;
        console.log("Se ha añadido una curva");
        console.log(curvas);
    }
}

function anyadePunto(cursor) {

    let punto = new Punto(mouseX, mouseY);
    if (mouseX >= 0 && mouseY >= 0 && mouseX <= width && mouseY <= height &&
        (
            typeof puntos !== "undefined" &&
            puntos != null &&
            puntos.length != null &&
            puntos.length <= 0
			||
            !(puntos[puntos.length - 1].x === punto.x &&
                puntos[puntos.length - 1].y === punto.y)
		)
    ) {
        puntos.push(punto);
        console.log("Se ha añadido un punto");
    }

}

function Curva(puntos, n) {
    this.n = n;
    this.puntos = [].concat(puntos);
}

function Punto(x, y) {
    this.x = x;
    this.y = y;
}