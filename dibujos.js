// colores
let negro, blanco, colorFondo;

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
let imgCargada, mostrarImg = false;

// imagen de fondo
let img;

// url del servicio rest donde se envían los dibujos terminados
let urlRest = "http://plotter.ddns.net:8080/dibujo/enviar";

// medidas del canvas
let ancho, alto;

// medidas de la imagen
let anchoImg, altoImg, xImg, yImg;

// control para que no pinte cuando se clicka derecho o centro
let clickDerechoOCentro = false;

function setup() {
	negro = color(0);
	blanco = color(255);
	colorFondo = blanco;//color(245);
	estableceMedidasCanvas();
	canvas = createCanvas(ancho, alto);
	canvas.parent("div_canvas");
	anteriorX = mouseX;
	anteriorY = mouseY;
	grosorLinea = 3;
	stroke(negro);
	background(colorFondo);
	noLoop();
}

function draw() {
	// nada que poner aquí ...
}

function windowResized() {
	estableceMedidasCanvas();
	redimensionarCanvas();
}

function estableceMedidasCanvas() {
	let i = 800;
	if (vertical) {
		do {
			ancho = min(i, windowWidth * 0.80);
			alto = ancho * pow(2, 0.5);
			i -= 10;
		} while (ancho > windowWidth * 0.80 || alto > windowHeight * 0.80);
	} else {
		do {
			alto = min(i, windowHeight * 0.80);
			ancho = alto * pow(2, 0.5);
			i -= 10;
		} while (ancho > windowWidth * 0.80 || alto > windowHeight * 0.80);
	}
}

function redimensionarCanvas() {
	resizeCanvas(ancho, alto);
	repintarFondo();
	reDibujarCurvas();
}

function reDibujarCurvas() {
	let i, j, x0, y0, x1, y1;
	for (i = 0; i < curvas.length; i++) {
		// hay curvas que sólo tienen un punto...
		if(curvas[i].puntos.length == 1){			
			x0 = curvas[i].puntos[0].x * width;
			y0 = curvas[i].puntos[0].y * height;
			line(x0, y0, x0, y0);
		}
		for (j = 1; j < curvas[i].puntos.length; j++) {
			x0 = curvas[i].puntos[j - 1].x * width;
			y0 = curvas[i].puntos[j - 1].y * height;
			x1 = curvas[i].puntos[j].x * width;
			y1 = curvas[i].puntos[j].y * height;
			line(x0, y0, x1, y1);
		}
	}
}

function girarOrientacion() {
	vertical = !vertical;
	curvas = []; // se pierde todo el dibujo
	estableceMedidasCanvas();
	redimensionarCanvas();
}

function calculaMedidasImagen() {
	let alAncho = 1.0 * width / img.width;
	let alAlto = 1.0 * height / img.height;
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
}

function pintarImagen() {
	background(colorFondo);
	calculaMedidasImagen();
	tint(255, 128);
	image(img, xImg, yImg, anchoImg, altoImg);
	filter(GRAY);
	tint(255);
}

function mostrarOcultarImagen() {
	mostrarImg = !mostrarImg;
	repintarFondo();
	reDibujarCurvas();
}

function cargaImagen(input) {
	var file = input.files[0];
    var reader = new FileReader();
	reader.onload = function (e) {
		loadImage(e.target.result, function(imagen){
			img = imagen;
			imgCargada = true;
			mostrarImg = true;
			repintarFondo();
			reDibujarCurvas();
		});
    }	
    reader.readAsDataURL(file);
}

function repintarFondo() {
	background(colorFondo);
	if (imgCargada && mostrarImg) {
		pintarImagen();
		console.log(img.canvas.toDataURL());
	}
}

function limpiar() {
	curvas = [];
	repintarFondo();
}

function enviar() {
	var dibujo = {		
		autor : "pendiente",
		vertical : vertical,
		curvas : curvas		
	};	
	httpPost(urlRest, 'json', dibujo, function (result) {
		img = null;
		imgCargada = false;
		mostrarImg = false;
		limpiar();
		console.log(result);
		estadoControles();
	}, function (error) {
		console.log("Hubo un error al enviar el dibujo");
		console.log(error);
	});
}

function pintaLinea() {
	anyadePunto();
	strokeWeight(grosorLinea);
	line(anteriorX, anteriorY, mouseX, mouseY);
	anteriorX = mouseX;
	anteriorY = mouseY;
}

function touchStarted() {
	if(mouseIsPressed && mouseButton === RIGHT || mouseButton === CENTER) {
		clickDerechoOCentro = true;
		return;
	}
	anyadePunto();
	anteriorX = mouseX;
	anteriorY = mouseY;
}

function touchMoved() {
	if(clickDerechoOCentro) {
		return;
	}
	pintaLinea();
	return mouseX <= 0 || mouseY <= 0 || mouseX >= width || mouseY >= height; /* return false cuando no se clicka en el canvas para evitar el scroll o reload en los móviles */
}

function touchEnded() {	
	if(clickDerechoOCentro) {
		clickDerechoOCentro = false;
		return;
	}
	pintaLinea();
	anyadeCurva();
}

function anyadeCurva() {
	if (typeof puntos !== "undefined" && puntos != null && puntos.length != null && puntos.length > 0) {
		curvas.push(new Curva(puntos));
		puntos = [];
	}
	// esto no mola pero ...
	estadoControles();
}

function anyadePunto(cursor) {
	let punto = new Punto(mouseX / width, mouseY / height);
	if (mouseX >= 0 && mouseY >= 0 && mouseX <= width && mouseY <= height &&
		(
			typeof puntos !== "undefined"
			&& puntos != null
			&& puntos.length != null
			&& puntos.length <= 0
			|| !(puntos[puntos.length - 1].x === punto.x 
				&& puntos[puntos.length - 1].y === punto.y)
		)) {
		puntos.push(punto);
	}
}

function Curva(puntos) {
	this.puntos = [].concat(puntos);
}

function Punto(x, y) {
	this.x = x;
	this.y = y;
}