var printerListContainer = "#printerListPanels";

/*
<div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a data-toggle="collapse" href="#collapse1">"Building Name"</a>
      </h4>
    </div>
    <div id="collapse1" class="panel-collapse collapse">
      <ul class="list-group">
        <li class="list-group-item">"Printer One"</li>
        <li class="list-group-item">"Printer Two"</li>
        <li class="list-group-item">"Printer Three"</li>
      </ul>
    </div>
  </div>
</div>
*/

for (printerCounter in printerList) {
	printer = printerList[printerCounter];
	var parentTag;
	parentTag = genDivTag(printer, div, "panel-group", printerListContainer, "panel-group");
	parentTag = genDivTag(printer, div, "panel panel-default", parentTag, "panel");
	parentTag = genDivTag(printer, div, "panel-heading", parentTag, "panel-heading");
	
	var div = document.createElement("h4");
		div.setAttribute("class", "panel-title");
		div.setAttribute("id", printer.IPAddress + "panel-title");
		$(parentTag).appendChild(div);
	div = document.createElement("a");
		div.setAttribute("data-toggles", "collapse");
		div.setAttribute("href", printer.IPAddress + "panel-collapse");
		div.setAttribute("id", printer.IPAddress + "collapse");
		div.setText(printer.DeviceName);
		$(printer.IPAddress + "panel-title").appendChild(div);
	
	parentTag = genDivTag(printer, div, "panel-collapse collapse", printer.IPAddress + "panel", "panel-group", "collapse");
	div = document.createElement("ul");
		div.setAttribute("class", "list-group");
		div.setAttribute("id", printer.IPAddress + "list-group")

}

function genDivTag(printer, elementTag, classAttributes, parentTag, classTag){
	var div = document.createElement(elementTag);
	div.setAttribute("class", classAttributes);
	div.setAttribute("id", printer.IPAddress + classTag);
	$(parentTag).appendChild(div);
}