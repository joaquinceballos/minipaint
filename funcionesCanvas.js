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
}

function girarOrientacion() {
	vertical = !vertical;
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
	image(img, xImg, yImg, anchoImg, altoImg);
}

function cargaImagen(input) {
	console.log("hola");
	var file = input.files[0];
    var reader = new FileReader();
	reader.onload = function (e) {
		loadImage(e.target.result, function(imagen){
			img = imagen;
			imgCargada = true;
			mostrarImg = true;
			repintarFondo();
		});
    }	
    reader.readAsDataURL(file);
}

function repintarFondo() {
	background(colorFondo);
	if (imgCargada && mostrarImg) {
		pintarImagen();
	}
}
