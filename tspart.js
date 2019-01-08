// colores
let negro, blanco, colorFondo;

// el canvas
let canvas;

// si true vertical, si no, horizontal
let vertical = true;

// para controlar la carga de las imágenes
let imgCargada, mostrarImg = false;

// imagen de fondo
let img;

// medidas del canvas
let ancho, alto;

// medidas de la imagen
let anchoImg, altoImg, xImg, yImg;

// control para que no pinte cuando se clicka derecho o centro
let clickDerechoOCentro = false;

// control para cuando se ha aplicado el threshold a la imagen
let thresholdAplicado

function setup() {
	negro = color(0);
	blanco = color(255);
	colorFondo = blanco;//color(245);
	estableceMedidasCanvas();
	canvas = createCanvas(ancho, alto);
	canvas.parent("div_canvas");
	anteriorX = mouseX;
	anteriorY = mouseY;
	grosorLinea = 10;
	stroke(blanco);
	background(colorFondo);
	noLoop();
}

function draw() {
	// nada que poner aquí ...
}

function pintarImagen() {
	background(colorFondo);
	calculaMedidasImagen();
	image(img, xImg, yImg, anchoImg, altoImg);
}

function enviar() {
	saveFrames('out', 'png', 1, 1, function (data) {
		loadImage(data[0].imageData, function (primerFrame) {

			var imagen = {
				base64: primerFrame.canvas.toDataURL(),
				vertical: vertical
			};

			httpPost("http://plotter.ddns.net:8080/imagen/enviar", 'json', imagen, function (result) {
				img = null;
				imgCargada = false;
				mostrarImg = false;
				console.log(result);
				repintarFondo();
				estadoControles();
			}, function (error) {
				console.log("Hubo un error al enviar la imagen");
				console.log(error);
			});
		});
	});
}

function touchStarted() {
	if(mouseIsPressed && mouseButton === RIGHT || mouseButton === CENTER) {
		clickDerechoOCentro = true;
		return;
	}
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
}

function pintaLinea() {
	strokeWeight(grosorLinea);
	line(anteriorX, anteriorY, mouseX, mouseY);
	anteriorX = mouseX;
	anteriorY = mouseY;
}

function aplicaThreshold(valor){
	if (imgCargada && mostrarImg) {
		thresholdAplicado = true;
		background(colorFondo);
		calculaMedidasImagen();
		image(img, xImg, yImg, anchoImg, altoImg);
		filter(THRESHOLD, map(valor, 0, 100, 0, 1));
		estadoControles();
	}
}