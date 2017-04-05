# Resource-Finder
This project was developed as part of the 2017 Hardware Hackathon: Club Snell Edition
hosted by the Northeastern University Wireless and Generate Clubs. The Resource-Finder aims
to provide a proof of concept for a simple interface that helps students find campus resources. 
The scope of project was to demonstrate the use of a web interface providing two 
of many possible services that could be incorporated:
1. Printer Tracker
2. Desk Tracker

## Printer Tracker
Many students on campus have a difficult time finding printers on campus. 
The printer tracker module seeks to address this need by plotting all the university
printers on a map and showing routes to the nearest three. We use the 
Google Maps API to show maps, calculate distances, and overlay routes. Further,
we provide status inforation to the user including location, ink levels, and max paper count. 

In the future, this service can be expanded upon by offering the ability to submit
print jobs, report errors, and even incorporate printer load to give users more
information as to which printers to use. 

## Desk Tracker
The seat tracker uses a reflective IR sensor to detemine whether or not a person
is sitting at a desk in the library. The sensor was designed to be mounted under
desks on the third and fourth floors. We decided to choose desk occupancy rather
rather than seats because seats can migrate overtime and are therfore more
difficult to pin to absolute locations. The sensors utilize XBee radio modules
to send data back to a central host where the online service can be updated. 

## Presentation
The presentation pitch for the judges panel can be found as a Google Slide
[here](https://docs.google.com/presentation/d/1Xl91hZJXQREt4FON7e__c784DFhDaDnBIEqxcMSJ-Pw/edit?usp=sharing)

## Installation and Usage

Make sure you have necessary libraries and are running python3:
'''	
        pip3 install Flask
	pip3 install beautifulsoup4
	pip3 install requests
	pip3 install lxml
'''
OSX users may need to install additional dependencies for lxml.
* libxml2
* libxslt 

If running on Linux/OSX:
'''
        export FLASK_APP=index.py
	python3 -m flask run
'''

If running on Windows:
'''
	set FLASK_APP=index.py
	python3 -m flask run
'''

And go to: [http://127.0.0.1:5000/index.html]
