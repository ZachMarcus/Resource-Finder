from flask import Flask, request

from bs4 import BeautifulSoup

import csv
import requests
from time import sleep

import threading


class individualPrinter(object):
	def __init__(self, ip):
		self.ipAddress = ip
		self.inkStatus = None
		self.paperSupply = None

		self.indexResponse = requests.get('http://' + str(self.ipAddress), verify=False)
		self.deviceResponse = requests.get('http://' + str(self.ipAddress) + '/hp/device/DeviceInformation/View',verify=False)

		if self.indexResponse.status_code is not 200:
			print('Request Failed: ' + str(self.indexResponse.status_code) + ' from ' + self.indexResponse.url)
		if self.deviceResponse.status_code is not 200:
			print('Request Failed: ' + str(self.deviceResponse.status_code) + ' from ' + self.deviceResponse.url)

		self.parseResponse()

	def parseResponse(self):
		print('hi')
		soup = BeautifulSoup(self.indexResponse.text, "lxml")
		
		self.inkStatus = int(str(soup.find("span", {"id": "SupplyPLR0"})).split(">")[1].split("%")[0])

		isFull = None
		sheetCapacity = None
		totalCount = 0

		table = str(soup.find("table", {"id": "MediaTable"}).tbody)
		for entry in table.split("span class="):
			if "status" in entry:
				isFull = "status-full" in entry
				sheetCapacity = entry.split("td")[2].split(">")[-1][:-2]
				if isFull and sheetCapacity:
					totalCount = totalCount + int(sheetCapacity.split(" ")[0])
		
		self.paperSupply = totalCount
		#print(self.inkStatus, self.paperSupply)



class printerStatus(object):
	def __init__(self, printerListFile):
		self.printerDicts = {}
		self.printerInfoDict = {}
		with open(printerListFile, 'r') as fil:
			dictReader = csv.DictReader(fil)
			for row in dictReader:
				key = row.pop('IP Address')
				if key in self.printerDicts.keys():
					print('IP address appears twice in csv')
					pass
				self.printerDicts[key] = row	

	def query(self):
		count = 0
		limit = 3
		for key in self.printerDicts.keys():
			count = count + 1
			if count >= limit:
				return
			#print(key)
			printer = individualPrinter(key)
			self.printerInfoDict[key] = printer

def worker():
	while(True):
		allPrinterStatuses = printerStatus("data/printerList.csv")
		allPrinterStatuses.query()
		sleep(60)


app = Flask(__name__, static_url_path="")


@app.route("/")
def run_app():
	return "Hello, world"

#@app.route("/index.html")
#def index():
#	return render_template("index.html")

#@app.route("/index/")
#def root():
#	return app;send_static_file("index.html")


@app.route("/<path:path>")
def status_file(path):
	return app.send_static_file(path)


threads = []
t = threading.Thread(target=worker)
t.start()
