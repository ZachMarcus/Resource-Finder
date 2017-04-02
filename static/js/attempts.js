
// function addPrinterInfo(responseText, index) {
//   console.log(printerList[index]["IP Address"])
// }


// function httpGetAsync(theIP, callback, index) {
//   var xmlHttp = new XMLHttpRequest();
//   console.log("in async");
//   xmlHttp.onreadystatechange = function() {
//     if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
//       console.log("received response")
//       callback(xmlHttp.responseText, index);
//     }
//   }
//   xmlHttp.open("GET", "https://" + theIP, true); // async signaled by the true
//   xmlHttp.send(null)
// }

$("#printerRequest").click(function() {
  console.log("hi");
  $.get(
    "https://" + printerList[0]["IP Address"],
    function(data, status) {
      console.log("Status: " + status);
    });
});


function requestPrinter() {
  var index = 0;
  console.log(printerList[0]["IP Address"]);
  // $.get("https://" + printerList[0]["IP Address"], function(data, status) {
  //   //$(".result").html(data);
  //     console.log("load was performed");
  // });
  // console.log("about to async");
  // httpGetAsync(printerList[0]["IP Address"], addPrinterInfo, index);
  // console.log("just asynced");

  // $.get("https://" + printerList[0]["IP Address"])
  //   .done(function(data) {
  //     console.log("hi there");
  //   })
  //   .fail(function(jqXHR, textStatus, errorThrown) {
  //     console.log("fuck");
  //     //console.log(jqXHR);
  //     console.log(textStatus);
  //     console.log(errorThrown);
  //   });

  $.ajax({
    url: "http://" + printerList[0]["IP Address"],
    type: "GET",
    success: function(data) {
      console.log("SUCCESS!");
    },
    error: function(data) {
      console.log("FUCK");
    }
  });


}

