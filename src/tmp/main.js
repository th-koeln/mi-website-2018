$(document).foundation();

 /* Main
-----------------------------------------------------------------------------*/

document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    if (document.querySelector("#eventblock")) {
      createNews();
    }
  }
}
