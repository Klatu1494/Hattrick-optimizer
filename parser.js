var players = ""
for (var i = 0; i < 22; i++) {
  var form = $(".playerInfo")[i].children[2].children[2].innerText;
  switch (form) {
    case "desastroso":
      form = 1;
      break;
    case "horrible":
      form = 2;
      break;
    case "pobre":
      form = 3;
      break;
    case "débil":
      form = 4;
      break;
    case "insuficiente":
      form = 5;
      break;
    case "aceptable":
      form = 6;
      break;
    case "bueno":
      form = 7;
      break;
    case "excelente":
      form = 8;
      break;
  }
  players += "new Player(\"" + $(".playerInfo")[i].children[0].innerText.substr(0, $(".playerInfo")[i].children[0].innerText.length - 1) + "\",{\ngoalkeeper: " + $(".playerInfo")[i].children[3].children[0].children[0].children[1].children[0].alt.slice(0, 1) + ",\ndefending: " + $(".playerInfo")[i].children[3].children[0].children[1].children[1].children[0].alt.slice(0, 1) + ",\nplaymaking: " + $(".playerInfo")[i].children[3].children[0].children[2].children[1].children[0].alt.slice(0, 1) + ",\nwing: " + $(".playerInfo")[i].children[3].children[0].children[2].children[1].children[0].alt.slice(0, 1) + ",\npassing: " + $(".playerInfo")[i].children[3].children[0].children[2].children[1].children[0].alt.slice(0, 1) + ",\nscoring: " + $(".playerInfo")[i].children[3].children[0].children[2].children[1].children[0].alt.slice(0, 1) + ",\nform: " + form + ",\nisTechnical: " + ($(".playerInfo")[i].innerText.indexOf("[Técnico]") !== -1) + "}),\n";
}