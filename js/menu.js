// Traiga el archivo menu.html
fetch("menu.html")

// Conviértalo a texto
.then(response => response.text())

// Cuando esté listo → páselo a data
.then(data => {

  // document.getElementById("menu")
  // busca en la página el elemento que tenga id="menu"
  
  // inserta el contenido del menú dentro de ese elemento
  document.getElementById("menu").innerHTML = data;

});