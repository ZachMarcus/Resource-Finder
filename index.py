
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from time import sleep

#import csv
import requests
import threading
import json

from datetime import datetime
from io import StringIO


class individualPrinter(object):
	"""
	class to store the information from a single printer
	it's not much more than a way to structure our data
	"""
	def __init__(self, ip):
		self.ipAddress = ip
		self.inkStatus = None
		self.paperSupply = None
		self.productName = None
		self.deviceName = None
		self.deviceLocation = None

		try:
			self.indexResponse = requests.get('http://' + str(self.ipAddress), verify=False, timeout=3.00)
			self.deviceResponse = requests.get('http://' + str(self.ipAddress) + '/hp/device/DeviceInformation/View',verify=False, timeout=3.00)
			self.jobResponse = requests.get("http://" + str(self.ipAddress) + "/hp/device/JobLogReport/Index", verify=False, timeout=3.00)
			

			if self.indexResponse.status_code is not 200:
				print('Request Failed: ' + str(self.indexResponse.status_code) + ' from ' + self.indexResponse.url)
			if self.deviceResponse.status_code is not 200:
				print('Request Failed: ' + str(self.deviceResponse.status_code) + ' from ' + self.deviceResponse.url)
			if self.jobResponse.status_code is not 200:
				print('Request Failed: ' + str(self.jobResponse.status_code) + ' from ' + self.jobResponse.url)

			self.parseResponse()
		except:
			pass

	"""
	\todo add extra job log status checking
	"""
	def parseResponse(self):
		#print('hi')
		indexSoup = BeautifulSoup(self.indexResponse.text, "lxml")
		self.inkStatus = str(indexSoup.find("span", {"id": "SupplyPLR0"})).split(">")[1].split("%")[0]
		deviceSoup = BeautifulSoup(self.deviceResponse.text, "lxml")
		self.productName = deviceSoup.find("p", {"id": "ProductName"}).string
		self.deviceName = deviceSoup.find("p", {"id": "DeviceName"}).string
		self.deviceLocation = deviceSoup.find("p", {"id": "DeviceLocation"}).string
		self.inkStatus = int(str(indexSoup.find("span", {"id": "SupplyPLR0"})).split(">")[1].split("%")[0])
		isFull = None
		sheetCapacity = None
		totalCount = 0

		table = str(indexSoup.find("table", {"id": "MediaTable"}).tbody)
		for entry in table.split("span class="):
			if "status" in entry:
				isFull = "status-full" in entry
				sheetCapacity = entry.split("td")[2].split(">")[-1][:-2]
				if isFull and sheetCapacity:
					totalCount = totalCount + int(sheetCapacity.split(" ")[0])
		
		self.paperSupply = totalCount
		#print(self.inkStatus, self.paperSupply)

		jobSoup = BeautifulSoup(self.jobResponse.text, "lxml")
		name = "JobLogName_"
		user = "JobLogUser_"
		status = "JobLogStatus_"
		date = "JobLogData_"
		numTickets = self.jobResponse.text.count('class="PrintJobTicket">')
		numRecentTickets = 0
		for i in range(0, numTickets):
			time = jobSoup.find("td", {"id": date + str(i)}).string
			if len(time) < 22:
				time = time.split(" ")[0] + " 0" + time.split(" ")[1] + " " + time.split(" ")[2]
			
			if int(datetime.strptime(time, "%m/%d/%Y %I:%M:%S %p").now().strftime("%s")) * 1000 + 1800 > int(datetime.now().strftime("%s")):
				numRecentTickets = numRecentTickets + 1
		print(numRecentTickets)



class printerStatus(object):
	"""
	A class to store the information from all printers on campus
	not much more than a dictionary of individual printers
	And a function to go through the list and update our information
	"""
	def __init__(self, printerListFile):
		self.printerDicts = {}
		self.printerInfoDict = {}
		with open(printerListFile, 'r') as fil:
			red = fil.read()
			#print(red)
			red = red.replace('printerList = [', '{"printerList":[') + "}"
			io = StringIO(red)

			data = json.load(io)["printerList"]
			#print(data)
			for item in data:
				self.printerDicts[item["IPAddress"]] = item
			


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
	"""
	An extra worker to do all the printer data collection
	Intended to be used as a separate thread
	"""
	while(True):
		allPrinterStatuses = printerStatus("static/data/PrinterList3.json")
		allPrinterStatuses.query()
		sleep(60)


app = Flask(__name__, static_url_path="")
allPrinterStatuses = printerStatus("static/data/PrinterList3.json")
allPrinterStatuses.query()



@app.route("/")
def run_app():
	return "Hello, world"


@app.route("/api/v1/printers", methods=['GET'])
def get_printers():
	printers = {}
	for key in allPrinterStatuses.printerInfoDict:
		printers[key] ={
	'deviceName': allPrinterStatuses.printerInfoDict[key].deviceName,
	'inkStatus': allPrinterStatuses.printerInfoDict[key].inkStatus,
	'productName': allPrinterStatuses.printerInfoDict[key].productName,
	'deviceLocation': allPrinterStatuses.printerInfoDict[key].deviceLocation,
	'paperSupply': allPrinterStatuses.printerInfoDict[key].paperSupply,
	}
	return jsonify({'printers': printers})	



@app.route("/<path:path>")
def status_file(path):
	return app.send_static_file(path)


threads = []
t = threading.Thread(target=worker)
t.start()
